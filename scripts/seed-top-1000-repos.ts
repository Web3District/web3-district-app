import { createClient } from "@supabase/supabase-js";

// ─── Config ──────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;

if (!SUPABASE_URL || !SUPABASE_KEY || !GITHUB_TOKEN) {
  console.error(
    "Missing env vars. Run: export $(grep -v '^#' .env.local | xargs) && npx tsx scripts/seed-top-1000-repos.ts"
  );
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

// ─── GitHub API Helpers ──────────────────────────────────────

const ghHeaders = {
  Accept: "application/vnd.github.v3+json",
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  "User-Agent": "git-city-top-1000-seeder",
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

// Fetch top repositories by stars from GitHub
// GitHub Search API returns max 1000 results (10 pages × 100 per page)
async function fetchTopReposByStars(page: number = 1, perPage: number = 100): Promise<GitHubRepo[]> {
  // Search for repos with stars, sorted by stars descending
  // Empty query = all repos, sorted by stars
  const query = "stars:>10000"; // Only repos with 10k+ stars to get the top ones
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${perPage}&page=${page}`;
  
  try {
    const res = await fetch(url, { headers: ghHeaders });
    if (!res.ok) {
      console.error(`Failed to fetch repos page ${page}: ${res.status} ${res.statusText}`);
      const errorText = await res.text();
      console.error(`Error details: ${errorText}`);
      return [];
    }
    const data = await res.json();
    console.log(`Page ${page}: ${data.items?.length || 0} repos, Total: ${data.total_count || 0}`);
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
    if (!res.ok) {
      if (res.status === 404) {
        console.log(`  User ${login} not found (404)`);
      } else if (res.status === 403) {
        console.log(`  Rate limited for ${login}`);
      }
      return null;
    }
    return await res.json();
  } catch (err) {
    console.log(`  Error fetching user ${login}:`, err);
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
    
    // Rate limit protection - max 5 pages
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
        contributions: 0,
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
      `  [OK]   ${user.login.padEnd(25)} — ${user.public_repos.toString().padStart(4)} repos, ${totalStars.toLocaleString().padStart(10)} stars, ${user.followers.toLocaleString().padStart(8)} followers`
    );
    return true;
  } catch (err) {
    console.log(`  [ERR]  ${user.login} - ${err}`);
    return false;
  }
}

// ─── Main ────────────────────────────────────────────────────

async function main() {
  console.log("\n🌟 SEEDING TOP 1000 REPOSITORIES BY STARS\n");
  console.log("Fetching top repositories from GitHub Search API...\n");

  const uniqueOwners = new Set<string>();
  const repoOwners: Array<{ repo: string; stars: number; owner: string }> = [];
  let totalReposFetched = 0;

  // Fetch 10 pages × 100 repos = 1000 top repos
  for (let page = 1; page <= 10; page++) {
    console.log(`📄 Fetching page ${page}/10...`);
    const repos = await fetchTopReposByStars(page, 100);
    
    if (repos.length === 0) {
      console.log("No more repos to fetch.\n");
      break;
    }
    
    totalReposFetched += repos.length;
    
    // Extract unique owners and track repo info
    for (const repo of repos) {
      repoOwners.push({
        repo: repo.full_name,
        stars: repo.stargazers_count,
        owner: repo.owner.login.toLowerCase(),
      });
      
      if (repo.owner.type !== "Organization") {
        uniqueOwners.add(repo.owner.login.toLowerCase());
      }
    }
    
    console.log(`   Found ${repos.length} repos, ${uniqueOwners.size} unique individual owners so far\n`);
    
    // Rate limit protection - GitHub allows 30 requests/min for search
    if (page < 10) {
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  console.log(`\n📊 REPOSITORY SUMMARY:`);
  console.log(`   Total repos fetched: ${totalReposFetched}`);
  console.log(`   Unique individual owners: ${uniqueOwners.size}`);
  
  // Show top 20 repos
  console.log(`\n🏆 TOP 20 REPOSITORIES:`);
  repoOwners.slice(0, 20).forEach((item, i) => {
    console.log(`   ${String(i + 1).padStart(2)}. ${item.repo.padEnd(50)} ⭐ ${item.stars.toLocaleString()}`);
  });
  
  console.log(`\n🏗️  Adding ${uniqueOwners.size} developers to database...\n`);

  // Now fetch and upsert each developer
  const ownerList = Array.from(uniqueOwners);
  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < ownerList.length; i++) {
    const login = ownerList[i];
    console.log(`[${String(i + 1).padStart(3, "0")}/${ownerList.length}] ${login}`);
    
    const user = await fetchUser(login);
    
    if (!user) {
      console.log(`  [SKIP] ${login} - user not found or rate limited`);
      skipped++;
      continue;
    }
    
    const ok = await upsertDeveloper(user);
    if (ok) success++;
    else failed++;

    // Rate limit protection - 1.5s between requests (safer)
    await new Promise((r) => setTimeout(r, 1500));
  }

  // Recalculate ranks
  console.log("\n📈 Recalculating ranks...");
  const { error } = await sb.rpc("recalculate_ranks");
  if (error) {
    console.error("Failed to recalculate ranks:", error.message);
  } else {
    console.log("✅ Ranks updated.");
  }

  console.log(`\n🎉 TOP 1000 REPOS SEEDED!`);
  console.log(`   ✅ Developers added: ${success}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📦 Total repos processed: ${totalReposFetched}`);
  console.log(`\nYour city now has the creators of the top ${totalReposFetched} GitHub repositories! 🌟🏙️\n`);
}

main().catch(console.error);
