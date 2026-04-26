"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Quantum Core — the iconic centerpiece at the very center of Web4City.
 * A futuristic quantum computer tower with animated rings, glowing core, and energy beams.
 */

export default function QuantumCore() {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const topSphereRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Core pulse
    if (coreRef.current) {
      const pulse = 0.7 + Math.sin(t * 1.5) * 0.3;
      coreRef.current.scale.setScalar(pulse);
      (coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse * 4;
    }

    // Rotating rings at different speeds/directions
    if (ring1Ref.current) ring1Ref.current.rotation.y = t * 0.4;
    if (ring2Ref.current) ring2Ref.current.rotation.y = -t * 0.3;
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x = t * 0.25;
      ring3Ref.current.rotation.z = t * 0.15;
    }

    // Energy beam traveling up
    if (beamRef.current) {
      const cycle = (t * 0.5) % 1;
      beamRef.current.position.y = 50 + cycle * 350;
      (beamRef.current.material as THREE.MeshStandardMaterial).opacity = Math.sin(cycle * Math.PI) * 0.6;
    }

    // Top sphere glow
    if (topSphereRef.current) {
      const glow = 0.5 + Math.sin(t * 2) * 0.5;
      (topSphereRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = glow * 3;
      topSphereRef.current.scale.setScalar(1 + Math.sin(t * 1.2) * 0.1);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} userData={{ isLandmark: true }}>
      {/* Invisible hitbox for clicking */}
      <mesh position={[0, 200, 0]} visible={false}>
        <cylinderGeometry args={[40, 40, 400, 8]} />
        <meshBasicMaterial />
      </mesh>

      {/* Base platform — octagonal */}
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[35, 40, 6, 8]} />
        <meshStandardMaterial color="#1a0a1a" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Base ring — pinkish glow */}
      <mesh position={[0, 7, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[32, 2, 8, 8]} />
        <meshStandardMaterial
          color="#ec4899"
          emissive="#ec4899"
          emissiveIntensity={2}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Main tower shaft — bottom section */}
      <mesh position={[0, 80, 0]}>
        <cylinderGeometry args={[14, 20, 150, 8]} />
        <meshStandardMaterial color="#1a0a1a" roughness={0.15} metalness={0.95} />
      </mesh>

      {/* Middle section */}
      <mesh position={[0, 200, 0]}>
        <cylinderGeometry args={[10, 14, 150, 8]} />
        <meshStandardMaterial color="#150815" roughness={0.1} metalness={0.95} />
      </mesh>

      {/* Upper section */}
      <mesh position={[0, 320, 0]}>
        <cylinderGeometry args={[6, 10, 150, 8]} />
        <meshStandardMaterial color="#100610" roughness={0.05} metalness={1} />
      </mesh>

      {/* Top spike */}
      <mesh position={[0, 430, 0]}>
        <cylinderGeometry args={[0.5, 6, 120, 8]} />
        <meshStandardMaterial color="#0a0408" roughness={0.05} metalness={1} />
      </mesh>

      {/* Glowing core — quantum processor */}
      <mesh ref={coreRef} position={[0, 200, 0]}>
        <octahedronGeometry args={[8, 0]} />
        <meshStandardMaterial
          color="#f472b6"
          emissive="#ec4899"
          emissiveIntensity={3}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Floating ring 1 — lower */}
      <mesh ref={ring1Ref} position={[0, 120, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[24, 1.2, 8, 8]} />
        <meshStandardMaterial
          color="#f472b6"
          emissive="#ec4899"
          emissiveIntensity={2}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Floating ring 2 — middle */}
      <mesh ref={ring2Ref} position={[0, 250, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[18, 1, 8, 8]} />
        <meshStandardMaterial
          color="#c084fc"
          emissive="#a855f7"
          emissiveIntensity={2}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Floating ring 3 — upper, tilted */}
      <mesh ref={ring3Ref} position={[0, 350, 0]}>
        <torusGeometry args={[12, 0.8, 8, 8]} />
        <meshStandardMaterial
          color="#fb7185"
          emissive="#f43f5e"
          emissiveIntensity={2}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Energy beam traveling up */}
      <mesh ref={beamRef} position={[0, 50, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[16, 2.5, 8, 8]} />
        <meshStandardMaterial
          color="#f472b6"
          emissive="#ec4899"
          emissiveIntensity={3}
          transparent
          opacity={0}
        />
      </mesh>

      {/* Top beacon sphere */}
      <mesh ref={topSphereRef} position={[0, 460, 0]}>
        <sphereGeometry args={[6, 8, 8]} />
        <meshStandardMaterial
          color="#f9a8d4"
          emissive="#ec4899"
          emissiveIntensity={3}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Accent lines running up the tower */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((angle * Math.PI) / 180) * 15,
            200,
            Math.sin((angle * Math.PI) / 180) * 15,
          ]}
        >
          <boxGeometry args={[0.6, 380, 0.6]} />
          <meshStandardMaterial
            color="#f472b6"
            emissive="#ec4899"
            emissiveIntensity={0.8}
            transparent
            opacity={0.4}
          />
        </mesh>
      ))}

      {/* Point light for ambient glow */}
      <pointLight
        position={[0, 200, 0]}
        color="#ec4899"
        intensity={80}
        distance={300}
        decay={2}
      />
      <pointLight
        position={[0, 460, 0]}
        color="#f472b6"
        intensity={40}
        distance={200}
        decay={2}
      />
    </group>
  );
}
