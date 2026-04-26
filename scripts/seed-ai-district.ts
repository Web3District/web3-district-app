import { createClient } from "@supabase/supabase-js";

// ─── Config ──────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;

if (!SUPABASE_URL || !SUPABASE_KEY || !GITHUB_TOKEN) {
  console.error(
    "Missing env vars. Make sure NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and GITHUB_TOKEN are set."
  );
  console.error("Run: source .env.local && npx tsx scripts/seed-ai-district.ts");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

// ─── GitHub API Helpers ──────────────────────────────────────

const ghHeaders = {
  Accept: "application/vnd.github.v3+json",
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  "User-Agent": "git-city-ai-seeder",
};

interface GitHubRepo {
  name: string;
  full_name: string;
  owner: {
    login: string;
    id: number;
    type: string;
    avatar_url: string;
  };
  stargazers_count: number;
  language: string | null;
  description: string | null;
  html_url: string;
  fork: boolean;
  size: number;
}

interface GitHubUser {
  login: string;
  id: number;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  type: string;
}

// Fetch top AI repos from GitHub search
async function fetchTopAIRepos(page: number = 1, perPage: number = 100): Promise<GitHubRepo[]> {
  // Simpler query that GitHub accepts
  const query = "ai in:name,description OR machine-learning in:name,description";
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${perPage}&page=${page}`;
  
  try {
    const res = await fetch(url, { headers: ghHeaders });
    if (!res.ok) {
      console.error(`Failed to fetch repos page ${page}: ${res.status}`);
      return [];
    }
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error(`Error fetching repos page ${page}:`, err);
    return [];
  }
}

// Fetch user profile from GitHub
async function fetchUser(login: string): Promise<GitHubUser | null> {
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(login)}`, {
      headers: ghHeaders,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Fetch repos for a user to calculate total stars
async function fetchUserRepos(login: string): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  let page = 1;
  
  while (true) {
    const url = `https://api.github.com/users/${encodeURIComponent(login)}/repos?sort=pushed&per_page=100&page=${page}`;
    const res = await fetch(url, { headers: ghHeaders });
    if (!res.ok) break;
    
    const pageRepos = await res.json();
    if (pageRepos.length === 0) break;
    
    repos.push(...pageRepos);
    page++;
    
    // Rate limit protection
    if (page > 5) break;
  }
  
  return repos;
}

// Upsert developer to Supabase
async function upsertDeveloper(user: GitHubUser): Promise<boolean> {
  // Skip organizations
  if (user.type === "Organization") {
    console.log(`  [SKIP] ${user.login} - organization`);
    return false;
  }

  try {
    // Fetch user's repos to calculate total stars
    const userRepos = await fetchUserRepos(user.login);
    const ownRepos = userRepos.filter((r) => !r.fork);
    const totalStars = ownRepos.reduce((sum, r) => sum + r.stargazers_count, 0);
    
    // Calculate primary language
    const langCounts: Record<string, number> = {};
    for (const repo of ownRepos) {
      if (repo.language) {
        langCounts[repo.language] = (langCounts[repo.language] || 0) + repo.size;
      }
    }
    const primaryLanguage = Object.entries(langCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;

    // Top 5 repos by stars
    const topRepos = ownRepos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5)
      .map((r) => ({
        name: r.name,
        stars: r.stargazers_count,
        language: r.language,
        url: r.html_url,
      }));

    // Upsert to Supabase
    const { error } = await sb.from("developers").upsert(
      {
        github_login: user.login.toLowerCase(),
        github_id: user.id,
        name: user.name,
        avatar_url: user.avatar_url,
        bio: user.bio,
        contributions: 0, // Will be fetched separately if needed
        public_repos: user.public_repos,
        total_stars: totalStars,
        primary_language: primaryLanguage,
        top_repos: topRepos,
        fetched_at: new Date().toISOString(),
        followers: user.followers,
        following: user.following,
        account_created_at: user.created_at,
      },
      { onConflict: "github_login" }
    );

    if (error) {
      console.log(`  [ERR]  ${user.login} - ${error.message}`);
      return false;
    }

    console.log(
      `  [OK]   ${user.login} — ${user.public_repos} repos, ${totalStars.toLocaleString()} total stars, ${user.followers.toLocaleString()} followers`
    );
    return true;
  } catch (err) {
    console.log(`  [ERR]  ${user.login} - ${err}`);
    return false;
  }
}

// ─── Main ────────────────────────────────────────────────────

async function main() {
  console.log("\n🤖 SEEDING AI DISTRICT - Top AI Repository Owners\n");
  console.log("Fetching top AI repositories from GitHub...\n");

  const uniqueOwners = new Set<string>();
  let totalReposFetched = 0;

  // Fetch multiple pages to get 1000+ unique repo owners
  for (let page = 1; page <= 10; page++) {
    console.log(`📄 Fetching page ${page}...`);
    const repos = await fetchTopAIRepos(page, 100);
    
    if (repos.length === 0) {
      console.log("No more repos to fetch.\n");
      break;
    }
    
    totalReposFetched += repos.length;
    
    // Extract unique owners
    for (const repo of repos) {
      if (repo.owner.type !== "Organization") {
        uniqueOwners.add(repo.owner.login.toLowerCase());
      }
    }
    
    console.log(`   Found ${repos.length} repos, ${uniqueOwners.size} unique owners so far\n`);
    
    // Rate limit protection - wait between pages
    if (page < 10) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log(`\n📊 SUMMARY:`);
  console.log(`   Total repos fetched: ${totalReposFetched}`);
  console.log(`   Unique AI developers: ${uniqueOwners.size}\n`);
  console.log(`🏗️  Adding developers to database...\n`);

  // Now fetch and upsert each developer
  const ownerList = Array.from(uniqueOwners);
  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < ownerList.length; i++) {
    const login = ownerList[i];
    console.log(`[${i + 1}/${ownerList.length}] ${login}`);
    
    const user = await fetchUser(login);
    
    if (!user) {
      console.log(`  [SKIP] ${login} - user not found`);
      skipped++;
      continue;
    }
    
    const ok = await upsertDeveloper(user);
    if (ok) success++;
    else failed++;

    // Rate limit protection - 1s between requests
    await new Promise((r) => setTimeout(r, 1000));
  }

  // Recalculate ranks
  console.log("\n📈 Recalculating ranks...");
  const { error } = await sb.rpc("recalculate_ranks");
  if (error) {
    console.error("Failed to recalculate ranks:", error.message);
  } else {
    console.log("✅ Ranks updated.");
  }

  console.log(`\n🎉 AI DISTRICT SEEDED!`);
  console.log(`   ✅ Added: ${success}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`\nYour AI District now has ${success} AI developers! 🤖🏙️\n`);
}

main().catch(console.error);
