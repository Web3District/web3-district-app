"use client";

import { useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

/**
 * Simple avatar character from the Agentshire Kenney collection.
 * Wanders around the plaza area with idle animation.
 */

export default function PlazaAvatar({ position = [0, 0, 0] as [number, number, number] }: { position?: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/characters/character-a.glb");
  const { actions } = useAnimations(animations, groupRef);

  // Clone the scene to avoid shared state issues
  const clonedScene = scene.clone(true);

  // Play idle animation if available
  const idleAction = actions["idle"] || actions["Idle"] || actions["mixamo.com"] || Object.values(actions)[0];
  if (idleAction) {
    idleAction.reset().fadeIn(0.5).play();
  }

  return (
    <group ref={groupRef} position={position}>
      <primitive object={clonedScene} scale={3.5} position={[0, 1, 0]} />
    </group>
  );
}

useGLTF.preload("/models/characters/character-a.glb");
