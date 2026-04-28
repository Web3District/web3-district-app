"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/**
 * Walking Avatar with built-in walk animation.
 * Uses character-b.glb's AnimationMixer applied to the cloned scene.
 */
function WalkingAvatar() {
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const idleActionRef = useRef<THREE.AnimationAction | null>(null);
  const walkActionRef = useRef<THREE.AnimationAction | null>(null);
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const isWalkingRef = useRef(false);
  const keys = useRef<Record<string, boolean>>({});
  const [clonedScene, setClonedScene] = useState<THREE.Group | null>(null);
  const { scene, animations } = useGLTF("/models/characters/character-b.glb");

  // Clone scene once and set up mixer on the clone
  useEffect(() => {
    if (!scene || animations.length === 0) return;

    const clone = scene.clone(true) as THREE.Group;
    setClonedScene(clone);

    // Create mixer on the CLONED scene (not the original)
    const mixer = new THREE.AnimationMixer(clone);
    mixerRef.current = mixer;

    // Find idle and walk clips
    const idleClip = animations.find(c => c.name.toLowerCase() === "idle");
    const walkClip = animations.find(c => c.name.toLowerCase() === "walk");

    if (idleClip) {
      const action = mixer.clipAction(idleClip);
      action.setLoop(THREE.LoopRepeat);
      action.clampWhenFinished = false;
      idleActionRef.current = action;
    }

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

    return () => { mixer.stopAllAction(); };
  }, [scene, animations]);

  // Crossfade between animations
  const crossFadeTo = (newAction: THREE.AnimationAction | null) => {
    if (!newAction || newAction === currentActionRef.current) return;
    const prev = currentActionRef.current;
    newAction.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(0.3).play();
    if (prev) prev.fadeOut(0.3);
    currentActionRef.current = newAction;
  };

  // Keyboard tracking
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const onUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);

    // Update mixer every frame
    if (mixerRef.current) mixerRef.current.update(dt);

    const speed = 50;
    const k = keys.current;
    let dx = 0, dz = 0;
    if (k['ArrowUp'] || k['KeyW']) dz -= 1;
    if (k['ArrowDown'] || k['KeyS']) dz += 1;
    if (k['ArrowLeft'] || k['KeyA']) dx -= 1;
    if (k['ArrowRight'] || k['KeyD']) dx += 1;

    const len = Math.sqrt(dx * dx + dz * dz);
    const wasWalking = isWalkingRef.current;
    isWalkingRef.current = len > 0;

    if (isWalkingRef.current) {
      dx = (dx / len) * speed * dt;
      dz = (dz / len) * speed * dt;
      groupRef.current.position.x += dx;
      groupRef.current.position.z += dz;
      groupRef.current.rotation.y = Math.atan2(dx, dz);

      // Switch to walk animation
      if (!wasWalking && walkActionRef.current) {
        crossFadeTo(walkActionRef.current);
      }
    } else {
      // Switch back to idle
      if (wasWalking && idleActionRef.current) {
        crossFadeTo(idleActionRef.current);
      }
    }

    groupRef.current.position.x = Math.max(-200, Math.min(200, groupRef.current.position.x));
    groupRef.current.position.z = Math.max(-200, Math.min(200, groupRef.current.position.z));
  });

  if (!clonedScene) return null;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={clonedScene} scale={5.0} position={[0, 1.5, 0]} />
    </group>
  );
}

useGLTF.preload("/models/characters/character-b.glb");

