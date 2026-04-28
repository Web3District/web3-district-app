const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const SUPABASE_URL = "https://rhppbqsuktyunxfwnddp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocHBicXN1a3R5dW54ZnduZGRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzExMzI4NywiZXhwIjoyMDkyNjg5Mjg3fQ.H0MMEVmK17T-2Jub0SlpTjaXdq6NVECXtSbJodjPBak";
const GITHUB_TOKEN = "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";

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

const MORE_ACCOUNTS = [
    'vitalikbuterin', 'aantonop', 'gavinandresen', 'balajis', 'naval',
    'Coinbase', 'binance', 'krakenfx', 'OpenZeppelin', 'Chainlink',
    'Aave', 'compound-finance', 'makerdao', 'solana-labs', 'polkadot',
    'Cosmos', 'avalanche-labs', 'algorand', 'metaMask', 'walletconnect',
    'AlchemyPlatform', 'Infura', 'thirdweb', 'hardhat', 'foundry-rs',
    'NomicFoundation', 'ethereumjs', 'web3', 'ethers-io', 'wagmi-dev',
    'wevm', 'scaffold-eth', 'Buildspace', 'rarible', 'opensea',
    'magiclabs', 'paperxyz', 'lattice', 'family', 'foundation',
    'superrare', 'nftport', 'oceanprotocol', 'filecoin-project', 'ipfs',
    'storj', 'siafoundation', 'crustio', 'livepeer', 'ensdomains',
    'unstoppabledomains', 'handshake-org', 'namecoin', 'emercoin',
    'bitcoin', 'lightningnetwork', 'Blockstream', 'ElementsProject',
    'dogecoin', 'monero-project', 'zcash', 'dashpay', 'ripple',
    'stellar', 'iotaledger', 'vergecurrency', 'Cardano', 'tezos',
    'ecadlabs', 'serokell', 'trilitech', 'hyperledger', 'fabric',
    'tendermint', 'interledger', 'chain', 'curvefi', 'yearn',
    'ConvexFinance', 'rocket-pool', 'LidoFinance', 'fraxfinance',
    'olympusdao', 'tokemak', 'AlchemixFi', 'RibbonFinance', 'dydxprotocol',
    'perpetual-protocol', 'GMX-io', 'gains-network', 'SynthetixIO', 'balancer',
    'bancor', 'KyberNetwork', '1inch', 'Matcha-xyz', 'paraswap',
    'axieinfinity', 'skyweaver', 'illuvium', 'decentraland', 'cryptovoxels',
    'optimism', 'arbitrum', 'polygon', 'zksync', 'starknet',
    'base-org', 'mantlenetwork', 'metis', 'moonbeam', 'gnosis',
    'API3', 'bandprotocol', 'dia-data', 'fluxprotocol', 'pyth-network',
    'worldcoin', 'proof-xyz', 'gitcoin', 'snapshot-labs', 'tally',
    'aragon', 'moralis', 'quicknode', 'ankr', 'figment',
    'argent', 'rainbow-me', 'zerion', 'rotki', 'gnosis-safe',
    'hop-protocol', 'synapse-protocol', 'stargate-protocol', 'layerzero', 'wormhole',
    'axelar', 'connext', 'liquity', 'reflexer-finance', 'angle-protocol',
    'cream-finance', 'venus-protocol', 'benqi', 'radiant-capital', 'euler',
    'morpho', 'gearbox', 'hegic', 'opyn', 'premia',
    'lyra-finance', 'kwenta', 'nexus-mutual', 'polkastarter', 'seedify',
    'dune-analytics', 'flipside-crypto', 'messari', 'coingecko', 'defillama',
    'l2beat', 'nansen', 'lens-protocol', 'farcaster', 'mirror-xyz',
    'bankless', 'decrypt', 'near', 'aptos-labs', 'sui-foundation',
    'celestia', 'injective', 'sei-protocol', 'osmosis', 'juno-network',
    'hedera', 'iota', 'vechain', 'elrond', 'fantom',
    'klaytn', 'icon', 'strike', 'river', 'swan',
    'unchained', 'bisq', 'prysmatic', 'sigp', 'status',
    'nimbus', 'lighthouse', 'slither', 'echidna', 'crytic',
    'code4rena', 'covalent', 'subquery', 'immunefi', 'slowmist',
    'peckshield', 'sherlock', 'klima', 'immutable', 'gala',
    'enjin', 'sandbox', 'star-atlas', 'voxels', 'cyberconnect',
    'mina', 'ironfish', 'okx', 'bybit', 'kucoin',
    'blur', 'looksrare', 'sudoswap', 'sushiswap', 'pancakeswap',
    'traderjoe', 'quickswap', 'beefy', 'alpaca', 'pooltogether'
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
    console.log(`🔗 Fetching accounts to reach 500+...\n`);

    const { data: existingData } = await sb.from('developers').select('github_login');
    const existingSet = new Set((existingData || []).map(d => d.github_login));
    console.log(`Existing in DB: ${existingSet.size}\n`);

    let inserted = 0;
    
    for (const login of MORE_ACCOUNTS) {
        if (existingSet.has(login)) {
            continue;
        }
        
        try {
            const user = await githubGet(`https://api.github.com/users/${login}`);
            
            if (user.message === 'Not Found') {
                await sleep(100);
                continue;
            }
            
            if (user.message && user.message.includes('rate limit')) {
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
                primary_language: 'Solidity',
                rank: inserted + 1,
                claimed: false,
                district: 'web3',
                home_district: 'web3',
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
                if (inserted % 5 === 0) {
                    console.log(`✅ ${inserted} inserted...`);
                }
            }
            
            await sleep(150);
        } catch (e) {
            await sleep(200);
        }
    }

    console.log(`\n✅ Inserted ${inserted} new developers`);

    // Final count
    const { count } = await sb.from('developers').select('*', {count: 'exact', head: true}).eq('district', 'web3');
    console.log(`\n🟣 Web3 District total: ${count}`);
    console.log("\n🎉 Done!");
}

main().catch(console.error);
