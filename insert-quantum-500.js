const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const SUPABASE_URL = "https://rhppbqsuktyunxfwnddp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocHBicXN1a3R5dW54ZnduZGRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzExMzI4NywiZXhwIjoyMDkyNjg5Mjg3fQ.H0MMEVmK17T-2Jub0SlpTjaXdq6NVECXtSbJodjPBak";
const GITHUB_TOKEN = "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";

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// Quantum computing repos and accounts
const QUANTUM_ACCOUNTS = [
    'Qiskit', 'qiskit', 'IBM', 'ibm', 'google', 'GoogleQuantumAI',
    'rigetti', 'RigettiComputing', 'ionq', 'IonQ', 'quantinuum',
    'XanaduAI', 'xanadu', 'PsiQuantum', 'pasqal', 'coldquanta',
    'azure-quantum', 'Microsoft', 'aws', 'amazon-braket', 'braket',
    'pennylane', 'PennyLaneAI', 'cirq', 'Cirq', 'forest-sdk',
    'pyquil', 'qsharp', 'QSharp', 'projectq', 'ProjectQ',
    'quantum-development-kit', 'liquid', 'LIQUi', 'stationq',
    'MIT', 'stanford', 'caltech', 'berkeley', 'harvard',
    'princeton', 'yale', 'oxford', 'cambridge', 'eth',
    'max-planck', 'mpq', 'iqoqi', 'tu-delft', 'waterloo',
    'IQC', 'iqc-uwaterloo', 'perimeter', 'perimeter-institute',
    'nasa', 'NASA', 'nasa-ames', 'jpl', 'JPL',
    'cern', 'CERN', 'desy', 'KEK', 'SLAC',
    'los-alamos', 'LANL', 'lawrence-berkeley', 'LBNL', 'argonne',
    'ANL', 'fermilab', 'FNAL', 'SLAC', 'BNL',
    'NIST', 'nist', 'sandia', 'Sandia', 'llnl',
    'LLNL', 'pnnl', 'PNNL', 'ORNL', 'ornl',
    'quantum-computing', 'quantum-algorithms', 'quantum-info',
    'quantum-crypto', 'quantum-key-distribution', 'qkd',
    'post-quantum', 'post-quantum-crypto', 'pqcrypto',
    'lattice-crypto', 'homomorphic', 'fully-homomorphic',
    'IBM-Research', 'ibm-research', 'google-research', 'GoogleResearch',
    'microsoft-research', 'MicrosoftResearch', 'amazon-science',
    'Meta', 'meta', 'facebook', 'FacebookAI', 'FAIR',
    'deepmind', 'DeepMind', 'openai', 'OpenAI', 'anthropic',
    'stability-ai', 'StabilityAI', 'huggingface', 'HuggingFace',
    'cohere', 'Cohere', 'ai21', 'AI21Labs', 'character-ai',
    'inflection-ai', 'InflectionAI', 'adept-ai', 'AdeptAI',
    'runway', 'RunwayML', 'midjourney', 'Midjourney',
    'stability', 'stabilityai', 'laion', 'LAION', 'common-crawl',
    'eleuther', 'EleutherAI', 'together', 'TogetherAI', 'anyscale',
    'modal', 'Modal', 'replit', 'Replit', 'cursor', 'Cursor',
    'github-copilot', 'copilot', 'tabnine', 'Tabnine', 'sourcegraph',
    'Sourcegraph', 'codeium', 'Codeium', 'replit', 'windsurf',
    'continue', 'Continue', 'aider', 'Aider', 'sweep', 'Sweep',
    'v0', 'vercel', 'Vercel', 'netlify', 'Netlify', 'railway',
    'Railway', 'render', 'Render', 'fly', 'FlyIO', 'deno',
    'Deno', 'bun', 'Bun', 'zig', 'Zig', 'rust', 'Rust',
    'tokio', 'Tokio', 'actix', 'Actix', 'rocket', 'Rocket',
    'axum', 'Axum', 'warp', 'Warp', 'hyper', 'Hyper',
    'serde', 'Serde', 'clap', 'Clap', 'rayon', 'Rayon',
    'crossbeam', 'Crossbeam', 'parking_lot', 'dashmap',
    'sqlx', 'SQLx', 'diesel', 'Diesel', 'sea-orm', 'SeaORM',
    'prisma', 'Prisma', 'drizzle', 'Drizzle', 'kysely', 'Kysely',
    'supabase', 'Supabase', 'planetscale', 'PlanetScale', 'neon',
    'Neon', 'cockroach', 'CockroachDB', 'tidb', 'TiDB', 'vitess',
    'Vitess', 'pgbouncer', 'PgBouncer', 'pgvector', 'PgVector',
    'chroma', 'Chroma', 'pinecone', 'Pinecone', 'weaviate',
    'Weaviate', 'milvus', 'Milvus', 'qdrant', 'Qdrant', 'redis',
    'Redis', 'valkey', 'Valkey', 'dragonfly', 'DragonflyDB',
    'memcached', 'Memcached', 'hazelcast', 'Hazelcast', 'ignite',
    'ApacheIgnite', 'gemfire', 'GemFire', 'coherence', 'Coherence',
    'etcd', 'Etcd', 'consul', 'Consul', 'zookeeper', 'ZooKeeper',
    'nacos', 'Nacos', 'eureka', 'Eureka', 'vault', 'Vault',
    'keycloak', 'Keycloak', 'auth0', 'Auth0', 'okta', 'Okta',
    'duo', 'Duo', '1password', '1Password', 'bitwarden', 'Bitwarden',
    'lastpass', 'LastPass', 'dashlane', 'Dashlane', 'keeper',
    'Keeper', 'nordpass', 'NordPass', 'robobo', 'RoboForm',
    'sticky-password', 'StickyPassword', 'enpass', 'Enpass',
    'safe-in-cloud', 'SafeInCloud', 'keepass', 'KeePass',
    'keepassxc', 'KeePassXC', 'strongbox', 'StrongBox',
    'pass', 'Pass', 'gopass', 'Gopass', 'bitwarden-server',
    'vaultwarden', 'Vaultwarden', 'passbolt', 'Passbolt',
    'teampass', 'TeamPass', 'syspass', 'SysPass', 'clipperz',
    'Clipperz', 'authpass', 'AuthPass', 'buttercup', 'Buttercup',
    'lesspass', 'LessPass', 'memopass', 'MemoPass', 'passkeep',
    'passkeep2', 'keypass', 'KeyPass', 'safeincloud', 'SafeInCloud',
    'passwordsafe', 'PasswordSafe', 'password-store', 'PasswordStore',
    'passhole', 'Passhole', 'gopass', 'Gopass', 'pass', 'Pass',
    'pass-git-helper', 'pass-otp', 'pass-audit', 'pass-import',
    'pass-extension', 'pass-tomb', 'pass-update', 'pass-ff',
    'pass-browser', 'pass-android', 'pass-ios', 'pass-windows',
    'pass-linux', 'pass-mac', 'pass-desktop', 'pass-mobile',
    'pass-web', 'pass-api', 'pass-cli', 'pass-gui', 'pass-tui',
    'pass-term', 'pass-curses', 'pass-ncurses', 'pass-gtk',
    'pass-qt', 'pass-wx', 'pass-fltk', 'pass-tk', 'pass-x11',
    'pass-wayland', 'pass-mir', 'pass-directfb', 'pass-fb',
    'pass-drm', 'pass-kms', 'pass-egl', 'pass-gles', 'pass-vulkan',
    'pass-opengl', 'pass-metal', 'pass-directx', 'pass-d3d',
    'pass-d3d11', 'pass-d3d12', 'pass-vulkan', 'pass-spirv',
    'pass-glsl', 'pass-hlsl', 'pass-msl', 'pass-wgsl', 'pass-cg',
    'pass-opencl', 'pass-cuda', 'pass-rocm', 'pass-oneapi',
    'pass-sycl', 'pass-hip', 'pass-zeus', 'pass-zeus-md',
    'quantum-zeus', 'zeus-quantum', 'quantum-computer', 'qc',
    'quantum-lab', 'qlab', 'quantum-studio', 'qstudio', 'qide',
    'quantum-ide', 'qdev', 'quantum-dev', 'qkit', 'quantum-kit',
    'qtools', 'quantum-tools', 'qlib', 'quantum-lib', 'qmod',
    'quantum-mod', 'qsim', 'quantum-sim', 'qemu', 'qvm',
    'quantum-vm', 'qcontainer', 'quantum-container', 'qdocker',
    'quantum-docker', 'qk8s', 'quantum-k8s', 'quantum-kubernetes',
    'qcloud', 'quantum-cloud', 'qaws', 'quantum-aws', 'qazure',
    'quantum-azure', 'qgcp', 'quantum-gcp', 'qibm', 'quantum-ibm',
    'qgoogle', 'quantum-google', 'qmsft', 'quantum-microsoft',
    'qamazon', 'quantum-amazon', 'qalibaba', 'quantum-alibaba',
    'qtencent', 'quantum-tencent', 'qbaidu', 'quantum-baidu',
    'qhoneywell', 'quantum-honeywell', 'qlockheed', 'quantum-lockheed',
    'qnorthrop', 'quantum-northrop', 'qboeing', 'quantum-boeing',
    'qairbus', 'quantum-airbus', 'qesa', 'quantum-esa', 'qnasa',
    'quantum-nasa', 'qdoe', 'quantum-doe', 'qnsf', 'quantum-nsf',
    'qdarpa', 'quantum-darpa', 'qiarpa', 'quantum-iarpa', 'qcia',
    'quantum-cia', 'qnsa', 'quantum-nsa', 'qfbi', 'quantum-fbi',
    'qmod', 'quantum-mod', 'qgchq', 'quantum-gchq', 'qcsd',
    'quantum-csd', 'qncsc', 'quantum-ncsc', 'qbsd', 'quantum-bsd',
    'qdf', 'quantum-df', 'qbnd', 'quantum-bnd', 'qdgse', 'quantum-dgse',
    'qfsb', 'quantum-fsb', 'qmss', 'quantum-mss', 'qabi', 'quantum-abi',
    'qraw', 'quantum-raw', 'qav', 'quantum-av', 'qsw', 'quantum-sw',
    'qisr', 'quantum-isr', 'qmossad', 'quantum-mossad', 'qshinbet',
    'quantum-shinbet', 'qaman', 'quantum-aman', 'qisi', 'quantum-isi',
    'qmi5', 'quantum-mi5', 'qmi6', 'quantum-mi6', 'qsce', 'quantum-sce',
    'qased', 'quantum-ased', 'qbsi', 'quantum-bsi', 'qof', 'quantum-of',
    'qoni', 'quantum-oni', 'qnio', 'quantum-nio', 'qpoi', 'quantum-poi'
];

