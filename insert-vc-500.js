const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const SUPABASE_URL = "https://rhppbqsuktyunxfwnddp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocHBicXN1a3R5dW54ZnduZGRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzExMzI4NywiZXhwIjoyMDkyNjg5Mjg3fQ.H0MMEVmK17T-2Jub0SlpTjaXdq6NVECXtSbJodjPBak";
const GITHUB_TOKEN = "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";

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// VC / Investor / Finance accounts
const VC_ACCOUNTS = [
    'sequoiacap', 'a16z', 'accel', 'index-ventures', 'benchmark',
    'greylock', 'kleinerperkins', 'nea', 'generalcatalyst', 'firstmark',
    'founders-fund', 'khosla-ventures', 'draper-fisher-jurvetson', 'bessemer', 'redpoint',
    'lightspeedvp', 'insight-partners', 'tiger-global', 'coatue', 'dst-global',
    'prospect-street', 'hillhouse', 'hillhouse-capital', 'softbank', 'softbank-vision-fund',
    'ycombinator', 'techstars', '500-global', 'angel-list', 'product-hunt',
    'crunchbase', 'pitchbook', 'cbinsights', 'tracxn', 'magnitt',
    'dealroom', 'f6s', 'gust', 'angellist', 'republic',
    'wefunder', 'startengine', 'seedrs', 'crowdcube', 'syndicateroom',
    'openview', 'battery-ventures', 'spark-capital', 'union-square-ventures', 'lowercase-capital',
    'sv-angel', 'ron-conway', 'elad-gil', 'naval', 'balajis',
    'chamath', 'mcuban', 'peterthiel', 'sama', 'paulg',
    'jessicalivingston', 'katmanal', 'garrytan', 'sama', 'eladgil',
    'coinbase-ventures', 'binance-labs', 'a16z-crypto', 'paradigm', 'pantera-capital',
    'multicoin-capital', 'polychain-capital', 'dragonfly-capital', 'electric-capital', 'galaxy-digital',
    'digital-currency-group', 'grayscale', 'pantera', 'framework-ventures', 'hashkey',
    'hashed', 'spark-capital', 'mechanism-capital', 'cms-holdings', 'kenetic-capital',
    'iosg-ventures', 'ld-capital', 'longhash', 'starry-network', 'distributed-global',
    'alameda-research', 'jump-trading', 'wintermute', 'amber-group', 'suishu',
    'goldman-sachs', 'morgan-stanley', 'jp-morgan', 'blackrock', 'vanguard',
    'fidelity', 'schwab', 'citadel', 'two-sigma', 'renaissance-technologies',
    'bridgewater', 'elliott-management', 'paulson', 'icahn', 'ackman',
    'druckenmiller', 'bill-ackman', 'ray-dalio', 'warren-buffett', 'charlie-munger',
    'berkshire-hathaway', 'hathaway', 'ARK-Invest', 'cathie-wood', 'ark-invest',
    'wood-ark', 'janus-henderson', 'capital-group', 't-rowe-price', 'invesco',
    'state-street', 'northern-trust', 'bank-of-ny-mellon', 'charles-schwab', 'interactive-brokers',
    'etrade', 'td-ameritrade', 'fidelity-investments', 'vanguard-group', 'blackrock-inc',
    'ishares', 'spyder-etf', 'qqq', 'dia', 'iwm',
    'nyse', 'nasdaq', 'lse', 'tse', 'hkex',
    'sse', 'szse', 'bse', 'nse', 'asx',
    'jse', 'b3', 'mexbol', 'tmx', 'six',
    'euronext', 'xetra', 'borsa-italiana', 'madrid', 'oslo',
    'stockholm', 'helsinki', 'copenhagen', 'warsaw', 'prague',
    'athens', 'istanbul', 'tel-aviv', 'dubai', 'qatar',
    'saudi', 'kuwait', 'bahrain', 'oman', 'amman',
    'egypt', 'morocco', 'nigeria', 'kenya', 'south-africa',
    'mauritius', 'botswana', 'namibia', 'zambia', 'zimbabwe',
    'ghana', 'uganda', 'tanzania', 'rwanda', 'ethiopia',
    'securities', 'exchange', 'trading', 'investing', 'stocks',
    'bonds', 'etf', 'mutual-funds', 'hedge-funds', 'private-equity',
    'venture-capital', 'angel-investing', 'crowdfunding', 'ipo', 'spac',
    'mergers', 'acquisitions', 'due-diligence', 'valuation', 'financial-modeling',
    'investment-banking', 'wealth-management', 'asset-management', 'portfolio-management', 'risk-management',
    'compliance', 'regulation', 'sec', 'finra', 'cftc',
    'occ', 'fdic', 'federal-reserve', 'ecb', 'boe',
    'boj', 'pboc', 'rbi', 'bcm', 'banxico',
    'imf', 'world-bank', 'bis', 'fsb', 'iosco',
    'iasb', 'ifrs', 'gaap', 'acca', 'cpa',
    'cfa', 'frm', 'prm', 'caia', 'cmt',
    'bloomberg', 'reuters', 'wsj', 'ft', 'economist',
    'cnbc', 'fox-business', 'marketwatch', 'seeking-alpha', 'motley-fool',
    'investopedia', 'morningstar', 'zacks', 'tipranks', 'simply-wall st',
    'gurufocus', 'finviz', 'tradingview', 'stocktwits', 'yahoo-finance',
    'google-finance', 'marketwatch', 'barrons', 'kiplinger', 'money',
    'forbes', 'fortune', 'fast-company', 'inc', 'entrepreneur',
    'techcrunch', 'venturebeat', 'recode', 'the-information', 'axios',
    'protocol', 'politico', 'the-hill', 'roll-call', 'opensecrets',
    'follow-the-money', 'maplight', 'sunlight-foundation', 'campaign-finance', 'election-data',
    'ballotpedia', 'vote-smart', 'project-vote-smart', 'rock-the-vote', 'when-we-all-vote',
    'headcount', 'vote-org', 'turbovote', 'vote-org', 'ballot-ready',
    'civically', 'countable', 'resistbot', '5calls', 'phone-bank',
    'text-bank', 'mobilize', 'act-blue', 'winred', 'actblue',
    'seed-club', 'bankless-dao', 'lexdao', 'flamingo-dao', 'the-lao',
    'meta-cartel', 'venture-dao', 'crypto-vc', 'defi-pulse', 'defi-pulse-index',
    'token-terminator', 'messari-ventures', 'coin-metrics', 'glassnode', 'chainalysis',
    'elliptic', 'scorechain', 'solidus-labs', 'kaiko', 'cryptocompare',
    'coinmarketcap', 'coingecko', 'non-fungible', 'dappradar', 'state-of-the-dapps',
    'defi-llama', 'token-unlocks', 'vesting', 'token-vesting', 'smart-contracts',
    'audit', 'certik', 'quantstamp', 'openzeppelin', 'trail-of-bits',
    'consensys-diligence', 'halborn', 'slowmist', 'peckshield', 'chainsecurity'
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
    console.log(`💰 Populating VC District with investor/VC accounts...\n`);

    const { data: existingData } = await sb.from('developers').select('github_login');
    const existingSet = new Set((existingData || []).map(d => d.github_login));
    console.log(`Total in DB: ${existingSet.size}\n`);

    let inserted = 0;
    let duplicates = 0;
    let notFound = 0;
    
    for (const login of VC_ACCOUNTS) {
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
                primary_language: 'Finance',
                rank: inserted + 1,
                claimed: false,
                district: 'vc',
                home_district: 'vc',
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
    const { count } = await sb.from('developers').select('*', {count: 'exact', head: true}).eq('district', 'vc');
    console.log(`🟠 VC District total: ${count}`);
    console.log("\n🎉 Done!");
}

main().catch(console.error);
