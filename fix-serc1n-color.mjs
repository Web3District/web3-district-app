import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://rhppbqsuktyunxfwnddp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocHBicXN1a3R5dW54ZnduZGRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzExMzI4NywiZXhwIjoyMDkyNjg5Mjg3fQ.H0MMEVmK17T-2Jub0SlpTjaXdq6NVECXtSbJodjPBak'
);

async function fixSerc1nColor() {
  const devId = 10897; // serc1n's ID
  
  console.log('Fixing custom_color for serc1n (ID:', devId, ')');
  
  const { data, error } = await supabase
    .from('developer_customizations')
    .upsert({
      developer_id: devId,
      item_id: 'custom_color',
      config: { color: '#48494b' }
    }, { onConflict: 'developer_id,item_id' });
  
  if (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
  console.log('✅ Success! Custom color saved');
  
  const { data: verify } = await supabase
    .from('developer_customizations')
    .select('*')
    .eq('developer_id', devId)
    .eq('item_id', 'custom_color');
  
  console.log('✅ Verification:', JSON.stringify(verify, null, 2));
}

fixSerc1nColor();
