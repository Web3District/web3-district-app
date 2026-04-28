const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://rhppbqsuktyunxfwnddp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocHBicXN1a3R5dW54ZnduZGRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzExMzI4NywiZXhwIjoyMDkyNjg5Mjg3fQ.H0MMEVmK17T-2Jub0SlpTjaXdq6NVECXtSbJodjPBak";

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

(async () => {
    const { count } = await sb.from('developers').select('*', {count: 'exact', head: true}).eq('district', 'growth');
    console.log('\n🟢 Growth District total:', count);
    
    const { data } = await sb.from('developers').select('github_login,total_stars,followers').eq('district', 'growth').order('total_stars', {ascending: false}).limit(15);
    console.log('\nTop 15 by Stars:\n' + '='.repeat(60));
    data?.forEach((d, i) => {
        console.log((i+1).toString().padEnd(3) + d.github_login.padEnd(30) + ' stars:' + (d.total_stars || 0).toLocaleString().padStart(12) + ' followers:' + (d.followers || 0).toLocaleString().padStart(10));
    });
})();
