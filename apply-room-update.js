const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rhppbqsuktyunxfwnddp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocHBicXN1a3R5dW54ZnduZGRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzExMzI4NywiZXhwIjoyMDkyNjg5Mjg3fQ.H0MMEVmK17T-2Jub0SlpTjaXDq6NVECXtSbJodjPBak';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateRoom() {
  console.log('🔄 Updating E.Arcade Lobby → Web4City Agency...\n');
  
  const { data, error } = await supabase
    .from('arcade_rooms')
    .update({ 
      name: 'Web4City Agency',
      description: 'Official Web4City agency room',
      updated_at: new Date().toISOString()
    })
    .eq('slug', 'lobby')
    .select();

  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  if (data && data.length > 0) {
    console.log('✅ SUCCESS!');
    console.log(`   Room: ${data[0].slug}`);
    console.log(`   New name: ${data[0].name}`);
    console.log(`   Description: ${data[0].description}`);
    console.log('\n🌐 Visit https://web4city.xyz/arcade to see the change!');
  } else {
    console.log('⚠️  No room found with slug "lobby"');
  }
}

updateRoom();
