import { generateCityLayout, type CityBuilding, type DeveloperRecord } from "@/lib/github";
import seedAiRepos from "@/data/seed-ai-repos.json";

/**
 * Converts seed repo data into DeveloperRecord format expected by generateCityLayout.
 * AI District buildings use theme window palette directly for maximum brightness.
 */
export function getSeedDevelopers(): DeveloperRecord[] {
  return seedAiRepos.map((repo: any, index: number) => ({
    id: index + 1,
    github_login: repo.login,
    github_id: index + 100000,
    name: repo.name,
    avatar_url: repo.avatar_url || null,
    bio: repo.description || null,
    contributions: Math.floor(repo.stars * 10),
    public_repos: Math.floor(Math.random() * 50) + 5,
    total_stars: repo.stars,
    primary_language: repo.language || null,
    top_repos: [{
      name: repo.name,
      stars: repo.stars,
      language: repo.language,
      url: `https://github.com/${repo.login}/${repo.name}`,
    }],
    rank: repo.rank,
    fetched_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    claimed: false,
    fetch_priority: 0,
    claimed_at: null,
    district: "data_ai", // All seed repos go to AI district
    // No custom_color — uses theme window palette directly for bright emissive windows
    custom_color: null,
    owned_items: [],
    achievements: [],
    kudos_count: 0,
    visit_count: 0,
    loadout: null,
    app_streak: 0,
    raid_xp: 0,
    xp_total: repo.stars * 10,
    xp_level: Math.min(25, Math.floor(repo.stars / 500) + 1),
    rabbit_completed: false,
    active_raid_tag: null,
  }));
}

/**
 * Generates city layout from seed data only (no Supabase needed).
 */
export function generateSeedCity() {
  const devs = getSeedDevelopers();
  return generateCityLayout(devs);
}
