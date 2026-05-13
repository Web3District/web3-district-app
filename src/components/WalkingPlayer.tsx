"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * WalkingPlayer — Simple block player for walk mode.
 * WASD movement on ground plane, camera at head height.
 * Phase 1: Basic movement + floor-level camera.
 */
function WalkingPlayer({
  onPositionUpdate,
}: {
  onPositionUpdate?: (x: number, z: number) => void;
}) {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const keys = useRef<Record<string, boolean>>({});

  // Player state
  const pos = useRef(new THREE.Vector3(0, 0, 0));
  const rotation = useRef(0);
  const speed = useRef(0);

  // Camera state
  const camOffset = useRef(new THREE.Vector3(0, 3, 6)); // Behind and above
  const camLookOffset = useRef(new THREE.Vector3(0, 1, 0)); // Look at player center

  // Keyboard tracking
  useEffect(() => {
    const down = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const up = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);
    const k = keys.current;

    // Movement input
    let dx = 0, dz = 0;
    if (k["ArrowUp"] || k["KeyW"]) dz -= 1;
    if (k["ArrowDown"] || k["KeyS"]) dz += 1;
    if (k["ArrowLeft"] || k["KeyA"]) dx -= 1;
    if (k["ArrowRight"] || k["KeyD"]) dx += 1;

    const len = Math.sqrt(dx * dx + dz * dz);
    
    if (len > 0) {
      // Normalize and apply speed
      dx = (dx / len) * 20 * dt; // 20 units/sec walk speed
      dz = (dz / len) * 20 * dt;
      
      // Move player
      pos.current.x += dx;
      pos.current.z += dz;
      
      // Rotate to face movement direction
      rotation.current = Math.atan2(dx, dz);
      
      speed.current = 20;
    } else {
      speed.current = 0;
    }

    // Clamp to plaza bounds (-200 to 200)
    pos.current.x = Math.max(-200, Math.min(200, pos.current.x));
    pos.current.z = Math.max(-200, Math.min(200, pos.current.z));

    // Update group position
    groupRef.current.position.copy(pos.current);
    groupRef.current.rotation.y = rotation.current;

    // Update parent with position
    if (onPositionUpdate) {
      onPositionUpdate(pos.current.x, pos.current.z);
    }

    // Camera follow (third-person, behind player)
    const camX = pos.current.x - Math.sin(rotation.current) * camOffset.current.z;
    const camZ = pos.current.z - Math.cos(rotation.current) * camOffset.current.z;
    const camY = pos.current.y + camOffset.current.y;

    // Smooth camera movement
    camera.position.x += (camX - camera.position.x) * 0.1;
    camera.position.z += (camZ - camera.position.z) * 0.1;
    camera.position.y += (camY - camera.position.y) * 0.1;

    // Look at player
    const lookX = pos.current.x + Math.sin(rotation.current) * camLookOffset.current.z;
    const lookZ = pos.current.z + Math.cos(rotation.current) * camLookOffset.current.z;
    const lookY = pos.current.y + camLookOffset.current.y;
    camera.lookAt(lookX, lookY, lookZ);
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Simple glowing cylinder player */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 2, 16]} />
        <meshStandardMaterial
          color="#ed0584"
          emissive="#ed0584"
          emissiveIntensity={0.8}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
      {/* Glow effect */}
      <pointLight
        distance={10}
        intensity={1}
        color="#ed0584"
        position={[0, 1, 0]}
      />
    </group>
  );
}

export default WalkingPlayer;
