// Create district lobby maps and insert into Supabase arcade_rooms
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rhppbqsuktyunxfwnddp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocHBicXN1a3R5dW54ZnduZGRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzExMzI4NywiZXhwIjoyMDkyNjg5Mjg3fQ.H0MMEVmK17T-2Jub0SlpTjaXdq6NVECXtSbJodjPBak';

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// Base lobby map template (30x22 tiles)
function createLobbyMap(name, color, accentColor) {
  const W = 30, H = 22;
  const ground = new Array(W * H).fill(2);
  const collision = new Array(W * H).fill(0);
  const abovePlayer = new Array(W * H).fill(0);
  
  // Border walls (tile 1 = wall)
  for (let x = 0; x < W; x++) {
    ground[x] = 1; // top
    ground[(H-1) * W + x] = 1; // bottom
    collision[x] = 1;
    collision[(H-1) * W + x] = 1;
  }
  for (let y = 0; y < H; y++) {
    ground[y * W] = 1; // left
    ground[y * W + (W-1)] = 1; // right
    collision[y * W] = 1;
    collision[y * W + (W-1)] = 1;
  }
  
  // Floor tiles (2 = floor, color accent tiles at edges)
  for (let y = 1; y < H-1; y++) {
    for (let x = 1; x < W-1; x++) {
      const idx = y * W + x;
      // Accent border (tile 5 = accent color floor)
      if (y === 1 || y === H-2 || x === 1 || x === W-2) {
        ground[idx] = 5;
      } else {
        ground[idx] = 2;
      }
    }
  }
  
  // Desk areas with PCs (tile 3 = desk)
  const deskAreas = [
    { x: 3, y: 3, w: 5, h: 2 },
    { x: 22, y: 3, w: 5, h: 2 },
    { x: 3, y: 17, w: 5, h: 2 },
    { x: 22, y: 17, w: 5, h: 2 },
  ];
  
  for (const area of deskAreas) {
    for (let dy = 0; dy < area.h; dy++) {
      for (let dx = 0; dx < area.w; dx++) {
        const idx = (area.y + dy) * W + (area.x + dx);
        ground[idx] = 3;
        collision[idx] = 0; // walkable
      }
    }
  }
  
  // Center meeting area (tile 4 = meeting table)
  for (let y = 9; y <= 12; y++) {
    for (let x = 10; x <= 19; x++) {
      const idx = y * W + x;
      if (y === 9 || y === 12) {
        ground[idx] = 4; // table top/bottom
      } else if (x === 10 || x === 19) {
        ground[idx] = 4; // table sides
      } else {
        ground[idx] = 2; // inside table
      }
    }
  }
  
  // Objects: spawns, seats, PCs, elevator
  const objects = [
    // Spawn points (entrance at bottom center)
    { type: "spawn", x: 13, y: 20 },
    { type: "spawn", x: 14, y: 20 },
    { type: "spawn", x: 15, y: 20 },
    { type: "spawn", x: 16, y: 20 },
    
    // Elevator (top center)
    { type: "elevator", x: 13, y: 1, width: 4, label: "Elevator" },
    
    // PCs at desk areas
    { type: "pc", x: 4, y: 4, dir: "up" },
    { type: "pc", x: 6, y: 4, dir: "up" },
    { type: "pc", x: 23, y: 4, dir: "up" },
    { type: "pc", x: 25, y: 4, dir: "up" },
    { type: "pc", x: 4, y: 17, dir: "down" },
    { type: "pc", x: 6, y: 17, dir: "down" },
    { type: "pc", x: 23, y: 17, dir: "down" },
    { type: "pc", x: 25, y: 17, dir: "down" },
    
    // Seats around meeting table
    { type: "seat", x: 11, y: 8, dir: "down" },
    { type: "seat", x: 13, y: 8, dir: "down" },
    { type: "seat", x: 15, y: 8, dir: "down" },
    { type: "seat", x: 17, y: 8, dir: "down" },
    { type: "seat", x: 11, y: 13, dir: "up" },
    { type: "seat", x: 13, y: 13, dir: "up" },
    { type: "seat", x: 15, y: 13, dir: "up" },
    { type: "seat", x: 17, y: 13, dir: "up" },
    
    // District logo/quote walls
    { type: "quote", x: 1, y: 10, label: `${name} District` },
    { type: "quote", x: 28, y: 10, label: `${name} Hub` },
  ];
  
  // Furniture
  const furniture = [
    // Desks
    { id: "desk-0", sprite: "DESK_FRONT", x: 96, y: 96, width: 160, height: 64, collides: true, sortY: 160 },
    { id: "desk-1", sprite: "DESK_FRONT", x: 704, y: 96, width: 160, height: 64, collides: true, sortY: 160 },
    { id: "desk-2", sprite: "DESK_FRONT", x: 96, y: 544, width: 160, height: 64, collides: true, sortY: 608 },
    { id: "desk-3", sprite: "DESK_FRONT", x: 704, y: 544, width: 160, height: 64, collides: true, sortY: 608 },
    
    // PCs
    { id: "pc-0", sprite: "PC_FRONT", x: 128, y: 96, width: 32, height: 32, collides: false, sortY: 160.5 },
    { id: "pc-1", sprite: "PC_FRONT", x: 192, y: 96, width: 32, height: 32, collides: false, sortY: 160.5 },
    { id: "pc-2", sprite: "PC_FRONT", x: 736, y: 96, width: 32, height: 32, collides: false, sortY: 160.5 },
    { id: "pc-3", sprite: "PC_FRONT", x: 800, y: 96, width: 32, height: 32, collides: false, sortY: 160.5 },
    
    // Chairs
    { id: "chair-0", sprite: "CHAIR_FRONT", x: 128, y: 160, width: 32, height: 32, collides: false, sortY: 192 },
    { id: "chair-1", sprite: "CHAIR_FRONT", x: 192, y: 160, width: 32, height: 32, collides: false, sortY: 192 },
    { id: "chair-2", sprite: "CHAIR_FRONT", x: 736, y: 160, width: 32, height: 32, collides: false, sortY: 192 },
    { id: "chair-3", sprite: "CHAIR_FRONT", x: 800, y: 160, width: 32, height: 32, collides: false, sortY: 192 },
    
    // Meeting table
    { id: "table-0", sprite: "SMALL_TABLE", x: 320, y: 288, width: 320, height: 128, collides: true, sortY: 416 },
    
    // Plants
    { id: "plant-0", sprite: "PLANT", x: 32, y: 32, width: 32, height: 32, collides: true, sortY: 64 },
    { id: "plant-1", sprite: "PLANT", x: 896, y: 32, width: 32, height: 32, collides: true, sortY: 64 },
    { id: "plant-2", sprite: "PLANT", x: 32, y: 608, width: 32, height: 32, collides: true, sortY: 640 },
    { id: "plant-3", sprite: "PLANT", x: 896, y: 608, width: 32, height: 32, collides: true, sortY: 640 },
    
    // Elevator
    { id: "elevator-0", sprite: "ELEVATOR", x: 416, y: 32, width: 128, height: 32, collides: true, sortY: 32 },
  ];
  
  return {
    name: `${name.toLowerCase()}-lobby`,
    width: W,
    height: H,
    tileSize: 32,
    tileset: "/sprites/arcade-tileset.png",
    tilesetColumns: 16,
    layers: { ground, collision, abovePlayer },
    furniture,
    objects,
  };
}

