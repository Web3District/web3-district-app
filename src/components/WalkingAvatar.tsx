"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/**
 * Walking Avatar — uses the character-b.glb's built-in walk animation.
 * Crossfades between idle (standing) and walk (moving) based on arrow key input.
 * Same approach as Agentshire NPCs.
 */
function WalkingAvatar() {
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const idleActionRef = useRef<THREE.AnimationAction | null>(null);
  const walkActionRef = useRef<THREE.AnimationAction | null>(null);
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const isWalkingRef = useRef(false);
  const keys = useRef<Record<string, boolean>>({});
  const { scene, animations } = useGLTF("/models/characters/character-b.glb");

  // Set up animation mixer and actions
  useEffect(() => {
    if (!scene || animations.length === 0) return;

    const mixer = new THREE.AnimationMixer(scene);
    mixerRef.current = mixer;

    // Find idle and walk clips by name
    const idleClip = animations.find(
      (c) => c.name.toLowerCase() === "idle"
    );
    const walkClip = animations.find(
      (c) => c.name.toLowerCase() === "walk"
    );

    // Set up idle action (looping)
    if (idleClip) {
      const action = mixer.clipAction(idleClip);
      action.setLoop(THREE.LoopRepeat);
      action.clampWhenFinished = false;
      idleActionRef.current = action;
    }

    // Set up walk action (looping)
    if (walkClip) {
      const action = mixer.clipAction(walkClip);
      action.setLoop(THREE.LoopRepeat);
      action.clampWhenFinished = false;
      walkActionRef.current = action;
    }

    // Start with idle animation
    if (idleActionRef.current) {
      idleActionRef.current.reset().fadeIn(0.3).play();
      currentActionRef.current = idleActionRef.current;
    }

    return () => {
      mixer.stopAllAction();
    };
  }, [scene, animations]);

  // Smooth crossfade between animations
  const crossFadeTo = (newAction: THREE.AnimationAction | null) => {
    if (!newAction || newAction === currentActionRef.current) return;
    const prevAction = currentActionRef.current;
    newAction.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(0.3).play();
    if (prevAction) {
      prevAction.fadeOut(0.3);
    }
    currentActionRef.current = newAction;
  };

  // Keyboard tracking — captures arrow keys and WASD
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
    };
    const onUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);

    // Update animation mixer
    if (mixerRef.current) {
      mixerRef.current.update(dt);
    }

    const speed = 50;
    const k = keys.current;

    let dx = 0, dz = 0;
    if (k["ArrowUp"] || k["KeyW"]) dz -= 1;
    if (k["ArrowDown"] || k["KeyS"]) dz += 1;
    if (k["ArrowLeft"] || k["KeyA"]) dx -= 1;
    if (k["ArrowRight"] || k["KeyD"]) dx += 1;

    const len = Math.sqrt(dx * dx + dz * dz);
    const wasWalking = isWalkingRef.current;
    isWalkingRef.current = len > 0;

    if (isWalkingRef.current) {
      dx = (dx / len) * speed * dt;
      dz = (dz / len) * speed * dt;
      groupRef.current.position.x += dx;
      groupRef.current.position.z += dz;
      // Face direction of movement
      groupRef.current.rotation.y = Math.atan2(dx, dz);

      // Switch to walk animation
      if (!wasWalking && walkActionRef.current) {
        crossFadeTo(walkActionRef.current);
      }
    } else {
      // Switch back to idle animation
      if (wasWalking && idleActionRef.current) {
        crossFadeTo(idleActionRef.current);
      }
    }

    // Clamp to plaza bounds
    groupRef.current.position.x = Math.max(
      -200,
      Math.min(200, groupRef.current.position.x)
    );
    groupRef.current.position.z = Math.max(
      -200,
      Math.min(200, groupRef.current.position.z)
    );
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={scene.clone(true)} scale={5.0} position={[0, 1.5, 0]} />
    </group>
  );
}

useGLTF.preload("/models/characters/character-b.glb");
