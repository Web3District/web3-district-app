"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, PerspectiveCamera, Environment } from "@react-three/drei";
import * as THREE from "three";
import { gridToWorldPos } from "@/lib/sponsors/registry";

interface LandmarkPlacerProps {
  existingLandmarks?: Array<{ grid_x: number; grid_z: number; name: string }>;
  onPositionSelect: (gridX: number, gridZ: number) => void;
  onCancel: () => void;
}

// Grid constants (must match github.ts and registry.tsx)
const BLOCK_FOOTPRINT_X = 161;
const BLOCK_FOOTPRINT_Z = 137;
const STREET_W = 12;
const GRID_SIZE = 20; // Show 20x20 grid

function PlacementMarker({ position, selected }: { position: [number, number, number]; selected: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && selected) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
    }
  });

  return (
    <group position={position}>
      {/* Ghost building preview */}
      <mesh ref={meshRef} position={[0, 50, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[40, 100, 40]} />
        <meshStandardMaterial 
          color={selected ? "#ed0584" : "#6090e0"} 
          transparent 
          opacity={0.6}
          wireframe={!selected}
        />
      </mesh>
      
      {/* Ground marker */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
        <ringGeometry args={[30, 35, 32]} />
        <meshBasicMaterial color={selected ? "#ed0584" : "#6090e0"} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function ClickableGround({ onGroundClick }: { onGroundClick: (x: number, z: number) => void }) {
  const { camera, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const ndc = useRef(new THREE.Vector2());

  const handleClick = useCallback((e: THREE.PointerEvent) => {
    ndc.current.x = (e.clientX / gl.domElement.clientWidth) * 2 - 1;
    ndc.current.y = -(e.clientY / gl.domElement.clientHeight) * 2 + 1;
    
    raycaster.current.setFromCamera(ndc.current, camera);
    
    const intersection = new THREE.Vector3();
    raycaster.current.ray.intersectPlane(plane.current, intersection);
    
    // Convert world position to grid coordinates
    const gridX = Math.round(intersection.x / (BLOCK_FOOTPRINT_X + STREET_W));
    const gridZ = Math.round(intersection.z / (BLOCK_FOOTPRINT_Z + STREET_W));
    
    onGroundClick(gridX, gridZ);
  }, [camera, gl, onGroundClick]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} onPointerDown={handleClick}>
      <planeGeometry args={[1000, 1000]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  );
}

function ExistingLandmarks({ landmarks }: { landmarks: Array<{ grid_x: number; grid_z: number; name: string }> }) {
  return (
    <>
      {landmarks.map((lm, i) => {
        const pos = gridToWorldPos(lm.grid_x, lm.grid_z);
        return (
          <group key={i} position={pos}>
            <mesh position={[0, 30, 0]}>
              <boxGeometry args={[30, 60, 30]} />
              <meshStandardMaterial color="#8c8c9c" transparent opacity={0.4} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
              <ringGeometry args={[25, 30, 16]} />
              <meshBasicMaterial color="#8c8c9c" transparent opacity={0.6} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

export default function LandmarkPlacer({ existingLandmarks = [], onPositionSelect, onCancel }: LandmarkPlacerProps) {
  const [selectedGridPos, setSelectedGridPos] = useState<[number, number] | null>(null);
  const [status, setStatus] = useState<"selecting" | "confirming">("selecting");

  const handleGroundClick = useCallback((gridX: number, gridZ: number) => {
    setSelectedGridPos([gridX, gridZ]);
    setStatus("confirming");
  }, []);

  const handleConfirm = () => {
    if (selectedGridPos) {
      onPositionSelect(selectedGridPos[0], selectedGridPos[1]);
    }
  };

  const selectedWorldPos = selectedGridPos 
    ? gridToWorldPos(selectedGridPos[0], selectedGridPos[1])
    : null;

  return (
    <div className="relative w-full h-[600px] bg-[#0d0d0f] rounded-none border-4 border-[#1a1a24] overflow-hidden">
      {/* Info overlay */}
      <div className="absolute top-4 left-4 z-10 bg-[#161618]/90 border border-[#2a2a30] px-4 py-3 rounded-none">
        <h3 className="text-[#ed0584] font-pixel mb-2">🏗️ Place Landmark</h3>
        <p className="text-sm text-[#8c8c9c] mb-2">
          Click on the grid to place your landmark
        </p>
        {selectedGridPos && (
          <div className="text-xs text-[#8c8c9c]">
            <div>Grid Position: <span className="text-white">({selectedGridPos[0]}, {selectedGridPos[1]})</span></div>
            <div className="text-[#6090e0]">Click "Confirm Position" to save</div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {status === "confirming" && (
          <>
            <button
              onClick={() => {
                setSelectedGridPos(null);
                setStatus("selecting");
              }}
              className="rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 text-sm text-[#8c8c9c] hover:bg-[#1c1c20]"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="rounded-none border border-[#ed0584] bg-[#ed0584]/20 px-4 py-2 text-sm text-[#ed0584] hover:bg-[#ed0584]/30"
            >
              Confirm Position
            </button>
          </>
        )}
        <button
          onClick={onCancel}
          className="rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 text-sm text-[#8c8c9c] hover:bg-[#1c1c20]"
        >
          ✕ Close
        </button>
      </div>

      {/* 3D Canvas */}
      <Canvas>
        <PerspectiveCamera makeDefault position={[300, 400, 300]} fov={50} />
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          maxPolarAngle={Math.PI / 2 - 0.1}
          minDistance={100}
          maxDistance={800}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[100, 200, 100]} intensity={1} castShadow />
        
        {/* Ground grid */}
        <Grid 
          args={[1000, 1000]} 
          cellColor="#2a2a30" 
          sectionColor="#3a3a40"
          cellSize={BLOCK_FOOTPRINT_X + STREET_W}
          sectionSize={(BLOCK_FOOTPRINT_X + STREET_W) * 4}
          fadeDistance={1000}
          fadeStrength={2}
        />
        
        {/* Clickable ground plane */}
        <ClickableGround onGroundClick={handleGroundClick} />
        
        {/* Existing landmarks */}
        <ExistingLandmarks landmarks={existingLandmarks} />
        
        {/* Placement marker */}
        {selectedWorldPos && (
          <PlacementMarker 
            position={selectedWorldPos} 
            selected={status === "confirming"} 
          />
        )}
        
        {/* Environment */}
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