// ─── Click hook (same pattern as EArcadeLandmark) ───
function useBuildingClick(
  groupRef: React.RefObject<THREE.Group | null>,
  onClick: () => void,
) {
  const { gl, camera, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const ndc = useRef(new THREE.Vector2());
  const onClickRef = useRef(onClick);

  useEffect(() => { onClickRef.current = onClick; }, [onClick]);

  useEffect(() => {
    const canvas = gl.domElement;
    const hitsTarget = (e: PointerEvent): boolean => {
      const group = groupRef.current;
      if (!group) return false;
      const rect = canvas.getBoundingClientRect();
      ndc.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.current.setFromCamera(ndc.current, camera);
      const targetHits = raycaster.current.intersectObject(group, true);
      if (targetHits.length === 0) return false;
      const targetDistance = targetHits[0].distance;
      const sceneHits = raycaster.current.intersectObjects(scene.children, true);
      for (const hit of sceneHits) {
        if (hit.distance >= targetDistance) break;
        if ((hit.object as any).isInstancedMesh) return false;
        let obj: THREE.Object3D | null = hit.object;
        while (obj) {
          if (obj === group) break;
          if (obj.userData?.isLandmark) return false;
          obj = obj.parent;
        }
      }
      return true;
    };

    let tap: { time: number; x: number; y: number } | null = null;

    const onDown = (e: PointerEvent) => {
      if (hitsTarget(e)) {
        tap = { time: performance.now(), x: e.clientX, y: e.clientY };
      }
    };

    const onUp = (e: PointerEvent) => {
      if (!tap) return;
      const elapsed = performance.now() - tap.time;
      const dx = e.clientX - tap.x;
      const dy = e.clientY - tap.y;
      tap = null;
      if (elapsed > 400 || dx * dx + dy * dy > 625) return;
      onClickRef.current();
    };

    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    let lastMove = 0;
    const onMove = isTouch
      ? null
      : (e: PointerEvent) => {
          const now = performance.now();
          if (now - lastMove < 66) return;
          lastMove = now;
          if (hitsTarget(e)) {
            document.body.style.cursor = "pointer";
          } else if (document.body.style.cursor === "pointer") {
            document.body.style.cursor = "";
          }
        };

    canvas.addEventListener("pointerdown", onDown, true);
    window.addEventListener("pointerup", onUp, true);
    if (onMove) window.addEventListener("pointermove", onMove, true);
    return () => {
      canvas.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("pointerup", onUp, true);
      if (onMove) window.removeEventListener("pointermove", onMove, true);
      document.body.style.cursor = "";
    };
  }, [gl.domElement, camera, scene, groupRef]);
}

// ─── Label Helper (crisp text, no glow, no cuts) ───
function makeLabel(text: string, color: string): THREE.CanvasTexture {
  const canvas = typeof document !== 'undefined' ? document.createElement("canvas") : { width: 0, height: 0 } as HTMLCanvasElement;
  if ((canvas as any).width === 0) return new THREE.CanvasTexture();
  // Large canvas to prevent any text clipping
  const s = 1024;
  (canvas as HTMLCanvasElement).width = s;
  (canvas as HTMLCanvasElement).height = s;
  const ctx = (canvas as HTMLCanvasElement).getContext("2d")!;
  ctx.clearRect(0, 0, s, s);
  // Font sized to fit comfortably with padding
  ctx.font = 'bold 120px "Silkscreen", monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  // No shadow/glow — pure crisp text
  ctx.fillText(text.toUpperCase(), s / 2, s / 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  // NearestFilter for crisp pixel-art look (no blur)
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  return tex;
}

// ─── 1. AI District — Empire State Style ───
function BuildingAI({ name, position, height, accentColor, windowColors, onClick }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const beaconRef = useRef<THREE.Mesh>(null);
  useBuildingClick(groupRef, onClick);
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (beaconRef.current) {
      (beaconRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 2 + Math.sin(t * 2.5) * 1.5;
    }
  });

  const makeWindows = (px: number, py: number, pz: number, w: number, h: number, isX: boolean, face: string) => {
    const floors = Math.floor(h / 30);
    const cols = Math.floor(w / 8);
    const result: JSX.Element[] = [];
    for (let row = 0; row < floors; row++) {
      for (let col = 0; col < cols; col++) {
        const local = (col - (cols - 1) / 2) * 7;
        const y = py + row * 30;
        const color = windowColors[(row * cols + col) % windowColors.length];
        const key = `${face}-${isX ? 'x' : 'z'}-${row}-${col}`;
        result.push(
          <mesh key={key} position={isX ? [px, y, local] : [local, y, pz]}>
            <boxGeometry args={isX ? [0.15, 18, 4] : [4, 18, 0.15]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} transparent opacity={0.8} />
          </mesh>
        );
      }
    }
    return result;
  };

  const sections = [
    { w: 44, d: 38, h: height * 0.4 },
    { w: 36, d: 30, h: height * 0.3 },
    { w: 24, d: 20, h: height * 0.2 },
    { w: 12, d: 10, h: height * 0.1 },
  ];

  let yAccum = 0;
  return (
    <group ref={groupRef} position={position} userData={{ isLandmark: true }}>
      {sections.map((sec, i) => {
        const yPos = yAccum + sec.h / 2;
        const windows = [
          ...makeWindows(0, yAccum, sec.d / 2 + 0.1, sec.w, sec.h, false, 'front'),
          ...makeWindows(0, yAccum, -(sec.d / 2 + 0.1), sec.w, sec.h, false, 'back'),
          ...makeWindows(sec.w / 2 + 0.1, yAccum, 0, sec.d, sec.h, true, 'right'),
          ...makeWindows(-(sec.w / 2 + 0.1), yAccum, 0, sec.d, sec.h, true, 'left'),
        ];
        yAccum += sec.h;
        return (
          <group key={i}>
            <mesh position={[0, yPos, 0]}>
              <boxGeometry args={[sec.w, sec.h, sec.d]} />
              <meshStandardMaterial color={i === 3 ? "#1a0a1a" : "#0d0818"} roughness={0.2} metalness={0.8} />
            </mesh>
            {i < 3 && (
              <mesh position={[0, yAccum - 1, 0]}>
                <boxGeometry args={[sec.w + 3, 3, sec.d + 3]} />
                <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={1.5} transparent opacity={0.5} />
              </mesh>
            )}
            {windows}
          </group>
        );
      })}
      <mesh position={[0, height + 25, 0]}>
        <cylinderGeometry args={[0.3, 1.5, 50, 4]} />
        <meshStandardMaterial color="#1a1028" metalness={0.9} />
      </mesh>
      <mesh ref={beaconRef} position={[0, height + 50, 0]}>
        <sphereGeometry args={[2.5, 6, 6]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3} transparent opacity={0.9} />
      </mesh>
      <pointLight position={[0, height - 10, 0]} color={accentColor} intensity={25} distance={120} decay={2} />
      <sprite position={[0, height + 65, 0]} scale={[80, 80, 1]}>
        <spriteMaterial map={makeLabel(name, accentColor)} transparent depthTest={false} sizeAttenuation />
      </sprite>
    </group>
  );
}

// ─── 2. Web3 District — Twisted Helix Tower ───
function BuildingWeb3({ name, position, height, accentColor, windowColors, onClick }: any) {
  const groupRef = useRef<THREE.Group>(null);
  useBuildingClick(groupRef, onClick);
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.05;
  });

  const segments = 16;
  const segHeight = height / segments;
  const baseSize = 38;
  const topSize = 18;
  
  return (
    <group ref={groupRef} position={position} userData={{ isLandmark: true }}>
      {Array.from({ length: segments }, (_, i) => {
        const t = i / segments;
        const size = baseSize + (topSize - baseSize) * t;
        const twist = t * Math.PI * 0.5;
        const y = i * segHeight + segHeight / 2;
        const color = windowColors[i % windowColors.length];
        return (
          <group key={i} position={[0, y, 0]} rotation={[0, twist, 0]}>
            <mesh>
              <boxGeometry args={[size, segHeight - 1, size]} />
              <meshStandardMaterial color="#0d0818" roughness={0.2} metalness={0.8} />
            </mesh>
            <mesh position={[0, 0, size / 2 + 0.1]}>
              <boxGeometry args={[size * 0.7, segHeight * 0.5, 0.2]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} transparent opacity={0.7} />
            </mesh>
            <mesh position={[0, 0, -(size / 2 + 0.1)]}>
              <boxGeometry args={[size * 0.7, segHeight * 0.5, 0.2]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} transparent opacity={0.7} />
            </mesh>
            <mesh position={[size / 2 + 0.1, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[size * 0.7, segHeight * 0.5, 0.2]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} transparent opacity={0.7} />
            </mesh>
            <mesh position={[-(size / 2 + 0.1), 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[size * 0.7, segHeight * 0.5, 0.2]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} transparent opacity={0.7} />
            </mesh>
          </group>
        );
      })}
      <mesh position={[0, height + 3, 0]}>
        <octahedronGeometry args={[10, 0]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={2} transparent opacity={0.8} />
      </mesh>
      <pointLight position={[0, height, 0]} color={accentColor} intensity={25} distance={120} decay={2} />
      <sprite position={[0, height + 30, 0]} scale={[80, 80, 1]}>
        <spriteMaterial map={makeLabel(name, accentColor)} transparent depthTest={false} sizeAttenuation />
      </sprite>
    </group>
  );
}

// ─── 3. Quantum District — Floating Orb Tower + Antenna + Square Windows ───
function BuildingQuantum({ name, position, height, accentColor, windowColors, onClick }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const orbRef = useRef<THREE.Mesh>(null);
  useBuildingClick(groupRef, onClick);
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (orbRef.current) {
      orbRef.current.position.y = height + 15 + Math.sin(t * 1.5) * 5;
      orbRef.current.rotation.y = t * 0.8;
      (orbRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 2 + Math.sin(t * 2) * 1;
    }
  });

  const pillarHeight = height * 0.7;
  const windows: JSX.Element[] = [];
  const floors = Math.floor(pillarHeight / 30);
  const cols = 8;
  for (let row = 0; row < floors; row++) {
    for (let col = 0; col < cols; col++) {
      const angle = (col / cols) * Math.PI * 2;
      const r = 14.5;
      const y = 8 + row * 30;
      const color = windowColors[(row * cols + col) % windowColors.length];
      windows.push(
        <mesh key={`q-${row}-${col}`} position={[Math.cos(angle) * r, y, Math.sin(angle) * r]} rotation={[0, angle, 0]}>
          <boxGeometry args={[9, 20, 0.2]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} transparent opacity={0.85} />
        </mesh>
      );
    }
  }

  const squareWindows: JSX.Element[] = [];
  const sqFloors = Math.floor(pillarHeight / 35);
  const sqCols = 4;
  const sqSize = 5;
  for (let row = 0; row < sqFloors; row++) {
    for (let col = 0; col < sqCols; col++) {
      const x = (col - (sqCols - 1) / 2) * 7;
      const y = 10 + row * 35;
      const z = 14.5;
      const color = windowColors[(row * sqCols + col) % windowColors.length];
      squareWindows.push(
        <mesh key={`sq-${row}-${col}`} position={[x, y, z]}>
          <boxGeometry args={[sqSize, sqSize, 0.2]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} transparent opacity={0.85} />
        </mesh>
      );
    }
  }

  const antennaTop = height + 15;
  const antennaBottom = pillarHeight;
  const antennaH = antennaTop - antennaBottom;

  return (
    <group ref={groupRef} position={position} userData={{ isLandmark: true }}>
      <mesh position={[0, pillarHeight / 2, 0]}>
        <cylinderGeometry args={[15, 20, pillarHeight, 8]} />
        <meshStandardMaterial color="#0d0818" roughness={0.15} metalness={0.9} />
      </mesh>
      {windows}
      {squareWindows}
      <mesh position={[0, pillarHeight, 0]}>
        <torusGeometry args={[18, 1.5, 8, 8]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={2} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, antennaBottom + antennaH / 2, 0]}>
        <cylinderGeometry args={[1.2, 2, antennaH, 6]} />
        <meshStandardMaterial color="#1a1028" roughness={0.1} metalness={0.95} />
      </mesh>
      <mesh position={[0, antennaBottom + antennaH * 0.5, 2.5]}>
        <planeGeometry args={[14, 3]} />
        <meshStandardMaterial map={makeLabel(name, accentColor)} emissive={accentColor} emissiveIntensity={2} transparent opacity={0.9} depthWrite={false} />
      </mesh>
      <mesh ref={orbRef} position={[0, height + 15, 0]}>
        <icosahedronGeometry args={[12, 1]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3} transparent opacity={0.85} wireframe />
      </mesh>
      <mesh position={[0, height + 15, 0]}>
        <icosahedronGeometry args={[8, 0]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={2} transparent opacity={0.6} />
      </mesh>
      <pointLight position={[0, height + 15, 0]} color={accentColor} intensity={30} distance={150} decay={2} />
      <sprite position={[0, height + 50, 0]} scale={[80, 80, 1]}>
        <spriteMaterial map={makeLabel(name, accentColor)} transparent depthTest={false} sizeAttenuation />
      </sprite>
    </group>
  );
}

// ─── 4. Growth District — Zigzag / Sawtooth Tower ───
function BuildingGrowth({ name, position, height, accentColor, windowColors, onClick }: any) {
  const groupRef = useRef<THREE.Group>(null);
  useBuildingClick(groupRef, onClick);
  const floors = 14;
  const segH = height / floors;
  const baseW = 36;
  const baseD = 30;
  const topW = 20;
  const topD = 16;
  
  return (
    <group ref={groupRef} position={position} userData={{ isLandmark: true }}>
      {Array.from({ length: floors }, (_, i) => {
        const t = i / floors;
        const w = baseW + (topW - baseW) * t;
        const d = baseD + (topD - baseD) * t;
        const y = i * segH + segH / 2;
        const offset = (i % 2 === 0) ? 3 : -3;
        const offsetZ = (i % 2 === 0) ? 2 : -2;
        const color = windowColors[i % windowColors.length];
        return (
          <group key={i} position={[offset, y, offsetZ]}>
            <mesh><boxGeometry args={[w, segH - 1, d]} /><meshStandardMaterial color="#0d0818" roughness={0.25} metalness={0.8} /></mesh>
            {Array.from({ length: Math.floor(w / 8) }, (_, c) => {
              const x = (c - (Math.floor(w / 8) - 1) / 2) * 7;
              return <mesh key={`f-${c}`} position={[x, 0, d / 2 + 0.1]}><boxGeometry args={[4, 16, 0.15]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} transparent opacity={0.8} /></mesh>;
            })}
            {Array.from({ length: Math.floor(w / 8) }, (_, c) => {
              const x = (c - (Math.floor(w / 8) - 1) / 2) * 7;
              return <mesh key={`b-${c}`} position={[x, 0, -(d / 2 + 0.1)]}><boxGeometry args={[4, 16, 0.15]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} transparent opacity={0.8} /></mesh>;
            })}
            {Array.from({ length: Math.floor(d / 8) }, (_, c) => {
              const z = (c - (Math.floor(d / 8) - 1) / 2) * 7;
              return <mesh key={`r-${c}`} position={[w / 2 + 0.1, 0, z]} rotation={[0, Math.PI / 2, 0]}><boxGeometry args={[4, 16, 0.15]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} transparent opacity={0.8} /></mesh>;
            })}
            {Array.from({ length: Math.floor(d / 8) }, (_, c) => {
              const z = (c - (Math.floor(d / 8) - 1) / 2) * 7;
              return <mesh key={`l-${c}`} position={[-(w / 2 + 0.1), 0, z]} rotation={[0, Math.PI / 2, 0]}><boxGeometry args={[4, 16, 0.15]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} transparent opacity={0.8} /></mesh>;
            })}
          </group>
        );
      })}
      <mesh position={[0, height + 15, 0]}><boxGeometry args={[20, 4, 4]} /><meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={2} transparent opacity={0.7} /></mesh>
      <mesh position={[0, height + 35, 0]}><sphereGeometry args={[3, 6, 6]} /><meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3} transparent opacity={0.9} /></mesh>
      <pointLight position={[0, height, 0]} color={accentColor} intensity={20} distance={100} decay={2} />
      <sprite position={[0, height + 50, 0]} scale={[80, 80, 1]}>
        <spriteMaterial map={makeLabel(name, accentColor)} transparent depthTest={false} sizeAttenuation />
      </sprite>
    </group>
  );
}

