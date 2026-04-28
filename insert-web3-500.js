const { createClient } = require('@supabase/supabase-js');
const https = require('https');

// Supabase config
const SUPABASE_URL = "https://rhppbqsuktyunxfwnddp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocHBicXN1a3R5dW54ZnduZGRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzExMzI4NywiZXhwIjoyMDkyNjg5Mjg3fQ.H0MMEVmK17T-2Jub0SlpTjaXdq6NVECXtSbJodjPBak";
const GITHUB_TOKEN = "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";

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// Extended web3 accounts - DeFi, NFTs, Infrastructure, L1/L2, Tools
const WEB3_ACCOUNTS = [
    // Already inserted (skip these)
    // New additions - DeFi protocols
    'curvefi', 'yearn', 'ConvexFinance', 'rocket-pool', 'LidoFinance',
    'fraxfinance', 'olympusdao', 'tokemak', 'AlchemixFi', 'RibbonFinance',
    'dydxprotocol', 'perpetual-protocol', 'GMX-io', 'gains-network', 'SynthetixIO',
    'balancer', 'bancor', 'KyberNetwork', '1inch', 'Matcha-xyz',
    'paraswap', '0x', 'airswap', 'loopring', 'starkware',
    
    // NFT & Gaming
    'axieinfinity', 'skyweaver', 'gods-unchained', 'illuvium', 'ember-sword',
    'decentraland', 'cryptovoxels', 'somniumspace', 'nftx', 'superrare',
    'async-art', 'knownorigin', 'makersplace', 'niftygateway', 'bakeryswap',
    'treasure-dao', 'yield-guild', 'merit-circle', 'gamefi', 'ultra',
    
    // Layer 2 & Scaling
    'optimism', 'arbitrum', 'polygon', 'zksync', 'starknet',
    'scroll-tech', 'linea', 'base-org', 'mantlenetwork', 'metis',
    'boba-network', 'aurora-isle', 'moonbeam', 'moonriver', 'celo-org',
    'harmony-one', 'fuse-network', 'gnosis', 'rootstock', 'stacks',
    
    // Oracles & Data
    'API3', 'bandprotocol', 'dia-data', 'fluxprotocol', 'pyth-network',
    'switchboard', 'chroniclelabs', 'tellor', 'redstone-finance', 'gelato',
    
    // Identity & Privacy
    'worldcoin', 'proof-xyz', 'gitcoin', 'clr-fund', 'radicle',
    'brightid', 'spruceid', 'iden3', 'aztec-protocol', 'tornado-cash',
    'railgun', 'penumbra-zone', 'secret-network', 'oasisprotocol', 'findora',
    
    // DAO Tools
    'snapshot-labs', 'tally', 'deepdao', 'boardroom', 'coordination',
    'colony', 'aragon', 'dao-drops', 'shards', 'commonwealth',
    
    // Developer Tools
    'AlchemyPlatform', 'moralis', 'thirdweb-dev', 'quicknode', 'ankr',
    'figment', 'staked', 'kiln', 'chorus-one', 'p2p-org',
    'certik', 'quantstamp', 'trail-of-bits', 'consensys', 'openzeppelin',
    
    // Wallets
    'argent', 'rainbow-me', 'zerion', 'debank', 'zapper-fi',
    'coincodex', 'rotki', 'gnosis-safe', 'pillarwallet', 'trustwallet',
    
    // Bridges
    'hop-protocol', 'synapse-protocol', 'stargate-protocol', 'layerzero', 'wormhole',
    'axelar', 'nomad-xyz', 'connext', 'router-protocol', 'multichain',
    
    // Stablecoins
    'centre-io', 'fraxfinance', 'liquity', 'reflexer-finance', 'angle-protocol',
    'reserve', 'basis', 'emptyset-finance', 'ribbon-finance', 'alchemix',
    
    // Yield & Lending
    'aave', 'compound', 'cream-finance', 'venus-protocol', 'benqi',
    'radiant-capital', 'euler', 'morpho', 'gearbox', 'notional',
    
    // Derivatives
    'hegic', 'opyn', 'premia', 'lyra-finance', 'kwenta',
    'polynomial-protocol', 'thales', 'pika-protocol', 'cap-finance', 'mycelium',
    
    // Insurance
    'nexus-mutual', 'insurace', 'unslashed', 'bridgemutual', 'armor-protocol',
    
    // Launchpads
    'polkastarter', 'seedify', 'trustswap', 'balancer', 'sushiswap',
    
    // Analytics
    'dune-analytics', 'flipside-crypto', 'messari', 'coingecko', 'coinmarketcap',
    'defillama', 'token-terminal', 'cryptofees', 'l2beat', 'nansen',
    
    // Social & Content
    'lens-protocol', 'farcaster', 'mirror-xyz', 'paragraph', 'highlight',
    'bankless', 'the-defiant', 'decrypt', 'cointelegraph', 'coinbase',
    
    // More L1s
    'near', 'aptos-labs', 'sui-foundation', 'celestia', 'injective',
    'sei-protocol', 'osmosis', 'juno-network', 'terra-money', 'casperlabs',
    'hedera', 'iota', 'vechain', 'theta', 'elrond',
    'fantom', 'harmony', 'one', 'klaytn', 'icon',
    
    // Bitcoin ecosystem
    'blockstream', 'lightning', 'strike', 'river', 'swan',
    'unchained', 'diamond-hands', 'hodlhodl', 'bisq', 'joinmarket',
    
    // Ethereum core
    'ethereum', 'eth-clients', 'beacon-chain', 'prysmatic', 'sigp',
    'status', 'nimbus', 'teku', 'lighthouse', 'grandine',
    
    // More tools
    'hardhat', 'foundry', 'brownie', 'ape', 'slither',
    'mythril', 'echidna', 'manticore', 'crytic', 'trailofbits',
    
    // Infrastructure
    'infura', 'alchemy', 'quicknode', 'moralis', 'covalent',
    'thegraph', 'subquery', 'envio', 'goldsky', 'subsquid',
    
    // Security
    'immunefi', 'hacken', 'certik', 'quantstamp', 'slowmist',
    'peckshield', 'solidified', 'code4rena', 'sherlock', 'cantina',
    
    // More DeFi
    'ribbon', 'tokemak', 'olympus', 'klima', 'redacted',
    'convex', 'cvx', 'crv', 'lido', 'rocketpool',
    
    // Gaming infra
    'immutable', 'gala', 'enjin', 'ultra', 'vulcan',
    
    // Metaverse
    'decentraland', 'sandbox', 'otherside', 'star-atlas', 'illuvium',
    
    // More wallets
    'metamask', 'walletconnect', 'coinbase-wallet', 'trustwallet', 'ledger',
    'trezor', 'gridplus', 'tally', 'frame', 'rabby',
    
    // Cross-chain
    'layerzero-labs', 'axelar-network', 'wormhole-foundation', 'nomad', 'hop',
    
    // Privacy coins
    'monero', 'zcash', 'dash', 'beam', 'grin',
    
    // Exchanges (dev teams)
    'binance', 'coinbase', 'kraken', 'ftx', 'huobi',
    'okx', 'bybit', 'kucoin', 'gate', 'bitfinex',
    
    // More tools
    'ethers-io', 'web3', 'wagmi', 'viem', 'ethersjs',
    'web3py', 'web3j', 'Nethereum', 'ethers-rs', 'alloy',
    
    // NFT marketplaces
    'opensea', 'blur', 'looksrare', 'x2y2', 'sudoswap',
    'gem', 'genie', 'nftrade', 'magic-eden', 'solsea',
    
    // DAOs
    'makerdao', 'uniswap', 'aave', 'compound', 'curve',
    'balancer', 'yearn', 'convex', 'lido', 'optimism',
    
    // More L2s
    'polygon-zkevm', 'zksync', 'starknet', 'scroll', 'linea',
    'base', 'mantle', 'mode', 'blast', 'zora',
    
    // Infrastructure providers
    'ankr', 'figment', 'staked', 'kiln', 'chorus-one',
    'p2p-org', 'everstake', 'validatrium', 'stakin', 'citadel-one',
    
    // Oracles
    'chainlink', 'api3', 'band', 'dia', 'flux',
    'pyth', 'switchboard', 'chronicle', 'tellor', 'redstone',
    
    // Identity
    'ens', 'unstoppable', 'handshake', 'namecoin', 'space-id',
    'bonk', 'lens', 'farcaster', 'cyberconnect', 'mask',
    
    // Privacy
    'aztec', 'tornado', 'railgun', 'penumbra', 'secret',
    'oasis', 'findora', 'mina', 'ironfish', 'aleo',
    
    // Gaming
    'axie', 'skyweaver', 'gods', 'illuvium', 'ember',
    'decentraland', 'voxels', 'somnium', 'star-atlas', 'aurory',
    
    // Social
    'lens', 'farcaster', 'mirror', 'paragraph', 'highlight',
    'bankless', 'defiant', 'decrypt', 'cointelegraph', 'coindesk',
    
    // More Bitcoin
    'bitcoin', 'lightning', 'blockstream', 'strike', 'river',
    'swan', 'unchained', 'hodlhodl', 'bisq', 'joinmarket',
    
    // Ethereum clients
    'geth', 'nethermind', 'besu', 'erigon', 'reth',
    'prysm', 'lighthouse', 'teku', 'nimbus', 'lodestar',
    
    // Dev tools
    'hardhat', 'foundry', 'brownie', 'ape', 'slither',
    'mythril', 'echidna', 'manticore', 'crytic', 'code4rena',
    
    // Analytics
    'dune', 'flipside', 'messari', 'coingecko', 'defillama',
    'tokenterminal', 'cryptofees', 'l2beat', 'nansen', 'arkham',
    
    // More infrastructure
    'ipfs', 'filecoin', 'arweave', 'storj', 'sia',
    'crust', 'livepeer', 'theta', 'video', 'livepeer',
    
    // Cross-chain bridges
    'hop', 'synapse', 'stargate', 'layerzero', 'wormhole',
    'axelar', 'nomad', 'connext', 'router', 'multichain',
    
    // Stablecoins
    'centre', 'frax', 'liquity', 'reflexer', 'angle',
    'reserve', 'basis', 'emptyset', 'fei', 'olympus',
    
    // Lending
    'aave', 'compound', 'cream', 'venus', 'benqi',
    'radiant', 'euler', 'morpho', 'gearbox', 'notional',
    
    // DEXs
    'uniswap', 'sushiswap', 'curve', 'balancer', 'pancakeswap',
    'traderjoe', 'spookyswap', 'quickswap', 'honeyswap', 'dydx',
    
    // Yield
    'yearn', 'convex', 'beefy', 'autofarm', 'alpaca',
    'belt', 'acryptos', 'ellipsis', 'nerve', 'synapse',
    
    // Derivatives
    'dydx', 'gmx', 'gains', 'perp', 'synthetix',
    'hegic', 'opyn', 'premia', 'lyra', 'kwenta',
    
    // Insurance
    'nexus', 'insurace', 'unslashed', 'bridge', 'armor',
    'shell', 'brightunion', 'riskharbor', 'uma', 'opyn',
    
    // Launchpads
    'polkastarter', 'seedify', 'trustswap', 'dao-maker', 'bullperks',
    'enjin', 'starter', 'red-kite', 'paal', 'chain-games',
    
    // More wallets
    'argent', 'rainbow', 'zerion', 'debank', 'zapper',
    'rotki', 'gnosis', 'pillar', 'trust', 'ledger',
    
    // NFT tools
    'nftx', 'nft20', 'sudoswap', 'gem', 'genie',
    'looksrare', 'x2y2', 'blur', 'opensea', 'magic-eden',
    
    // Gaming guilds
    'yield-guild', 'merit-circle', 'good-games', 'yield-app', 'ancient8',
    'gaming-dao', 'league-of-kingdoms', 'my-neighbor-alice', 'big-time', 'ember-sword',
    
    // Metaverse platforms
    'decentraland', 'sandbox', 'otherside', 'star-atlas', 'illuvium',
    'voxels', 'somnium', 'nft-worlds', 'bloktopia', 'wilder-world',
    
    // More L1s
    'solana', 'cardano', 'avalanche', 'polygon', 'fantom',
    'harmony', 'near', 'aptos', 'sui', 'celestia',
    'injective', 'sei', 'osmosis', 'juno', 'terra',
    'casper', 'hedera', 'iota', 'vechain', 'theta',
    'elrond', 'klaytn', 'icon', 'ontology', 'neo',
    
    // More tools
    'alchemy', 'infura', 'quicknode', 'moralis', 'covalent',
    'thegraph', 'subquery', 'envio', 'goldsky', 'subsquid',
    'ankr', 'figment', 'staked', 'kiln', 'chorus-one'
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
    console.log(`🔗 Fetching ${WEB3_ACCOUNTS.length} web3 accounts...\n`);

    // Get existing
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
            if (duplicates % 10 === 0) {
                console.log(`✓ ${login.padEnd(30)} - skip (exists)`);
            }
            continue;
        }
        
        try {
            const user = await githubGet(`https://api.github.com/users/${login}`);
            fetched++;
            
            if (user.message === 'Not Found') {
                notFound++;
                await sleep(150);
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
            
            if (insertData.length % 10 === 0) {
                const type = isOrg ? '🏢' : '👤';
                console.log(`${type} ${login.padEnd(30)} - stars: ${totalStars.toLocaleString().padStart(10)}, followers: ${(user.followers || 0).toLocaleString().padStart(8)}`);
            }
            
            await sleep(200);
        } catch (e) {
            await sleep(300);
        }
    }

    console.log(`\n\n📊 Stats:`);
    console.log(`   Fetched: ${fetched}`);
    console.log(`   Duplicates: ${duplicates}`);
    console.log(`   Not found: ${notFound}`);
    console.log(`   To insert: ${insertData.length}\n`);
    
    if (insertData.length > 0) {
        console.log(`📝 Inserting ${insertData.length} developers...\n`);
        
        let successCount = 0;
        let failCount = 0;
        
        for (const dev of insertData) {
            const { error } = await sb.from('developers').insert(dev);
            if (error) {
                failCount++;
            } else {
                successCount++;
            }
            await sleep(50);
        }
        
        console.log(`\n✅ Inserted ${successCount} developers (${failCount} failed)`);
    }

    console.log("\n🎉 Done!");
}

main().catch(console.error);
