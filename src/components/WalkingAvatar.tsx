"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations, useTexture } from "@react-three/drei";
import * as THREE from "three";

/**
 * Walking avatar with animated legs for walk mode.
 * Uses character-b.glb which has walk/run animations.
 * Reads speed from ref for instant response (no React render delay).
 */

export default function WalkingAvatar({ 
  position = [0, 0, 0] as [number, number, number],
  speedRef,
  isJumpingRef,
}: { 
  position?: [number, number, number];
  speedRef?: React.MutableRefObject<number>;
  isJumpingRef?: React.MutableRefObject<boolean>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/characters/character-b-ninja.glb");
  const { actions } = useAnimations(animations, groupRef);
  
  // Track current animation for smooth transitions
  const currentActionRef = useRef<string | null>(null);
  const lastSpeedRef = useRef(0);
  const lastIsJumpingRef = useRef(false);

  // Debug: log available animations on first load
  useEffect(() => {
    if (scene) {
      console.log("✅ WalkingAvatar: Model loaded! Children:", scene.children.length);
    }
    if (animations && animations.length > 0) {
      console.log("🎬 WalkingAvatar animations available:", animations.map(a => a.name));
    }
  }, [scene, animations]);

  // Check speed every frame for instant animation switching
  useFrame(() => {
    if (!actions || !speedRef) return;
    
    const speed = speedRef.current;
    const isJumping = isJumpingRef?.current ?? false;
    
    // Check if jumping state changed (for instant landing response)
    const jumpingChanged = (isJumpingRef && lastIsJumpingRef.current !== isJumping);
    lastIsJumpingRef.current = isJumping;
    
    // Only check if speed changed significantly OR jumping state changed
    if (!jumpingChanged && Math.abs(speed - lastSpeedRef.current) < 0.1) return;
    lastSpeedRef.current = speed;

    // Determine which animation should play
    // During jump: keep sprint pose (legs extended)
    // On landing: immediately switch based on speed
    let targetAnim = "idle";
    if (isJumping) {
      targetAnim = "sprint"; // Keep legs extended during jump
    } else if (speed > 15) {
      targetAnim = "sprint";
    } else if (speed > 5) {
      targetAnim = "walk";
    }

    // Switch immediately if different
    if (targetAnim !== currentActionRef.current && actions[targetAnim]) {
      console.log(`🎭 Switching: ${currentActionRef.current ?? "none"} → ${targetAnim} (speed: ${speed.toFixed(1)}, jumping: ${isJumping})`);
      
      // Cross-fade with minimal delay for instant response
      const fadeDuration = 0.05; // Super fast fade (was 0.2)
      
      // Fade out current action
      if (currentActionRef.current && actions[currentActionRef.current]) {
        actions[currentActionRef.current].fadeOut(fadeDuration);
      }
      
      // Fade in new action immediately
      const action = actions[targetAnim];
      action.reset();
      action.setEffectiveWeight(1);
      action.setEffectiveTimeScale(1);
      action.fadeIn(fadeDuration);
      action.play();
      
      currentActionRef.current = targetAnim;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 50% smaller than plaza avatar for third-person view */}
      <primitive object={clonedScene} scale={1.75} position={[0, 1, 0]} />
    </group>
  );
}

useGLTF.preload("/models/characters/character-b-ninja.glb");