// ─── 5. VC District — Vault / Safe Style ───
function BuildingVC({ name, position, height, accentColor, windowColors, onClick }: any) {
  const groupRef = useRef<THREE.Group>(null);
  useBuildingClick(groupRef, onClick);
  
  const makeWindows = (px: number, py: number, pz: number, w: number, h: number, isX: boolean, face: string) => {
    const floors = Math.floor(h / 30);
    const cols = Math.floor(w / 10);
    const result: JSX.Element[] = [];
    for (let row = 0; row < floors; row++) {
      for (let col = 0; col < cols; col++) {
        const local = (col - (cols - 1) / 2) * 9;
        const y = py + row * 30;
        const color = windowColors[(row * cols + col) % windowColors.length];
        result.push(
          <mesh key={`${face}-${isX ? 'x' : 'z'}-${row}-${col}`} position={isX ? [px, y, local] : [local, y, pz]}>
            <boxGeometry args={isX ? [0.2, 20, 5] : [5, 20, 0.2]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} transparent opacity={0.8} />
          </mesh>
        );
      }
    }
    return result;
  };

  const baseW = 48;
  const baseD = 42;
  const bodyH = height * 0.75;
  const crownH = height * 0.25;
  const crownW = 44;
  const crownD = 38;

  return (
    <group ref={groupRef} position={position} userData={{ isLandmark: true }}>
      <mesh position={[0, bodyH / 2, 0]}><boxGeometry args={[baseW, bodyH, baseD]} /><meshStandardMaterial color="#120a18" roughness={0.3} metalness={0.85} /></mesh>
      {makeWindows(0, 0, baseD / 2 + 0.1, baseW, bodyH, false, 'front')}
      {makeWindows(0, 0, -(baseD / 2 + 0.1), baseW, bodyH, false, 'back')}
      {makeWindows(baseW / 2 + 0.1, 0, 0, baseD, bodyH, true, 'right')}
      {makeWindows(-(baseW / 2 + 0.1), 0, 0, baseD, bodyH, true, 'left')}
      <mesh position={[0, bodyH + crownH / 2, 0]}><boxGeometry args={[crownW, crownH, crownD]} /><meshStandardMaterial color="#1a0a1a" roughness={0.15} metalness={0.95} /></mesh>
      <mesh position={[0, bodyH, 0]}><boxGeometry args={[baseW + 4, 5, baseD + 4]} /><meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={2} transparent opacity={0.8} /></mesh>
      {[[1, 1], [-1, 1], [1, -1], [-1, -1]].map(([sx, sz], i) => (
        <mesh key={i} position={[sx * (crownW / 2 + 1), bodyH + crownH + 10, sz * (crownD / 2 + 1)]}>
          <cylinderGeometry args={[2, 2, 20, 6]} /><meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={1.5} transparent opacity={0.6} />
        </mesh>
      ))}
      <mesh position={[0, bodyH * 0.4, baseD / 2 + 1]}><torusGeometry args={[8, 2, 8, 12]} /><meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={1.5} transparent opacity={0.7} /></mesh>
      <pointLight position={[0, bodyH, 0]} color={accentColor} intensity={25} distance={120} decay={2} />
      <sprite position={[0, height + 40, 0]} scale={[80, 80, 1]}>
        <spriteMaterial map={makeLabel(name, accentColor)} transparent depthTest={false} sizeAttenuation />
      </sprite>
    </group>
  );
}

