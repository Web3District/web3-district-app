/**
 * Fast AI Developer Seeder - Batch Insert
 * Adds top AI/ML developers in bulk
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://rhppbqsuktyunxfwnddp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocHBicXN1a3R5dW54ZnduZGRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzExMzI4NywiZXhwIjoyMDkyNjg5Mjg3fQ.H0MMEVmK17T-2Jub0SlpTjaXdq6NVECXtSbJodjPBak"
);

const GITHUB_TOKEN = "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";

interface GitHubRepo {
  owner: { login: string; id: number; avatar_url: string; followers: number };
  stargazers_count: number;
  language: string | null;
}

async function fetchTopAIRepos(limit: number = 500): Promise<GitHubRepo[]> {
  const allRepos = new Map<number, GitHubRepo>();
  const queries = ["machine-learning", "deep-learning", "artificial-intelligence", "llm", "transformer", "pytorch", "tensorflow"];
  
  for (const query of queries) {
    if (allRepos.size >= limit) break;
    
    console.log(`🔍 Searching: "${query}"`);
    
    for (let page = 1; page <= 3; page++) {
      try {
        const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=100&page=${page}`;
        const res = await fetch(url, {
          headers: {
            "Authorization": `token ${GITHUB_TOKEN}`,
            "Accept": "application/vnd.github.v3+json",
          },
        });

        if (!res.ok) break;
        const data = await res.json();
        
        for (const repo of (data.items || [])) {
          if (!allRepos.has(repo.owner.id)) {
            allRepos.set(repo.owner.id, repo);
          }
        }
        
        console.log(`   Page ${page}: ${allRepos.size} unique`);
        await new Promise(r => setTimeout(r, 500));
      } catch (err) {
        break;
      }
    }
  }
  
  return Array.from(allRepos.values());
}

async function main() {
  console.log("🤖 FAST AI DEVELOPER SEED\n");
  
  const repos = await fetchTopAIRepos(500);
  console.log(`\n📊 Found ${repos.length} unique AI repo owners\n`);
  
  // Batch insert
  const devsToAdd = repos.map(repo => ({
    github_login: repo.owner.login,
    name: repo.owner.login,
    avatar_url: repo.owner.avatar_url,
    followers: repo.owner.followers,
    total_stars: repo.stargazers_count,
    public_repos: 1,
    primary_language: repo.language || "Python",
    district: "data_ai",
    claimed: false,
    contributions: 0,
    rank: 0,
    account_created_at: new Date().toISOString(),
  }));
  
  // Insert in batches of 100
  let added = 0;
  let updated = 0;
  
  for (let i = 0; i < devsToAdd.length; i += 100) {
    const batch = devsToAdd.slice(i, i + 100);
    
    // Check which already exist
    const logins = batch.map(d => d.github_login);
    const { data: existing } = await supabase
      .from("developers")
      .select("id, github_login")
      .in("github_login", logins);
    
    const existingLogins = new Set(existing?.map(d => d.github_login) || []);
    const toInsert = batch.filter(d => !existingLogins.has(d.github_login));
    const toUpdate = batch.filter(d => existingLogins.has(d.github_login));
    
    // Insert new
    if (toInsert.length > 0) {
      const { error } = await supabase
        .from("developers")
        .insert(toInsert);
      
      if (error) {
        console.error(`Batch ${i/100 + 1} insert error:`, error.message);
      } else {
        added += toInsert.length;
        console.log(`✅ Batch ${Math.floor(i/100) + 1}: Added ${toInsert.length}`);
      }
    }
    
    // Update existing
    for (const dev of toUpdate) {
      const { error } = await supabase
        .from("developers")
        .update({
          district: "data_ai",
          total_stars: dev.total_stars,
          primary_language: dev.primary_language,
        })
        .eq("github_login", dev.github_login);
      
      if (!error) updated++;
    }
    
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log(`\n✅ COMPLETE!`);
  console.log(`Added: ${added}`);
  console.log(`Updated: ${updated}`);
  
  // Get final count
  const { count } = await supabase
    .from("developers")
    .select("*", { count: "exact", head: true })
    .eq("district", "data_ai");
  
  console.log(`\n🤖 AI District total: ${count} developers`);
  
  // Show top 20
  const { data: top } = await supabase
    .from("developers")
    .select("github_login,total_stars")
    .eq("district", "data_ai")
    .order("total_stars", { ascending: false })
    .limit(20);
  
  console.log("\n🏆 Top 20 AI Devs:");
  top?.forEach((d, i) => console.log(`${(i+1)}. ${d.github_login}: ${d.total_stars.toLocaleString()} ⭐`));
}

main().catch(console.error);
