const { createClient } = require('@supabase/supabase-js');
const https = require('https');

// Supabase config
const SUPABASE_URL = "https://rhppbqsuktyunxfwnddp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocHBicXN1a3R5dW54ZnduZGRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzExMzI4NywiZXhwIjoyMDkyNjg5Mjg3fQ.H0MMEVmK17T-2Jub0SlpTjaXdq6NVECXtSbJodjPBak";

// GitHub Token (authenticated = 5000 req/hr)
const GITHUB_TOKEN = "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";

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// Top web3 developers/organizations to fetch (unique, no duplicates)
const WEB3_ACCOUNTS = [
    'vitalikbuterin', 'ethereum', 'Uniswap', 'aantonop', 'gavinandresen',
    'balajis', 'naval', 'Coinbase', 'binance', 'krakenfx',
    'OpenZeppelin', 'Chainlink', 'Aave', 'compound-finance', 'makerdao',
    'solana-labs', 'polkadot', 'Cosmos', 'avalanche-labs', 'algorand',
    'metaMask', 'walletconnect', 'AlchemyPlatform', 'Infura', 'moralisweb3',
    'thirdweb', 'hardhat', 'foundry-rs', 'NomicFoundation', 'ethereumjs',
    'web3', 'ethers-io', 'wagmi-dev', 'wevm', 'scaffold-eth',
    'SpeedRunEthereum', 'Buildspace', 'Mintable', 'rarible', 'opensea',
    'magiclabs', 'paperxyz', 'dynamic_xyz', 'privy-id', 'lattice',
    'family', 'zora', 'foundation', 'superrare', 'nftport',
    'TheGraph', 'oceanprotocol', 'filecoin-project', 'ipfs',
    'arweave', 'storj', 'siafoundation', 'crustio', 'livepeer',
    'ensdomains', 'unstoppabledomains', 'handshake-org', 'namecoin', 'emercoin',
    'bitcore', 'bitcoin', 'lightningnetwork', 'Blockstream', 'ElementsProject',
    'dogecoin', 'litecoin', 'monero-project', 'zcash', 'dashpay',
    'ripple', 'stellar', 'iotaledger', 'nano', 'vergecurrency',
    'Cardano', 'iohk', 'emurgo-hk', 'HoskinsonChar', 'InputOutputHK',
    'tezos', 'ecadlabs', 'NomadicLabs', 'serokell', 'trilitech',
    'hyperledger', 'fabric', 'sawtooth', 'burrow', 'tendermint',
    'interledger', 'chain'
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
    console.log(`🔗 Fetching ${WEB3_ACCOUNTS.length} web3 accounts with authenticated API...\n`);

    // Check existing - get ALL developers to check
    const { data: existingData } = await sb.from('developers').select('github_login');
    const existingSet = new Set((existingData || []).map(d => d.github_login));
    console.log(`Total in DB: ${existingSet.size}\n`);

    const insertData = [];
    let duplicates = 0;
    
    for (let i = 0; i < WEB3_ACCOUNTS.length; i++) {
        const login = WEB3_ACCOUNTS[i];
        
        if (existingSet.has(login)) {
            console.log(`✓ ${login.padEnd(30)} - already in DB`);
            duplicates++;
            continue;
        }
        
        try {
            const user = await githubGet(`https://api.github.com/users/${login}`);
            
            if (user.message === 'Not Found') {
                console.log(`✗ ${login.padEnd(30)} - not found`);
                await sleep(200);
                continue;
            }
            
            // Skip if rate limited
            if (user.message && user.message.includes('rate limit')) {
                console.log(`⚠ Rate limited, waiting 60s...`);
                await sleep(60000);
            }
            
            const isOrg = user.type === 'Organization';
            
            // Get repos
            const repos = await githubGet(`https://api.github.com/users/${login}/repos?per_page=100&type=public`);
            const totalStars = Array.isArray(repos) ? repos.reduce((sum, r) => sum + r.stargazers_count, 0) : 0;
            const publicRepos = Array.isArray(repos) ? repos.length : 0;
            
            insertData.push({
                github_login: login,
                name: user.name || login,
                avatar_url: user.avatar_url,
                contributions: totalStars,
                contributions_total: totalStars,
                total_stars: totalStars,
                public_repos: publicRepos,
                primary_language: 'Solidity',
                rank: i + 1,
                claimed: false,
                district: 'web3',
                home_district: 'web3',
                district_chosen: true,
                account_created_at: user.created_at,
                followers: user.followers || 0,
                following: user.following || 0,
            });
            
            const type = isOrg ? '🏢' : '👤';
            console.log(`${type} ${login.padEnd(30)} - stars: ${totalStars.toLocaleString().padStart(10)}, repos: ${publicRepos}, followers: ${user.followers ? user.followers.toLocaleString() : '0'}`);
            await sleep(300);
        } catch (e) {
            console.log(`✗ ${login.padEnd(30)} - Error: ${e.message}`);
            await sleep(500);
        }
    }

    console.log(`\n\n📊 Inserting ${insertData.length} new developers into Web3 District...`);
    console.log(`⚠ Skipped ${duplicates} duplicates\n`);
    
    if (insertData.length > 0) {
        // Insert one by one to handle duplicates gracefully
        let successCount = 0;
        let failCount = 0;
        
        for (const dev of insertData) {
            const { error } = await sb.from('developers').insert(dev);
            if (error) {
                console.log(`❌ ${dev.github_login}: ${error.message}`);
                failCount++;
            } else {
                successCount++;
            }
            await sleep(100);
        }
        
        console.log(`\n✅ SUCCESS! Inserted ${successCount} developers (${failCount} failed)`);
    } else {
        console.log("No new developers to insert.");
    }

    console.log("\n🎉 Done!");
}

main().catch(console.error);