// ─── Export ───
interface DistrictTowersProps {
  onDistrictClick?: (slug: string) => void;
}

export default function DistrictTowers({ onDistrictClick }: DistrictTowersProps) {
  return (
    <>
      <BuildingAI name="AI" position={[0, 0, -160]} height={380} accentColor="#f43f5e" windowColors={["#f43f5e", "#fb7185", "#e11d48", "#fda4af", "#f472b6"]} onClick={() => onDistrictClick?.("ai-lobby")} />
      <BuildingWeb3 name="Web3" position={[152, 0, -50]} height={350} accentColor="#a855f7" windowColors={["#a855f7", "#c084fc", "#7c3aed", "#d8b4fe", "#9333ea"]} onClick={() => onDistrictClick?.("web3-lobby")} />
      <BuildingQuantum name="Quantum" position={[94, 0, 130]} height={420} accentColor="#06b6d4" windowColors={["#06b6d4", "#22d3ee", "#0891b2", "#67e8f9", "#0e7490"]} onClick={() => onDistrictClick?.("quantum-lobby")} />
      <BuildingGrowth name="Growth" position={[-94, 0, 130]} height={340} accentColor="#22c55e" windowColors={["#22c55e", "#4ade80", "#16a34a", "#86efac", "#15803d"]} onClick={() => onDistrictClick?.("growth-lobby")} />
      <BuildingVC name="VC" position={[-152, 0, -50]} height={360} accentColor="#eab308" windowColors={["#eab308", "#facc15", "#ca8a04", "#fde047", "#a16207"]} onClick={() => onDistrictClick?.("vc-lobby")} />
      <WalkingAvatar />
    </>
  );
}
