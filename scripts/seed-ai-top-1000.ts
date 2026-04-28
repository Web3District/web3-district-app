/**
 * Seed TOP 1000 AI/ML GitHub Repositories
 * Fetches AI-related repos using GitHub Search API
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://rhppbqsuktyunxfwnddp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocHBicXN1a3R5dW54ZnduZGRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzExMzI4NywiZXhwIjoyMDkyNjg5Mjg3fQ.H0MMEVmK17T-2Jub0SlpTjaXdq6NVECXtSbJodjPBak"
);

const GITHUB_TOKEN = "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";

// GitHub Search queries for AI/ML repos
const AI_SEARCH_QUERIES = [
  "machine-learning",
  "deep-learning",
  "artificial-intelligence",
  "neural-network",
  "pytorch",
  "tensorflow",
  "transformer",
  "llm",
  "large-language-model",
  "generative-ai",
  "computer-vision",
  "nlp",
  "reinforcement-learning",
  "diffusion-model",
  "ai-framework",
];

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
    followers: number;
  };
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  homepage: string | null;
  topics: string[];
  private: boolean;
  open_issues_count: number;
}

async function fetchAIRepos(): Promise<GitHubRepo[]> {
  const allRepos = new Map<number, GitHubRepo>();
  for (const query of AI_SEARCH_QUERIES) {
    console.log(`\n🔍 Searching: "${query}"`);
    
    for (let page = 1; page <= 10; page++) {
      try {
        const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=100&page=${page}`;
        const res = await fetch(url, {
          headers: {
            "Authorization": `token ${GITHUB_TOKEN}`,
            "Accept": "application/vnd.github.v3+json",
          },
        });

        if (!res.ok) {
          if (res.status === 403) {
            console.warn("⚠️ Rate limited, waiting...");
            await new Promise(r => setTimeout(r, 60000));
            page--; // retry this page
            continue;
          }
          console.error(`❌ API error: ${res.status}`);
          break;
        }

        const data = await res.json();
        const items = data.items || [];

        if (items.length === 0) break;

        for (const repo of items as GitHubRepo[]) {
          if (!allRepos.has(repo.owner.id)) {
            allRepos.set(repo.owner.id, repo);
          }
        }

        console.log(`   Page ${page}: ${items.length} repos, ${allRepos.size} unique owners`);

        // Rate limit handling
        const remaining = res.headers.get("X-RateLimit-Remaining");
        if (remaining && parseInt(remaining) < 10) {
          console.warn("⚠️ Rate limit low, waiting...");
          await new Promise(r => setTimeout(r, 10000));
        }

        await new Promise(r => setTimeout(r, 1000)); // Be nice to API

      } catch (err) {
        console.error(`Error on page ${page}:`, err);
        break;
      }
    }
  }

  return Array.from(allRepos.values());
}

async function getOrCreateDeveloper(owner: GitHubRepo["owner"], repo: GitHubRepo) {

  // Check if developer exists
  const { data: existing } = await supabase
    .from("developers")
    .select("id")
    .eq("github_login", owner.login)
    .single();

  if (existing) {
    // Update with AI district and stars
    const { data: updated } = await supabase
      .from("developers")
      .update({
        district: "data_ai",
        total_stars: repo.stargazers_count,
        primary_language: repo.language || "Python",
      })
      .eq("id", existing.id)
      .select()
      .single();
    return updated;
  }

  // Create new developer
  const { data: newDev, error } = await supabase
    .from("developers")
    .insert({
      github_login: owner.login,
      name: owner.login,
      avatar_url: owner.avatar_url,
      followers: owner.followers,
      total_stars: repo.stargazers_count,
      public_repos: 1,
      primary_language: repo.language || "Python",
      district: "data_ai",
      claimed: false,
      contributions: 0,
      rank: 0,
      account_created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error(`Error creating ${owner.login}:`, error.message);
    return null;
  }

  return newDev;
}

async function main() {
  console.log("🤖 SEEDING TOP AI/ML DEVELOPERS\n");

  const repos = await fetchAIRepos();
  console.log(`\n📊 Found ${repos.length} unique AI repo owners`);

  let added = 0;
  let updated = 0;
  let skipped = 0;

  for (const repo of repos) {
    const owner = repo.owner;
    
    const result = await getOrCreateDeveloper(owner, repo);
    
    if (result) {
      console.log(`[OK] ${owner.login.padEnd(25)} — ${repo.stargazers_count.toLocaleString()} ⭐, ${owner.followers.toLocaleString()} followers`);
      added++;
    } else {
      skipped++;
    }

    if (added % 10 === 0) {
      console.log(`\n...${added} processed...\n`);
    }
  }

  console.log("\n✅ SEEDING COMPLETE!");
  console.log(`Added/Updated: ${added}`);
  console.log(`Skipped: ${skipped}`);

  // Get final count
  const { count } = await supabase
    .from("developers")
    .select("*", { count: "exact", head: true })
    .eq("district", "ai");

  console.log(`\n🤖 AI District total: ${count} developers`);
}

main().catch(console.error);
