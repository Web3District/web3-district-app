const { NodeIO } = require('@gltf-transform/core');
const { KHRMaterialsUnlit } = require('@gltf-transform/extensions');
const fs = require('fs');
const path = require('path');

async function applyNinjaSkin() {
  const io = new NodeIO();
  io.registerExtensions([KHRMaterialsUnlit]);
  
  // Paths
  const inputGlb = path.join(__dirname, '../public/models/characters/character-b.glb');
  const outputGlb = path.join(__dirname, '../public/models/characters/character-b-ninja.glb');
  const ninjaTexturePath = path.join(__dirname, '../public/models/characters/Textures/ninja_web4_eyes_2.png');
  
  console.log('🔧 Loading GLB...');
  const document = await io.read(inputGlb);
  
  console.log('🎨 Loading ninja texture...');
  const ninjaImage = fs.readFileSync(ninjaTexturePath);
  
  // Get all textures and replace them
  const textures = document.getRoot().listTextures();
  console.log(`📦 Found ${textures.length} texture(s)`);
  
  textures.forEach((texture, index) => {
    console.log(`  Texture ${index}: ${texture.getName()} (${texture.getMimeType()})`);
    
    // Replace with ninja texture
    texture.setImage(ninjaImage);
    texture.setMimeType('image/png');
    texture.setName('ninja-skin');
    
    console.log(`  ✅ Replaced with ninja texture`);
  });
  
  // Save modified GLB
  console.log('💾 Saving modified GLB...');
  await io.write(outputGlb, document);
  
  console.log(`✨ Done! Created: ${outputGlb}`);
  console.log('🎮 Update WalkingAvatar.tsx to use "character-b-ninja.glb"');
}

applyNinjaSkin().catch(console.error);
