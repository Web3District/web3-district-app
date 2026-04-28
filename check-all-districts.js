const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://rhppbqsuktyunxfwnddp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocHBicXN1a3R5dW54ZnduZGRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzExMzI4NywiZXhwIjoyMDkyNjg5Mjg3fQ.H0MMEVmK17T-2Jub0SlpTjaXdq6NVECXtSbJodjPBak";

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

(async () => {
    console.log('\n🏙️ WEB3 DISTRICT CITY - FINAL STATUS\n' + '='.repeat(60));
    
    const districts = [
        { name: 'AI District', id: 'ai', color: '🌸' },
        { name: 'Web3 District', id: 'web3', color: '🟣' },
        { name: 'Growth District', id: 'growth', color: '🟢' },
        { name: 'VC District', id: 'vc', color: '🟠' },
        { name: 'Quantum District', id: 'quantum', color: '🔵' },
        { name: 'Downtown', id: 'downtown', color: '⚪' },
    ];
    
    let total = 0;
    
    for (const d of districts) {
        const { count } = await sb.from('developers').select('*', {count: 'exact', head: true}).eq('district', d.id);
        console.log(`${d.color} ${d.name.padEnd(20)} ${count.toLocaleString().padStart(6)} buildings`);
        total += count;
    }
    
    console.log('='.repeat(60));
    console.log(`🏙️ TOTAL CITY: ${total.toLocaleString()} buildings\n`);
    
    // Top 5 per district
    for (const d of districts) {
        const { data } = await sb.from('developers').select('github_login,total_stars').eq('district', d.id).order('total_stars', {ascending: false}).limit(3);
        if (data && data.length > 0) {
            console.log(`\n${d.color} ${d.name} - Top 3:`);
            data.forEach((dev, i) => {
                console.log(`   ${i+1}. ${dev.github_login.padEnd(25)} ${dev.total_stars.toLocaleString().padStart(10)} ⭐`);
            });
        }
    }
    
    console.log('\n🎉 All districts populated!\n');
})();
