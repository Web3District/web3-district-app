const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://rhppbqsuktyunxfwnddp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocHBicXN1a3R5dW54ZnduZGRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzExMzI4NywiZXhwIjoyMDkyNjg5Mjg3fQ.H0MMEVmK17T-2Jub0SlpTjaXdq6NVECXtSbJodjPBak";

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

(async () => {
    const { count } = await sb.from('developers').select('*', {count: 'exact', head: true}).eq('district', 'vc');
    console.log('\n🟠 VC District total:', count);
    
    const { data } = await sb.from('developers').select('github_login,total_stars').eq('district', 'vc').order('total_stars', {ascending: false}).limit(10);
    console.log('\nTop 10:');
    data?.forEach((d, i) => console.log((i+1) + '. ' + d.github_login + ' - ' + d.total_stars.toLocaleString() + ' stars'));
})();