const DISTRICTS = [
  { slug: "ai-lobby", name: "AI District Lounge", color: "#ec4899", desc: "Where AI devs connect" },
  { slug: "web3-lobby", name: "Web3 District Lounge", color: "#8b5cf6", desc: "Blockchain builders hub" },
  { slug: "quantum-lobby", name: "Quantum District Lounge", color: "#06b6d4", desc: "Quantum computing lounge" },
  { slug: "vc-lobby", name: "VC District Lounge", color: "#f97316", desc: "Investors & founders meet" },
  { slug: "growth-lobby", name: "Growth District Lounge", color: "#10b981", desc: "Growth hackers unite" },
];

async function main() {
  console.log("🏗️ Creating district lobbies...\n");
  
  for (const district of DISTRICTS) {
    console.log(`Creating: ${district.name} (${district.slug})`);
    
    const mapJson = createLobbyMap(district.name.replace(' District Lounge', ''), district.color);
    
    const { data, error } = await sb
      .from('arcade_rooms')
      .upsert({
        slug: district.slug,
        name: district.name,
        room_type: 'official_floor',
        floor_number: 0,
        map_json: mapJson,
        max_players: 50,
        visibility: 'open',
        description: district.desc,
        is_featured: true,
        category: null,
        portals: [],
      }, { onConflict: 'slug' });
    
    if (error) {
      console.error(`  ❌ Error: ${error.message}`);
    } else {
      console.log(`  ✅ Created/updated: ${district.slug}`);
    }
  }
  
  console.log("\n🎉 All district lobbies created!");
}

main().catch(console.error);
