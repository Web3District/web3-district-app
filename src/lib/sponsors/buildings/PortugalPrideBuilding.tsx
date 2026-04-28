"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SponsorBuildingProps } from "../registry";

// ─── Portugal Pride Building - Rainbow Celebration ───────────────────
// Tall pride tower with rainbow flag and colorful windows
const BUILDING_WIDTH = 100;
const BUILDING_DEPTH = 100;
const BUILDING_HEIGHT = 500;

// Rainbow colors
const RAINBOW_COLORS = [
  "#FF0000", // Red
  "#FF7F00", // Orange
  "#FFFF00", // Yellow
  "#00FF00", // Green
  "#0000FF", // Blue
  "#8B00FF", // Violet
];

// Portugal colors
const PORTUGAL_GREEN = "#006600";
const PORTUGAL_RED = "#FF0000";

// ─── Pixel font for "PORTUGAL PRIDE" ─────────────────────────────────
const PF: Record<string, number[][]> = {
  P: [[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,0,0],[1,0,0,0]],
  O: [[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
  R: [[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,1,0],[1,0,0,1]],
  T: [[1,1,1,1],[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],
  U: [[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
  G: [[0,1,1,1],[1,0,0,0],[1,0,1,1],[1,0,0,1],[0,1,1,0]],
  A: [[0,1,1,0],[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1]],
  L: [[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,1,1,1]],
  I: [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[1,1,1]],
  D: [[1,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,1,1,0]],
  E: [[1,1,1,1],[1,0,0,0],[1,1,1,0],[1,0,0,0],[1,1,1,1]],
};

function makeBitmap(word: string): number[][] {
  const letters = word.split(" ").map(w => w.split("").map(ch => PF[ch] || PF['A']));
  const h = 5;
  let w = 0;
  for (const word of letters) {
    for (const letter of word) { w += letter[0].length; }
    w += 1; // space between words
  }
  const bm = Array.from({ length: h }, () => Array(w).fill(0));
  let col = 0;
  for (const word of letters) {
    for (const letter of word) {
      for (let r = 0; r < h; r++) {
        for (let c = 0; c < letter[0].length; c++) {
          bm[r][col + c] = letter[r][c];
        }
      }
      col += letter[0].length + 1;
    }
    col += 1; // extra space between words
  }
  return bm;
}

const PORTUGAL_TEXT = makeBitmap("PORTUGAL");
const PRIDE_TEXT = makeBitmap("PRIDE");

// ─── Rainbow flag texture ──────────────────────────────────────
function createRainbowFlagTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 156; // 6 stripes
  const ctx = canvas.getContext("2d")!;
  
  const stripeHeight = 156 / 6;
  RAINBOW_COLORS.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, i * stripeHeight, 256, stripeHeight);
  });
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

// ─── Colorful windows texture ──────────────────────────────────────
function createPrideWindowTexture(
  cols: number,
  rows: number,
  seed: number,
): THREE.CanvasTexture {
  const cW = 16, cH = 16;
  const w = cols * cW, h = rows * cH;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  
  // Dark background
  ctx.fillStyle = "#1a0a1a";
  ctx.fillRect(0, 0, w, h);
  
  // Rainbow windows
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const hash = ((r * 13 + c * 23 + seed) * 2654435761) >>> 0;
      const isLit = (hash % 3) !== 0; // 2/3 windows lit
      
      if (isLit) {
        // Pick a rainbow color based on position
        const colorIndex = (r + c + seed) % RAINBOW_COLORS.length;
        ctx.fillStyle = RAINBOW_COLORS[colorIndex];
        
        // Add some glow
        ctx.shadowColor = RAINBOW_COLORS[colorIndex];
        ctx.shadowBlur = 8;
        
        // Window with slight variation
        const variation = (hash % 30) - 15;
        const brightness = 1 + variation / 100;
        ctx.globalAlpha = 0.7 + (hash % 30) / 100;
        
        ctx.fillRect(c * cW + 2, r * cH + 2, cW - 4, cH - 4);
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      } else {
        // Dark window
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(c * cW + 2, r * cH + 2, cW - 4, cH - 4);
      }
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

// ─── Main Component ──────────────────────────────────────
export function PortugalPrideBuilding({
  position,
  rotation = 0,
  scale = 1,
}: SponsorBuildingProps) {
  const groupRef = useRef<THREE.Group>(null);
  const flagRef = useRef<THREE.Mesh>(null);
  
  const rainbowFlagTexture = useMemo(() => createRainbowFlagTexture(), []);
  
  const cols = Math.floor(BUILDING_WIDTH / 10);
  const rows = Math.floor(BUILDING_HEIGHT / 10);
  const windowTexture = useMemo(
    () => createPrideWindowTexture(cols, rows, 42),
    [cols, rows]
  );

  // Gentle flag animation
  useFrame((state) => {
    if (flagRef.current) {
      flagRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      flagRef.current.position.x = Math.sin(state.clock.elapsedTime * 2) * 2;
    }
    
    // Subtle building pulse
    if (groupRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      groupRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Main building tower */}
      <mesh position={[0, BUILDING_HEIGHT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[BUILDING_WIDTH, BUILDING_HEIGHT, BUILDING_DEPTH]} />
        <meshStandardMaterial
          map={windowTexture}
          emissive="#ff00ff"
          emissiveIntensity={0.3}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      
      {/* Rainbow flag pole */}
      <mesh position={[0, BUILDING_HEIGHT + 30, 0]} castShadow>
        <cylinderGeometry args={[2, 2, 80, 8]} />
        <meshStandardMaterial color="#silver" metalness={1} roughness={0.2} />
      </mesh>
      
      {/* Rainbow flag */}
      <mesh ref={flagRef} position={[30, BUILDING_HEIGHT + 30, 0]} castShadow>
        <planeGeometry args={[60, 36]} />
        <meshStandardMaterial
          map={rainbowFlagTexture}
          side={THREE.DoubleSide}
          transparent
          opacity={0.95}
        />
      </mesh>
      
      {/* "PORTUGAL" sign - top section */}
      <group position={[0, BUILDING_HEIGHT - 50, BUILDING_DEPTH / 2 + 1]}>
        {PORTUGAL_TEXT.map((row, rowIndex) =>
          row.map((pixel, colIndex) =>
            pixel ? (
              <mesh
                key={`portugal-${rowIndex}-${colIndex}`}
                position={[
                  (colIndex - PORTUGAL_TEXT[0].length / 2) * 8,
                  -(rowIndex * 8),
                  0
                ]}
              >
                <boxGeometry args={[6, 6, 2]} />
                <meshStandardMaterial
                  color={PORTUGAL_GREEN}
                  emissive={PORTUGAL_GREEN}
                  emissiveIntensity={2}
                />
              </mesh>
            ) : null
          )
        )}
      </group>
      
      {/* "PRIDE" sign - below PORTUGAL */}
      <group position={[0, BUILDING_HEIGHT - 100, BUILDING_DEPTH / 2 + 1]}>
        {PRIDE_TEXT.map((row, rowIndex) =>
          row.map((pixel, colIndex) =>
            pixel ? (
              <mesh
                key={`pride-${rowIndex}-${colIndex}`}
                position={[
                  (colIndex - PRIDE_TEXT[0].length / 2) * 8,
                  -(rowIndex * 8),
                  0
                ]}
              >
                <boxGeometry args={[6, 6, 2]} />
                <meshStandardMaterial
                  color={RAINBOW_COLORS[rowIndex % RAINBOW_COLORS.length]}
                  emissive={RAINBOW_COLORS[rowIndex % RAINBOW_COLORS.length]}
                  emissiveIntensity={2}
                />
              </mesh>
            ) : null
          )
        )}
      </group>
      
      {/* Rainbow base platform */}
      <mesh position={[0, 2, 0]} receiveShadow>
        <cylinderGeometry args={[BUILDING_WIDTH, BUILDING_WIDTH + 20, 4, 8]} />
        <meshStandardMaterial
          color="#2a0a2a"
          emissive="#ff00ff"
          emissiveIntensity={0.5}
          roughness={0.8}
        />
      </mesh>
      
      {/* Rainbow ring around base */}
      {RAINBOW_COLORS.map((color, i) => (
        <mesh
          key={color}
          position={[0, 1, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry
            args={[
              BUILDING_WIDTH / 2 + 10 + i * 3,
              BUILDING_WIDTH / 2 + 13 + i * 3,
              32
            ]}
          />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      
      {/* Particle glow effect */}
      <pointLight
        position={[0, BUILDING_HEIGHT / 2, 0]}
        color="#ff00ff"
        intensity={2}
        distance={1000}
      />
    </group>
  );
}
