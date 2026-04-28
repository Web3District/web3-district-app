const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const SUPABASE_URL = "https://rhppbqsuktyunxfwnddp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocHBicXN1a3R5dW54ZnduZGRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzExMzI4NywiZXhwIjoyMDkyNjg5Mjg3fQ.H0MMEVmK17T-2Jub0SlpTjaXdq6NVECXtSbJodjPBak";
const GITHUB_TOKEN = "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";

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// Top marketing/growth repos from GitHub search
const MARKETING_REPOS = [
    'public-apis', 'freeCodeCamp', 'awesome', 'system-design-primer',
    'build-your-own-x', 'developer-roadmap', 'coding-interview-university',
    '30-seconds-of-code', 'react', 'vue', 'angular', 'node', 'express',
    'next.js', 'nuxt', 'gatsby', 'strapi', 'directus', 'ghost',
    'wordpress', 'drupal', 'joomla', 'magento', 'woocommerce',
    'shopify', 'squarespace', 'wix', 'webflow', 'framer',
    'notion', 'airtable', 'figma', 'canva', 'adobe',
    'hubspot', 'salesforce', 'marketo', 'pardot', 'activecampaign',
    'mailchimp', 'sendgrid', 'convertkit', 'getresponse', 'aweber',
    'constant-contact', 'campaign-monitor', 'drip', 'klaviyo', 'omnisend',
    'google-analytics', 'analytics', 'matomo', 'plausible', 'fathom',
    'segment', 'mixpanel', 'amplitude', 'heap', 'hotjar',
    'fullstory', 'logrocket', 'sentry', 'bugsnag', 'rollbar',
    'optimizely', 'vwo', 'unbounce', 'instapage', 'leadpages',
    'clickfunnels', 'kartra', 'kajabi', 'teachable', 'thinkific',
    'podia', 'gumroad', 'lemonsqueezy', 'paddle', 'stripe',
    'paypal', 'square', 'adyen', 'braintree', 'checkout',
    'zapier', 'make', 'n8n', 'integromat', 'ifttt',
    'buffer', 'hootsuite', 'sprout-social', 'later', 'planoly',
    'tailwind', 'coschedule', 'meetedge', 'socialbee', 'loomly',
    'agorapulse', 'sendible', 'crowdfire', 'gramhir', 'iconosquare',
    'socialblade', 'buzzsumo', 'ahrefs', 'semrush', 'moz',
    'majestic', 'spyfu', 'serpstat', 'kwfinder', 'ubersuggest',
    'answerthepublic', 'alsoasked', 'frase', 'clearscope', 'surfer',
    'marketmuse', 'wordtune', 'grammarly', 'hemingway', 'prowritingaid',
    'jasper', 'copyai', 'writesonic', 'rytr', 'anyword',
    'persuade', 'mutiny', 'copymonkey', 'nickelled', 'userpilot',
    'appcues', 'chameleon', 'intercom', 'drift', 'crisp',
    'zendesk', 'freshdesk', 'helpscout', 'groove', 'kayako',
    'livechat', 'olark', 'tawk', 'smartsupp', 'userlike',
    'typeform', 'google-forms', 'jotform', 'wufoo', 'formstack',
    'gravity-forms', 'contact-form-7', 'wpforms', 'ninja-forms', 'formidable',
    'calendly', 'cal', 'acuity', 'simplybook', 'appointlet',
    'loom', 'vidyard', 'wistia', 'vimeo', 'youtube',
    'twitch', 'tiktok', 'instagram', 'facebook', 'twitter',
    'linkedin', 'pinterest', 'snapchat', 'reddit', 'discord',
    'slack', 'teams', 'zoom', 'meet', 'webex',
    'gotowebinar', 'demio', 'livestorm', 'streamyard', 'riverside',
    'descript', 'capcut', 'inshot', 'kinemaster', 'filmmaker-pro',
    'premiere', 'final-cut', 'davinci', 'after-effects', 'motion',
    'blender', 'cinema4d', 'maya', '3ds-max', 'sketchup',
    'trello', 'asana', 'monday', 'clickup', 'notion',
    'airtable', 'smartsheet', 'wrike', 'teamwork', 'basecamp',
    'slack', 'discord', 'mattermost', 'rocket-chat', 'element',
    'github', 'gitlab', 'bitbucket', 'azure-devops', 'jenkins',
    'circleci', 'travis', 'github-actions', 'argocd', 'spinnaker',
    'terraform', 'ansible', 'puppet', 'chef', 'saltstack',
    'docker', 'kubernetes', 'helm', 'istio', 'linkerd',
    'prometheus', 'grafana', 'datadog', 'newrelic', 'dynatrace',
    'elastic', 'splunk', 'sumo-logic', 'logz', 'papertrail',
    'sentry', 'rollbar', 'bugsnag', 'honeybadger', 'exceptionless',
    'statuspage', 'pingdom', 'uptimerobot', 'statuscake', 'checkly',
    'cloudflare', 'fastly', 'akamai', 'aws-cloudfront', 'azure-cdn',
    'vercel', 'netlify', 'heroku', 'digitalocean', 'linode',
    'vultr', 'hetzner', 'ovh', 'scaleway', 'contabo',
    'aws', 'azure', 'gcp', 'oracle-cloud', 'ibm-cloud',
    'alibaba-cloud', 'tencent-cloud', 'huawei-cloud', 'rackspace', 'dreamhost',
    'siteground', 'bluehost', 'hostgator', 'godaddy', 'namecheap',
    'cloudflare', 'stackpath', 'bunnycdn', 'keycdn', 'maxcdn',
    'unsplash', 'pexels', 'pixabay', 'shutterstock', 'getty',
    'istock', 'depositphotos', '123rf', 'dreamstime', 'freepik',
    'flaticon', 'iconfinder', 'thenounproject', 'iconscout', 'icons8',
    'fonts-google', 'fonts-adobe', 'fontsquirrel', 'dafont', 'fontspace',
    'coolors', 'colorhunt', 'paletton', 'adobe-color', 'khroma',
    'dribbble', 'behance', 'pinterest', 'awwwards', 'cssdesignawards',
    'siteinspire', 'httpster', 'onepagelove', 'landings', 'lapa',
    'saaslandingpage', 'landingfolio', 'land-book', 'sitesee', 'ecommerce',
    'shopify-themes', 'themeforest', 'creative-market', 'envato', 'graphicriver',
    'videohive', 'audiojungle', 'photodune', '3docean', 'codecanyon',
    'codepen', 'jsfiddle', 'jsbin', 'replit', 'codesandbox',
    'stackblitz', 'glitch', 'observable', 'colab', 'kaggle',
    'huggingface', 'replicate', 'modal', 'banana', 'beam',
    'midjourney', 'dall-e', 'stable-diffusion', 'runway', 'synthesia',
    'elevenlabs', 'murf', 'playht', 'wellSaid', 'descript',
    'otter', 'rev', 'temi', 'sonix', 'trint',
    'grammarly', 'quillbot', 'wordtune', 'spinbot', 'paraphraser',
    'hemingway', 'prowritingaid', 'ginger', 'linguix', 'writer',
    'notion', 'obsidian', 'roam', 'logseq', 'craft',
    'bear', 'ulysses', 'ia-writer', 'byword', 'scrivener',
    'evernote', 'onenote', 'simplenote', 'standard-notes', 'joplin',
    'trello', 'asana', 'monday', 'clickup', 'airtable',
    'notion', 'coda', 'fibery', 'anytype', 'amplenote'
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
    console.log(`🚀 Populating Growth District with marketing/growth accounts...\n`);

    const { data: existingData } = await sb.from('developers').select('github_login');
    const existingSet = new Set((existingData || []).map(d => d.github_login));
    console.log(`Total in DB: ${existingSet.size}\n`);

    let inserted = 0;
    let duplicates = 0;
    let notFound = 0;
    
    for (const login of MARKETING_REPOS) {
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
                primary_language: 'JavaScript',
                rank: inserted + 1,
                claimed: false,
                district: 'growth',
                home_district: 'growth',
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
                if (inserted % 20 === 0) {
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
    const { count } = await sb.from('developers').select('*', {count: 'exact', head: true}).eq('district', 'growth');
    console.log(`🟢 Growth District total: ${count}`);
    console.log("\n🎉 Done!");
}

main().catch(console.error);
