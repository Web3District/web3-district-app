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
}

interface CityStats {
  total_developers: number;
  total_visits: number;
  total_contributions: number;
  total_repos: number;
  district_counts: Record<string, number>;
  top_visitors: Developer[];
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

    const login = session.user.user_metadata?.user_name ?? 
                  session.user.user_metadata?.full_name ?? 
                  session.user.email?.split("@")[0] ?? "";
    
    const adminLogins = (process.env.NEXT_PUBLIC_ADMIN_GITHUB_LOGINS ?? "eddiezebra").split(",").map(s => s.trim().toLowerCase());
    
    if (!adminLogins.includes(login.toLowerCase())) {
      setError("Access denied: Admin access required");
      setLoading(false);
      return;
    }

    fetchStats();
  }

  async function fetchStats() {
    try {
      const supabase = createBrowserSupabase();
      
      const { data: devs, error: devsError } = await supabase
        .from("developers")
        .select("id, github_login, name, avatar_url, visit_count, contributions, public_repos, district, account_created_at, xp_total")
        .order("visit_count", { ascending: false });

      if (devsError) throw devsError;

      const districtCounts: Record<string, number> = {};
      devs?.forEach((d: Developer) => {
        const district = d.district ?? "unclaimed";
        districtCounts[district] = (districtCounts[district] ?? 0) + 1;
      });

      const totalStats: CityStats = {
        total_developers: devs?.length ?? 0,
        total_visits: devs?.reduce((sum: number, d: Developer) => sum + (d.visit_count ?? 0), 0) ?? 0,
        total_contributions: devs?.reduce((sum: number, d: Developer) => sum + (d.contributions ?? 0), 0) ?? 0,
        total_repos: devs?.reduce((sum: number, d: Developer) => sum + (d.public_repos ?? 0), 0) ?? 0,
        district_counts: districtCounts,
        top_visitors: (devs ?? []).slice(0, 10),
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
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d0f]">
        <p className="text-[#8c8c9c] font-pixel">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d0f]">
        <div className="text-center">
          <p className="text-red-400 font-pixel">{error}</p>
          <button
            onClick={() => router.push("/admin/login")}
            className="mt-4 rounded-none border border-[#374151] bg-[#161618] px-4 py-2 font-pixel text-white hover:bg-[#1c1c20]"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0f] font-pixel text-[#e8dcc8]">
      <header className="flex items-center justify-between border-b border-[#2a2a30] px-6 py-4">
        <div className="text-lg">Admin Dashboard</div>
        <div className="flex items-center gap-4">
          <a
            href="/admin/panel"
            className="rounded-none border border-[#2a2a30] bg-[#161618] px-3 py-1.5 text-sm hover:bg-[#1c1c20]"
          >
            Panel
          </a>
          <button
            onClick={async () => {
              const supabase = createBrowserSupabase();
              await supabase.auth.signOut();
              router.push("/");
            }}
            className="rounded-none border border-[#2a2a30] bg-[#161618] px-3 py-1.5 text-sm hover:bg-[#1c1c20]"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="p-6">
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total users" value={stats?.total_developers ?? 0} />
          <StatCard label="Total visits" value={stats?.total_visits ?? 0} />
          <StatCard label="Total contributions" value={(stats?.total_contributions ?? 0).toLocaleString()} />
          <StatCard label="Total repos" value={(stats?.total_repos ?? 0).toLocaleString()} />
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          <a href="/admin/users" className="rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 text-sm hover:bg-[#1c1c20]">Users</a>
          <a href="/admin/quests" className="rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 text-sm hover:bg-[#1c1c20]">Quests</a>
          <a href="/admin/venues" className="rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 text-sm hover:bg-[#1c1c20]">Venues</a>
          <a href="/admin/districts" className="rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 text-sm hover:bg-[#1c1c20]">Districts</a>
        </div>

        <section className="mb-8 rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6">
          <h3 className="mb-4 text-lg text-[#e040c0]">District Distribution</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {Object.entries(stats?.district_counts ?? {}).map(([district, count]) => (
              <div key={district} className="rounded-none border-2 border-[#2a2a38] bg-[#1a1a24] p-3 text-center">
                <div className="text-xs text-[#8c8c9c]">{district}</div>
                <div className="text-xl" style={{ color: ACCENT }}>{count}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6">
          <h3 className="mb-4 text-lg text-[#e040c0]">Top Visitors</h3>
          <table className="w-full text-left text-sm">
            <thead className="text-[#8c8c9c]">
              <tr className="border-b border-[#2a2a30]">
                <th className="pb-3">#</th>
                <th className="pb-3">User</th>
                <th className="pb-3">Visits</th>
                <th className="pb-3">XP</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.top_visitors ?? []).map((dev, idx) => (
                <tr key={dev.id} className="border-b border-[#2a2a30]">
                  <td className="py-3 text-[#8c8c9c]">{idx + 1}</td>
                  <td className="py-3">
                    <div className="font-bold">{dev.name ?? dev.github_login}</div>
                    <div className="text-xs text-[#8c8c9c]">@{dev.github_login}</div>
                  </td>
                  <td className="py-3 text-[#8c8c9c]">{dev.visit_count}</td>
                  <td className="py-3 text-[#8c8c9c]">{dev.xp_total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="text-center">
          <button
            onClick={fetchStats}
            className="rounded-none border border-[#2a2a30] bg-[#161618] px-6 py-3 text-sm hover:bg-[#1c1c20]"
          >
            Refresh Stats
          </button>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6">
      <div className="mb-2 text-xs text-[#8c8c9c]">{label}</div>
      <div className="text-3xl" style={{ color: "#e040c0" }}>{value}</div>
    </div>
  );
}