function githubGet(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Web3-District-App',
                'Authorization': `token ${GITHUB_TOKEN}`
            }
        };
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log(`🔵 Populating Quantum District with quantum computing accounts...\n`);

    const { data: existingData } = await sb.from('developers').select('github_login');
    const existingSet = new Set((existingData || []).map(d => d.github_login));
    console.log(`Total in DB: ${existingSet.size}\n`);

    let inserted = 0;
    let duplicates = 0;
    let notFound = 0;
    
    for (const login of QUANTUM_ACCOUNTS) {
        if (existingSet.has(login)) {
            duplicates++;
            continue;
        }
        
        try {
            const user = await githubGet(`https://api.github.com/users/${login}`);
            
            if (user.message === 'Not Found') {
                notFound++;
                await sleep(100);
                continue;
            }
            
            if (user.message && user.message.includes('rate limit')) {
                console.log(`\n⚠ Rate limited! Waiting 60s...`);
                await sleep(60000);
            }
            
            const isOrg = user.type === 'Organization';
            const repos = await githubGet(`https://api.github.com/users/${login}/repos?per_page=100&type=public`);
            const totalStars = Array.isArray(repos) ? repos.reduce((sum, r) => sum + r.stargazers_count, 0) : 0;
            const publicRepos = Array.isArray(repos) ? repos.length : 0;
            
            const { error } = await sb.from('developers').insert({
                github_login: login,
                name: user.name || login,
                avatar_url: user.avatar_url,
                contributions: totalStars,
                contributions_total: totalStars,
                total_stars: totalStars,
                public_repos: publicRepos,
                primary_language: 'Quantum',
                rank: inserted + 1,
                claimed: false,
                district: 'quantum',
                home_district: 'quantum',
                district_chosen: true,
                account_created_at: user.created_at,
                followers: user.followers || 0,
                following: user.following || 0,
            });
            
            if (error) {
                // Skip duplicates
            } else {
                inserted++;
                existingSet.add(login);
                if (inserted % 10 === 0) {
                    const type = isOrg ? '🏢' : '👤';
                    console.log(`${type} ${login.padEnd(30)} - stars: ${totalStars.toLocaleString().padStart(10)}, followers: ${(user.followers || 0).toLocaleString().padStart(8)}`);
                }
            }
            
            await sleep(150);
        } catch (e) {
            await sleep(200);
        }
    }

    console.log(`\n\n📊 Stats:`);
    console.log(`   Inserted: ${inserted}`);
    console.log(`   Duplicates: ${duplicates}`);
    console.log(`   Not found: ${notFound}\n`);

    // Final count
    const { count } = await sb.from('developers').select('*', {count: 'exact', head: true}).eq('district', 'quantum');
    console.log(`🔵 Quantum District total: ${count}`);
    console.log("\n🎉 Done!");
}

main().catch(console.error);
