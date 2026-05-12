"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SponsorBuildingProps } from "../registry";

/**
 * Default landmark building for dynamically created sponsors.
 * A modern tower with customizable accent color.
 */
export default function DefaultLandmarkBuilding({
  themeAccent,
  themeWindowLit,
  themeFace,
}: SponsorBuildingProps) {
  const buildingRef = useRef<THREE.Group>(null);
  const windowRefs = useRef<THREE.Mesh[]>([]);

  // Animate windows
  useFrame((state) => {
    if (!buildingRef.current) return;
    
    windowRefs.current.forEach((mesh, i) => {
      if (mesh) {
        // Subtle flicker effect
        const flicker = Math.sin(state.clock.elapsedTime * 2 + i) * 0.1 + 0.9;
        mesh.material.opacity = flicker;
      }
    });
  });

  const buildingHeight = 400;
  const buildingWidth = 60;
  const buildingDepth = 60;

  // Generate window positions
  const windows = [];
  const floors = 20;
  const windowsPerFloor = 4;
  
  for (let floor = 0; floor < floors; floor++) {
    for (let w = 0; w < windowsPerFloor; w++) {
      const y = (floor / floors) * buildingHeight + 20;
      const x = (w % 2 === 0 ? -1 : 1) * (buildingWidth / 2 + 1);
      const z = (w < 2 ? -1 : 1) * (buildingDepth / 2 + 1);
      windows.push({ position: [x, y, z] as [number, number, number], key: `${floor}-${w}` });
    }
  }

  return (
    <group ref={buildingRef}>
      {/* Main building structure */}
      <mesh position={[0, buildingHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[buildingWidth, buildingHeight, buildingDepth]} />
        <meshStandardMaterial color={themeFace} roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Accent stripes */}
      {[0.2, 0.5, 0.8].map((ratio, i) => (
        <mesh key={`stripe-${i}`} position={[0, buildingHeight * ratio, 0]} castShadow>
          <boxGeometry args={[buildingWidth + 2, 8, buildingDepth + 2]} />
          <meshStandardMaterial color={themeAccent} emissive={themeAccent} emissiveIntensity={0.3} />
        </mesh>
      ))}

      {/* Windows */}
      {windows.map(({ position, key }) => (
        <mesh
          key={key}
          ref={(el) => { if (el) windowRefs.current[windowRefs.current.length] = el; }}
          position={position}
        >
          <boxGeometry args={[8, 10, 2]} />
          <meshStandardMaterial
            color={themeWindowLit[Math.floor(Math.random() * themeWindowLit.length)] ?? "#ffffaa"}
            emissive={themeWindowLit[Math.floor(Math.random() * themeWindowLit.length)] ?? "#ffffaa"}
            emissiveIntensity={0.5}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}

      {/* Rooftop antenna */}
      <mesh position={[0, buildingHeight + 30, 0]} castShadow>
        <cylinderGeometry args={[2, 3, 60, 8]} />
        <meshStandardMaterial color={themeAccent} metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Antenna light */}
      <mesh position={[0, buildingHeight + 60, 0]}>
        <sphereGeometry args={[3, 8, 8]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}
