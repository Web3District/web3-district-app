"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import WalkingAvatar from "./WalkingAvatar";

/**
 * WalkingPlayer — Third-person walk mode controller.
 * Camera-relative WASD/Arrow movement (like third-person games).
 * Full city exploration (3500 unit radius).
 */
function WalkingPlayer({
  onPositionUpdate,
  posRef,
}: {
  onPositionUpdate?: (x: number, z: number) => void;
  posRef?: React.MutableRefObject<THREE.Vector3>;
}) {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const keys = useRef<Record<string, boolean>>({});

  // Player state - start in open plaza area (clear view, no obstructions)
  const pos = useRef(new THREE.Vector3(150, 0, 150)); // Start in open plaza, away from buildings
  const rotation = useRef(0);
  const speed = useRef(0);
  const MAX_SPEED = 20; // Walking speed
  
  // Jump physics
  const velocityY = useRef(0);
  const isJumping = useRef(false);
  const GRAVITY = -30;
  const JUMP_FORCE = 12;

  // Camera state - third-person with good viewing angle
  const camDistance = useRef(25); // Distance behind player
  const camHeight = useRef(4); // Height above player
  const camLookHeight = useRef(5); // Look at this height on player

  // Initialize camera on mount - third-person view behind player
  useEffect(() => {
    // Set initial camera position behind and above player
    const initialCamX = pos.current.x - Math.sin(rotation.current) * camDistance.current;
    const initialCamZ = pos.current.z - Math.cos(rotation.current) * camDistance.current;
    const initialCamY = pos.current.y + camHeight.current;
    camera.position.set(initialCamX, initialCamY, initialCamZ);
    camera.lookAt(pos.current.x, pos.current.y + camLookHeight.current, pos.current.z);
  }, [camera]);

  // Keyboard tracking
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
    };
    const up = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);
    const k = keys.current;

    // Get camera direction for camera-relative controls
    const camDir = new THREE.Vector3();
    state.camera.getWorldDirection(camDir);
    camDir.y = 0; // Flatten to XZ plane
    camDir.normalize();
    
    const camRight = new THREE.Vector3(-camDir.z, 0, camDir.x); // Perpendicular to camera

    // Movement input (camera-relative)
    let moveDir = new THREE.Vector3(0, 0, 0);
    if (k["ArrowUp"] || k["KeyW"]) moveDir.add(camDir); // Forward relative to camera
    if (k["ArrowDown"] || k["KeyS"]) moveDir.sub(camDir); // Backward relative to camera
    if (k["ArrowLeft"] || k["KeyA"]) moveDir.sub(camRight); // Left relative to camera
    if (k["ArrowRight"] || k["KeyD"]) moveDir.add(camRight); // Right relative to camera

    // Handle jump
    if ((k["Space"]) && !isJumping.current) {
      velocityY.current = JUMP_FORCE;
      isJumping.current = true;
    }

    const len = moveDir.length();
    
    if (len > 0) {
      moveDir.normalize();
      
      // Smooth turning towards movement direction
      const targetRotation = Math.atan2(moveDir.x, moveDir.z);
      let diff = targetRotation - rotation.current;
      // Normalize angle to -PI to PI
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      rotation.current += diff * 0.15; // Smooth turn (15% per frame)
      
      // Move player in rotation direction
      const moveSpeed = MAX_SPEED * dt;
      pos.current.x += Math.sin(rotation.current) * moveSpeed;
      pos.current.z += Math.cos(rotation.current) * moveSpeed;
      
      speed.current = MAX_SPEED;
    } else {
      // Instant stop when no input
      speed.current = 0;
    }

    // Apply gravity and update Y position
    if (isJumping.current) {
      velocityY.current += GRAVITY * dt;
      pos.current.y += velocityY.current * dt;
      
      // Ground collision
      if (pos.current.y <= 0) {
        pos.current.y = 0;
        velocityY.current = 0;
        isJumping.current = false;
      }
    }

    // Clamp to city bounds (-3500 to 3500)
    const cityRadius = 3500;
    pos.current.x = Math.max(-cityRadius, Math.min(cityRadius, pos.current.x));
    pos.current.z = Math.max(-cityRadius, Math.min(cityRadius, pos.current.z));

    // Update group position
    if (groupRef.current) {
      groupRef.current.position.copy(pos.current);
      groupRef.current.rotation.y = rotation.current;
    }

    // Update position ref for collectibles
    if (posRef) {
      posRef.current.copy(pos.current);
    }

    // Update parent with position
    if (onPositionUpdate) {
      onPositionUpdate(pos.current.x, pos.current.z);
    }

    // Camera follow (third-person, behind player - tracks Y position for jumps)
    const camX = pos.current.x - Math.sin(rotation.current) * camDistance.current;
    const camZ = pos.current.z - Math.cos(rotation.current) * camDistance.current;
    const camY = pos.current.y + camHeight.current;

    // Smooth camera movement
    camera.position.x += (camX - camera.position.x) * 0.1;
    camera.position.z += (camZ - camera.position.z) * 0.1;
    camera.position.y += (camY - camera.position.y) * 0.1;

    // Look at player (adjusted for jump height)
    camera.lookAt(pos.current.x, pos.current.y + camLookHeight.current, pos.current.z);
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} rotation={[0, rotation.current, 0]}>
      {/* Animated walking avatar - speed ref for instant updates */}
      <WalkingAvatar position={[0, 0, 0]} speedRef={speed} />
    </group>
  );
}

export default WalkingPlayer;
