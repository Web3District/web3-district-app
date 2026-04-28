"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const ACCENT = "#e040c0";

interface Developer {
  id: number;
  github_login: string;
  name: string | null;
  avatar_url: string | null;
  visit_count: number;
  contributions: number;
  public_repos: number;
  district: string | null;
  account_created_at: string;
  xp_total: number;
  current_streak: number;
}

interface CityStats {
  total_developers: number;
  total_visits: number;
  total_contributions: number;
  total_repos: number;
  new_users_today: number;
  new_users_week: number;
  district_counts: Record<string, number>;
  top_visitors: Developer[];
  recent_logins: Developer[];
  seed_repos: number;
}

export default function AdminCityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CityStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const supabase = createBrowserSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push("/admin/login?next=/admin/city");
      return;
    }

    // Check if admin - try multiple sources for GitHub login
    const githubLogin = session.user.user_metadata?.user_name ?? 
                        session.user.user_metadata?.full_name ?? 
                        session.user.email?.split("@")[0] ?? "";
    
    const adminLogins = (process.env.NEXT_PUBLIC_ADMIN_GITHUB_LOGINS ?? "eddiezebra").split(",").map(s => s.trim().toLowerCase());
    
    // First check session metadata
    if (adminLogins.includes(githubLogin.toLowerCase())) {
      // Admin found in session
    } else {
      // Fallback: check Supabase developer record
      const { data: dev } = await supabase
        .from("developers")
        .select("github_login")
        .eq("id", session.user.id)
        .single();
      
      if (!dev || !adminLogins.includes(dev.github_login.toLowerCase())) {
        setError("Access denied: Admin access required");
        setLoading(false);
        return;
      }
    }

    fetchStats();
  }

  async function fetchStats() {
    try {
      const supabase = createBrowserSupabase();
      
      // Get all developers
      const { data: devs, error: devsError } = await supabase
        .from("developers")
        .select("id, github_login, name, avatar_url, visit_count, contributions, public_repos, district, account_created_at, xp_total, current_streak")
        .order("visit_count", { ascending: false });

      if (devsError) throw devsError;

      // Get city stats
      const { data: cityStats } = await supabase.from("city_stats").select("*").eq("id", 1).single();

      // Calculate stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const newUsersToday = devs?.filter((d: Developer) => {
        const created = new Date(d.account_created_at);
        return created >= today;
      }).length ?? 0;

      const newUsersWeek = devs?.filter((d: Developer) => {
        const created = new Date(d.account_created_at);
        return created >= weekAgo;
      }).length ?? 0;

      const districtCounts: Record<string, number> = {};
      devs?.forEach((d: Developer) => {
        const district = d.district ?? "unclaimed";
        districtCounts[district] = (districtCounts[district] ?? 0) + 1;
      });

      // Count seed repos (developers with public_repos > 0)
      const seedRepos = devs?.filter((d: Developer) => d.public_repos > 0).length ?? 0;

      const totalStats: CityStats = {
        total_developers: devs?.length ?? 0,
        total_visits: devs?.reduce((sum: number, d: Developer) => sum + (d.visit_count ?? 0), 0) ?? 0,
        total_contributions: devs?.reduce((sum: number, d: Developer) => sum + (d.contributions ?? 0), 0) ?? 0,
        total_repos: devs?.reduce((sum: number, d: Developer) => sum + (d.public_repos ?? 0), 0) ?? 0,
        new_users_today: newUsersToday,
        new_users_week: newUsersWeek,
        district_counts: districtCounts,
        top_visitors: (devs ?? []).slice(0, 10),
        recent_logins: (devs ?? [])
          .sort((a: Developer, b: Developer) => new Date(b.account_created_at).getTime() - new Date(a.account_created_at).getTime())
          .slice(0, 10),
        seed_repos: seedRepos,
      };

      setStats(totalStats);
    } catch (err: any) {
      setError(err.message ?? "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a12]">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: ACCENT }} />
          <p className="text-[#8c8c9c]">Loading city stats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a12]">
        <div className="rounded-lg border-4 border-red-500 bg-[#1a0a0a] p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-red-500">Access Denied</h2>
          <p className="text-[#8c8c9c]">{error}</p>
          <button onClick={() => router.push("/admin/login")} className="mt-4 rounded bg-[#333] px-4 py-2 text-white hover:bg-[#444]">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a12] font-pixel uppercase text-[#e8e8f0]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: ACCENT }}>🏙️ City Analytics</h1>
            <p className="text-[#8c8c9c]">Real-time stats for Web4City</p>
          </div>
          <button onClick={() => router.push("/")} className="text-[10px] text-[#8c8c9c] hover:text-[#e8e8f0]">
            ← Back to City
          </button>
        </div>

        {/* Overview Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Total Users"
            value={stats?.total_developers ?? 0}
            icon="👥"
            accent={ACCENT}
          />
          <StatCard
            label="Total Visits"
            value={stats?.total_visits ?? 0}
            icon="👁️"
            accent={ACCENT}
          />
          <StatCard
            label="New Users (Week)"
            value={stats?.new_users_week ?? 0}
            icon="🆕"
            accent={ACCENT}
          />
          <StatCard
            label="Seed Repos"
            value={stats?.seed_repos ?? 0}
            icon="🌱"
            accent={ACCENT}
          />
        </div>

        {/* Secondary Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          <StatCard
            label="Total Contributions"
            value={stats?.total_contributions?.toLocaleString() ?? 0}
            icon="💻"
            accent={ACCENT}
            small
          />
          <StatCard
            label="Total Public Repos"
            value={stats?.total_repos?.toLocaleString() ?? 0}
            icon="📦"
            accent={ACCENT}
            small
          />
          <StatCard
            label="New Users (Today)"
            value={stats?.new_users_today ?? 0}
            icon="📅"
            accent={ACCENT}
            small
          />
        </div>

        {/* District Distribution */}
        <div className="mb-8 rounded-lg border-4 border-[#1a1a24] bg-[#101018] p-6">
          <h2 className="mb-4 text-xl font-bold" style={{ color: ACCENT }}>🗺️ District Distribution</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {Object.entries(stats?.district_counts ?? {}).map(([district, count]) => (
              <div key={district} className="rounded border-2 border-[#2a2a38] bg-[#1a1a24] p-3 text-center">
                <div className="text-[10px] text-[#8c8c9c]">{district}</div>
                <div className="text-xl font-bold" style={{ color: ACCENT }}>{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Visitors */}
        <div className="mb-8 rounded-lg border-4 border-[#1a1a24] bg-[#101018] p-6">
          <h2 className="mb-4 text-xl font-bold" style={{ color: ACCENT }}>🏆 Top 10 Visitors</h2>
          <div className="space-y-2">
            {stats?.top_visitors.map((dev, idx) => (
              <div key={dev.id} className="flex items-center gap-3 rounded border-2 border-[#2a2a38] bg-[#1a1a24] p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded font-bold" style={{ backgroundColor: ACCENT }}>
                  {idx + 1}
                </div>
                <img src={dev.avatar_url ?? "/default-avatar.png"} alt={dev.github_login} className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <div className="text-sm font-bold">{dev.name ?? dev.github_login}</div>
                  <div className="text-[10px] text-[#8c8c9c]">@{dev.github_login}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold" style={{ color: ACCENT }}>{dev.visit_count} visits</div>
                  <div className="text-[10px] text-[#8c8c9c]">{dev.xp_total} XP</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Logins */}
        <div className="rounded-lg border-4 border-[#1a1a24] bg-[#101018] p-6">
          <h2 className="mb-4 text-xl font-bold" style={{ color: ACCENT }}>🆕 Recent Logins</h2>
          <div className="space-y-2">
            {stats?.recent_logins.map((dev) => (
              <div key={dev.id} className="flex items-center gap-3 rounded border-2 border-[#2a2a38] bg-[#1a1a24] p-3">
                <img src={dev.avatar_url ?? "/default-avatar.png"} alt={dev.github_login} className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <div className="text-sm font-bold">{dev.name ?? dev.github_login}</div>
                  <div className="text-[10px] text-[#8c8c9c]">@{dev.github_login}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[#8c8c9c]">Joined</div>
                  <div className="text-xs">{new Date(dev.account_created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button onClick={fetchStats} className="rounded bg-[#333] px-6 py-3 text-sm font-bold hover:bg-[#444]">
            🔄 Refresh Stats
          </button>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value, icon, accent, small = false }: { label: string; value: string | number; icon: string; accent: string; small?: boolean }) {
  return (
    <div className={`rounded-lg border-4 border-[#1a1a24] bg-[#101018] ${small ? "p-3" : "p-6"}`}>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <div className="text-[10px] text-[#8c8c9c]">{label}</div>
      </div>
      <div className="text-3xl font-bold" style={{ color: accent }}>{value}</div>
    </div>
  );
}
