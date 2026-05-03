"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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
  const [githubLogin, setGithubLogin] = useState<string>("");

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
    
    setGithubLogin(login);
    
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
      <div style={{ fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,Arial", background: "#0f172a", color: "#fff", margin: 0, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#8c8c9c" }}>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,Arial", background: "#0f172a", color: "#fff", margin: 0, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#ef4444" }}>{error}</p>
          <button
            onClick={() => router.push("/admin/login")}
            style={{ marginTop: 16, padding: "8px 12px", border: "1px solid #374151", background: "#111827", color: "#fff", borderRadius: 8, cursor: "pointer" }}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,Arial", background: "#0f172a", color: "#fff", margin: 0 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", borderBottom: "1px solid #1f2937" }}>
        <div>Admin Dashboard</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <a
            href="/admin/panel"
            style={{ padding: "8px 12px", border: "1px solid #374151", background: "#111827", color: "#fff", textDecoration: "none", borderRadius: 8 }}
          >
            Panel
          </a>
          <button
            onClick={async () => {
              const supabase = createBrowserSupabase();
              await supabase.auth.signOut();
              router.push("/");
            }}
            style={{ padding: "8px 12px", border: "1px solid #374151", background: "#111827", color: "#fff", borderRadius: 8, cursor: "pointer" }}
          >
            Sign out
          </button>
        </div>
      </header>

      <main style={{ padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
          <div style={{ border: "1px solid #1f2937", borderRadius: 12, padding: 16, background: "#0b1220" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 14, opacity: 0.8 }}>Total users</h3>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{stats?.total_developers ?? 0}</div>
          </div>
          <div style={{ border: "1px solid #1f2937", borderRadius: 12, padding: 16, background: "#0b1220" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 14, opacity: 0.8 }}>Total visits</h3>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{stats?.total_visits ?? 0}</div>
          </div>
          <div style={{ border: "1px solid #1f2937", borderRadius: 12, padding: 16, background: "#0b1220" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 14, opacity: 0.8 }}>Total contributions</h3>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{(stats?.total_contributions ?? 0).toLocaleString()}</div>
          </div>
          <div style={{ border: "1px solid #1f2937", borderRadius: 12, padding: 16, background: "#0b1220" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 14, opacity: 0.8 }}>Total repos</h3>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{(stats?.total_repos ?? 0).toLocaleString()}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          <a href="/admin/users" style={{ padding: "8px 12px", border: "1px solid #374151", background: "#111827", color: "#fff", textDecoration: "none", borderRadius: 8, display: "inline-block" }}>Users</a>
          <a href="/admin/quests" style={{ padding: "8px 12px", border: "1px solid #374151", background: "#111827", color: "#fff", textDecoration: "none", borderRadius: 8, display: "inline-block" }}>Quests</a>
          <a href="/admin/venues" style={{ padding: "8px 12px", border: "1px solid #374151", background: "#111827", color: "#fff", textDecoration: "none", borderRadius: 8, display: "inline-block" }}>Venues</a>
          <a href="/admin/districts" style={{ padding: "8px 12px", border: "1px solid #374151", background: "#111827", color: "#fff", textDecoration: "none", borderRadius: 8, display: "inline-block" }}>Districts</a>
        </div>

        <section style={{ border: "1px solid #1f2937", borderRadius: 12, padding: 16, marginBottom: 16, background: "#0b1220" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600 }}>District Distribution</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
            {Object.entries(stats?.district_counts ?? {}).map(([district, count]) => (
              <div key={district} style={{ border: "1px solid #1f2937", borderRadius: 8, padding: 10, background: "#0b1220", textAlign: "center" }}>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>{district}</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{count}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ border: "1px solid #1f2937", borderRadius: 12, padding: 16, marginBottom: 16, background: "#0b1220" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600 }}>Top Visitors</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #1f2937" }}>
                <th style={{ padding: "8px 10px", opacity: 0.9, fontWeight: 600 }}>#</th>
                <th style={{ padding: "8px 10px", opacity: 0.9, fontWeight: 600 }}>User</th>
                <th style={{ padding: "8px 10px", opacity: 0.9, fontWeight: 600 }}>Visits</th>
                <th style={{ padding: "8px 10px", opacity: 0.9, fontWeight: 600 }}>XP</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.top_visitors ?? []).map((dev, idx) => (
                <tr key={dev.id} style={{ borderBottom: "1px solid #1f2937" }}>
                  <td style={{ padding: "8px 10px", opacity: 0.7 }}>{idx + 1}</td>
                  <td style={{ padding: "8px 10px" }}>
                    <div style={{ fontWeight: 600 }}>{dev.name ?? dev.github_login}</div>
                    <div style={{ fontSize: 12, opacity: 0.6 }}>@{dev.github_login}</div>
                  </td>
                  <td style={{ padding: "8px 10px", opacity: 0.8 }}>{dev.visit_count}</td>
                  <td style={{ padding: "8px 10px", opacity: 0.8 }}>{dev.xp_total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button
            onClick={fetchStats}
            style={{ padding: "8px 12px", border: "1px solid #374151", background: "#111827", color: "#fff", borderRadius: 8, cursor: "pointer" }}
          >
            Refresh Stats
          </button>
        </div>
      </main>
    </div>
  );
}
