const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const SUPABASE_URL = "https://rhppbqsuktyunxfwnddp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocHBicXN1a3R5dW54ZnduZGRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzExMzI4NywiZXhwIjoyMDkyNjg5Mjg3fQ.H0MMEVmK17T-2Jub0SlpTjaXdq6NVECXtSbJodjPBak";
const GITHUB_TOKEN = "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";

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// 500+ web3 accounts
const WEB3_ACCOUNTS = [
    'curvefi', 'yearn', 'ConvexFinance', 'rocket-pool', 'LidoFinance',
    'fraxfinance', 'olympusdao', 'tokemak', 'AlchemixFi', 'RibbonFinance',
    'dydxprotocol', 'perpetual-protocol', 'GMX-io', 'gains-network', 'SynthetixIO',
    'balancer', 'bancor', 'KyberNetwork', '1inch', 'Matcha-xyz',
    'paraswap', '0x', 'airswap', 'loopring', 'starkware',
    'axieinfinity', 'skyweaver', 'gods-unchained', 'illuvium', 'ember-sword',
    'decentraland', 'cryptovoxels', 'somniumspace', 'nftx', 'async-art',
    'knownorigin', 'makersplace', 'niftygateway', 'bakeryswap', 'treasure-dao',
    'yield-guild', 'merit-circle', 'gamefi', 'ultra', 'immutable',
    'optimism', 'arbitrum', 'polygon', 'zksync', 'starknet',
    'scroll-tech', 'linea', 'base-org', 'mantlenetwork', 'metis',
    'boba-network', 'aurora-isle', 'moonbeam', 'moonriver', 'celo-org',
    'harmony-one', 'fuse-network', 'gnosis', 'rootstock', 'stacks',
    'API3', 'bandprotocol', 'dia-data', 'fluxprotocol', 'pyth-network',
    'switchboard', 'chroniclelabs', 'tellor', 'redstone-finance', 'gelato',
    'worldcoin', 'proof-xyz', 'gitcoin', 'clr-fund', 'radicle',
    'brightid', 'spruceid', 'iden3', 'aztec-protocol', 'tornado-cash',
    'railgun', 'penumbra-zone', 'secret-network', 'oasisprotocol', 'findora',
    'snapshot-labs', 'tally', 'deepdao', 'boardroom', 'coordination',
    'colony', 'aragon', 'dao-drops', 'shards', 'commonwealth',
    'moralis', 'quicknode', 'ankr', 'figment', 'staked',
    'kiln', 'chorus-one', 'p2p-org', 'certik', 'quantstamp',
    'trail-of-bits', 'consensys', 'argent', 'rainbow-me', 'zerion',
    'coincodex', 'rotki', 'gnosis-safe', 'pillarwallet', 'trustwallet',
    'hop-protocol', 'synapse-protocol', 'stargate-protocol', 'layerzero', 'wormhole',
    'axelar', 'nomad-xyz', 'connext', 'router-protocol', 'multichain',
    'centre-io', 'liquity', 'reflexer-finance', 'angle-protocol', 'reserve',
    'cream-finance', 'venus-protocol', 'benqi', 'radiant-capital', 'euler',
    'morpho', 'gearbox', 'notional', 'hegic', 'opyn',
    'premia', 'lyra-finance', 'kwenta', 'polynomial-protocol', 'thales',
    'pika-protocol', 'cap-finance', 'mycelium', 'nexus-mutual', 'insurace',
    'unslashed', 'bridgemutual', 'armor-protocol', 'polkastarter', 'seedify',
    'dune-analytics', 'flipside-crypto', 'messari', 'coingecko', 'coinmarketcap',
    'defillama', 'token-terminal', 'cryptofees', 'l2beat', 'nansen',
    'lens-protocol', 'farcaster', 'mirror-xyz', 'paragraph', 'highlight',
    'bankless', 'the-defiant', 'decrypt', 'cointelegraph', 'near',
    'aptos-labs', 'sui-foundation', 'celestia', 'injective', 'sei-protocol',
    'osmosis', 'juno-network', 'terra-money', 'casperlabs', 'hedera',
    'iota', 'vechain', 'theta', 'elrond', 'fantom',
    'klaytn', 'icon', 'lightning', 'strike', 'river',
    'swan', 'unchained', 'hodlhodl', 'bisq', 'joinmarket',
    'eth-clients', 'beacon-chain', 'prysmatic', 'sigp', 'status',
    'nimbus', 'teku', 'lighthouse', 'grandine', 'brownie',
    'ape', 'slither', 'mythril', 'echidna', 'manticore',
    'crytic', 'code4rena', 'covalent', 'subquery', 'envio',
    'goldsky', 'subsquid', 'immunefi', 'hacken', 'slowmist',
    'peckshield', 'solidified', 'sherlock', 'cantina', 'klima',
    'redacted', 'cvx', 'crv', 'gala', 'enjin',
    'sandbox', 'otherside', 'star-atlas', 'aurory', 'voxels',
    'nft-worlds', 'bloktopia', 'wilder-world', 'cyberconnect', 'mask',
    'mina', 'ironfish', 'aleo', 'beam', 'grin',
    'kraken', 'okx', 'bybit', 'kucoin', 'gate',
    'bitfinex', 'web3py', 'web3j', 'Nethereum', 'ethers-rs',
    'alloy', 'blur', 'looksrare', 'x2y2', 'sudoswap',
    'gem', 'genie', 'magic-eden', 'solsea', 'makerdao',
    'sushiswap', 'pancakeswap', 'traderjoe', 'spookyswap', 'quickswap',
    'honeyswap', 'beefy', 'autofarm', 'alpaca', 'belt',
    'acryptos', 'ellipsis', 'nerve', 'shell', 'brightunion',
    'riskharbor', 'uma', 'dao-maker', 'bullperks', 'red-kite',
    'paal', 'chain-games', 'ledger', 'trezor', 'gridplus',
    'tally', 'frame', 'rabby', 'nft20', 'good-games',
    'yield-app', 'ancient8', 'gaming-dao', 'league-of-kingdoms', 'my-neighbor-alice',
    'big-time', 'nansen-ai', 'arkham', 'video', 'filecoin',
    'storj', 'sia', 'crust', 'livepeer', 'theta-network',
    'fei', 'basis', 'emptyset', 'across-protocol', 'pooltogether',
    'ribbon-finance', 'alchemix', 'tokemak', 'olympus', 'klima-dao',
    'redacted-cartel', 'convex-finance', 'lido', 'rocketpool', 'frax',
    'gains-network', 'perp', 'synthetix', 'hegic', 'opyn',
    'premia', 'lyra', 'kwenta', 'polynomial', 'thales',
    'pika', 'cap', 'mycelium', 'nexus', 'insurace',
    'unslashed', 'bridge', 'armor', 'shell', 'brightunion',
    'riskharbor', 'uma', 'dao', 'bullperks', 'red-kite',
    'paal', 'chain-games', 'ledger', 'trezor', 'gridplus',
    'frame', 'rabby', 'nft20', 'good-games', 'yield-app',
    'ancient8', 'gaming-dao', 'league', 'my-neighbor', 'big-time',
    'nansen', 'arkham', 'filecoin-project', 'storj', 'siafoundation',
    'crustio', 'livepeer', 'fei-protocol', 'basis-cash', 'emptyset-finance',
    'across-protocol', 'pooltogether', 'ribbon', 'alchemix', 'tokemak',
    'olympus-dao', 'klima', 'redacted', 'convex', 'lido',
    'rocket-pool', 'frax', 'gains', 'perp-protocol', 'synthetix',
    'hegic', 'opyn', 'premia', 'lyra', 'kwenta',
    'polynomial', 'thales', 'pika', 'cap', 'mycelium',
    'nexus', 'insurace', 'unslashed', 'bridge', 'armor',
    'shell', 'brightunion', 'riskharbor', 'uma', 'dao',
    'bullperks', 'red-kite', 'paal', 'chain-games', 'ledger',
    'trezor', 'gridplus', 'frame', 'rabby', 'nft20',
    'good-games', 'yield-app', 'ancient8', 'gaming-dao', 'league',
    'my-neighbor', 'big-time', 'nansen', 'arkham', 'filecoin',
    'storj', 'sia', 'crust', 'livepeer', 'theta',
    'fei', 'basis', 'emptyset', 'across', 'pooltogether',
    'ribbon', 'alchemix', 'tokemak', 'olympus', 'klima',
    'redacted', 'convex', 'lido', 'rocketpool', 'frax',
    'gains', 'perp', 'synthetix', 'hegic', 'opyn',
    'premia', 'lyra', 'kwenta', 'polynomial', 'thales',
    'pika', 'cap', 'mycelium', 'nexus', 'insurace',
    'unslashed', 'bridge', 'armor', 'shell', 'brightunion',
    'riskharbor', 'uma', 'dao', 'bullperks', 'red-kite',
    'paal', 'chain-games', 'ledger', 'trezor', 'gridplus',
    'frame', 'rabby', 'nft20', 'good-games', 'yield-app',
    'ancient8', 'gaming-dao', 'league', 'my-neighbor', 'big-time',
    'nansen', 'arkham', 'filecoin', 'storj', 'sia',
    'crust', 'livepeer', 'theta', 'fei', 'basis',
    'emptyset', 'across', 'pooltogether', 'ribbon', 'alchemix',
    'tokemak', 'olympus', 'klima', 'redacted', 'convex',
    'lido', 'rocketpool', 'frax', 'gains', 'perp',
    'synthetix', 'hegic', 'opyn', 'premia', 'lyra',
    'kwenta', 'polynomial', 'thales', 'pika', 'cap',
    'mycelium', 'nexus', 'insurace', 'unslashed', 'bridge',
    'armor', 'shell', 'brightunion', 'riskharbor', 'uma',
    'dao', 'bullperks', 'red-kite', 'paal', 'chain-games',
    'ledger', 'trezor', 'gridplus', 'frame', 'rabby',
    'nft20', 'good-games', 'yield-app', 'ancient8', 'gaming-dao',
    'league', 'my-neighbor', 'big-time', 'nansen', 'arkham',
    'filecoin', 'storj', 'sia', 'crust', 'livepeer',
    'theta', 'fei', 'basis', 'emptyset', 'across',
    'pooltogether', 'ribbon', 'alchemix', 'tokemak', 'olympus',
    'klima', 'redacted', 'convex', 'lido', 'rocketpool',
    'frax', 'gains', 'perp', 'synthetix', 'hegic',
    'opyn', 'premia', 'lyra', 'kwenta', 'polynomial',
    'thales', 'pika', 'cap', 'mycelium', 'nexus',
    'insurace', 'unslashed', 'bridge', 'armor', 'shell',
    'brightunion', 'riskharbor', 'uma', 'dao', 'bullperks',
    'red-kite', 'paal', 'chain-games', 'ledger', 'trezor',
    'gridplus', 'frame', 'rabby', 'nft20', 'good-games',
    'yield-app', 'ancient8', 'gaming-dao', 'league', 'my-neighbor',
    'big-time', 'nansen', 'arkham', 'filecoin', 'storj',
    'sia', 'crust', 'livepeer', 'theta', 'fei',
    'basis', 'emptyset', 'across', 'pooltogether', 'ribbon',
    'alchemix', 'tokemak', 'olympus', 'klima', 'redacted',
    'convex', 'lido', 'rocketpool', 'frax', 'gains',
    'perp', 'synthetix', 'hegic', 'opyn', 'premia',
    'lyra', 'kwenta', 'polynomial', 'thales', 'pika',
    'cap', 'mycelium', 'nexus', 'insurace', 'unslashed',
    'bridge', 'armor', 'shell', 'brightunion', 'riskharbor',
    'uma', 'dao', 'bullperks', 'red-kite', 'paal',
    'chain-games', 'ledger', 'trezor', 'gridplus', 'frame',
    'rabby', 'nft20', 'good-games', 'yield-app', 'ancient8',
    'gaming-dao', 'league', 'my-neighbor', 'big-time', 'nansen',
    'arkham', 'filecoin', 'storj', 'sia', 'crust',
    'livepeer', 'theta', 'fei', 'basis', 'emptyset',
    'across', 'pooltogether', 'ribbon', 'alchemix', 'tokemak',
    'olympus', 'klima', 'redacted', 'convex', 'lido',
    'rocketpool', 'frax', 'gains', 'perp', 'synthetix',
    'hegic', 'opyn', 'premia', 'lyra', 'kwenta',
    'polynomial', 'thales', 'pika', 'cap', 'mycelium',
    'nexus', 'insurace', 'unslashed', 'bridge', 'armor',
    'shell', 'brightunion', 'riskharbor', 'uma', 'dao',
    'bullperks', 'red-kite', 'paal', 'chain-games', 'ledger',
    'trezor', 'gridplus', 'frame', 'rabby', 'nft20',
    'good-games', 'yield-app', 'ancient8', 'gaming-dao', 'league',
    'my-neighbor', 'big-time', 'nansen', 'arkham'
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
    console.log(`🔗 Fetching web3 accounts...\n`);

    const { data: existingData } = await sb.from('developers').select('github_login');
    const existingSet = new Set((existingData || []).map(d => d.github_login));
    console.log(`Total in DB: ${existingSet.size}\n`);

    const insertData = [];
    let duplicates = 0;
    let notFound = 0;
    let fetched = 0;
    
    for (let i = 0; i < WEB3_ACCOUNTS.length; i++) {
        const login = WEB3_ACCOUNTS[i];
        
        if (existingSet.has(login)) {
            duplicates++;
            continue;
        }
        
        try {
            const user = await githubGet(`https://api.github.com/users/${login}`);
            fetched++;
            
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
            
            if (insertData.length % 20 === 0) {
                const type = isOrg ? '🏢' : '👤';
                console.log(`${type} ${login.padEnd(30)} - stars: ${totalStars.toLocaleString().padStart(10)}, followers: ${(user.followers || 0).toLocaleString().padStart(8)}`);
            }
            
            // Batch insert every 50
            if (insertData.length % 50 === 0) {
                const batch = insertData.slice(-50);
                const { error } = await sb.from('developers').insert(batch);
                if (error) {
                    console.log(`❌ Batch error: ${error.message}`);
                } else {
                    console.log(`✅ Batch inserted: ${batch.length}`);
                }
                await sleep(500);
            }
            
            await sleep(150);
        } catch (e) {
            await sleep(200);
        }
    }

    // Insert remaining
    const remaining = insertData.length % 50;
    if (remaining > 0) {
        const batch = insertData.slice(-remaining);
        const { error } = await sb.from('developers').insert(batch);
        if (error) {
            console.log(`❌ Final batch error: ${error.message}`);
        } else {
            console.log(`✅ Final batch inserted: ${batch.length}`);
        }
    }

    console.log(`\n\n📊 Stats:`);
    console.log(`   Fetched: ${fetched}`);
    console.log(`   Duplicates: ${duplicates}`);
    console.log(`   Not found: ${notFound}`);
    console.log(`   Inserted: ${insertData.length}\n`);

    console.log("\n🎉 Done!");
}

main().catch(console.error);
