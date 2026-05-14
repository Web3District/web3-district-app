"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

/**
 * Walking avatar with animated legs for walk mode.
 * Uses character-b.glb which has walk/run animations.
 */

export default function WalkingAvatar({ 
  position = [0, 0, 0] as [number, number, number],
  speed = 0,
}: { 
  position?: [number, number, number];
  speed?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/characters/character-b.glb");
  const { actions } = useAnimations(animations, groupRef);
  const [currentAction, setCurrentAction] = useState<string | null>(null);

  // Clone the scene to avoid shared state issues
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  // Debug: log available animations on first load
  useEffect(() => {
    if (scene) {
      console.log("✅ WalkingAvatar: Model loaded! Children:", scene.children.length);
    }
    if (animations && animations.length > 0) {
      console.log("🎬 WalkingAvatar animations available:", animations.map(a => a.name));
    }
  }, [scene, animations]);

  // Handle animation switching based on speed
  useEffect(() => {
    if (!actions) return;

    // Determine which animation should play
    let targetAnim = "idle";
    if (speed > 15) {
      targetAnim = "run";
    } else if (speed > 5) {
      targetAnim = "walk";
    }

    // Find the animation action (try multiple name variations)
    const findAction = (name: string) => {
      // Try exact match first
      if (actions[name]) return { name, action: actions[name] };
      
      // Try case variations
      const keys = Object.keys(actions);
      const lower = name.toLowerCase();
      const match = keys.find(k => 
        k.toLowerCase() === lower || 
        k.toLowerCase().includes(lower) ||
        lower.includes(k.toLowerCase())
      );
      if (match) return { name: match, action: actions[match] };
      
      return null;
    };

    const found = findAction(targetAnim);
    
    if (found && found.name !== currentAction) {
      console.log(`🎭 Switching animation: ${currentAction ?? "none"} → ${found.name} (speed: ${speed})`);
      
      // Fade out current action
      if (currentAction && actions[currentAction]) {
        actions[currentAction].fadeOut(0.2);
      }
      
      // Fade in new action
      found.action.reset();
      found.action.setEffectiveWeight(1);
      found.action.setEffectiveTimeScale(1);
      found.action.fadeIn(0.2);
      found.action.play();
      
      setCurrentAction(found.name);
    }
  }, [actions, speed, currentAction]);

  return (
    <group ref={groupRef} position={position}>
      {/* 50% smaller than plaza avatar for third-person view */}
      <primitive object={clonedScene} scale={1.75} position={[0, 1, 0]} />
    </group>
  );
}

useGLTF.preload("/models/characters/character-b.glb");
