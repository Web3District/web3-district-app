"use client";

import { useEffect, useState, useMemo } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const ACCENT = "#ed0584";

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
  claimed: boolean;
  claimed_by: string | null;
}

export default function UsersAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [githubLogin, setGithubLogin] = useState<string>("");
  const [users, setUsers] = useState<Developer[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"xp" | "visits" | "contributions" | "streak">("xp");
  const [filterDistrict, setFilterDistrict] = useState<string>("all");

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (githubLogin) {
      fetchUsers();
    }
  }, [githubLogin]);

  async function checkAuth() {
    const supabase = createBrowserSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push("/admin/login");
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

    setLoading(false);
  }

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleBan(userId: number, login: string) {
    if (!confirm(`Ban user @${login}?`)) return;
    
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ban", user_id: userId, reason: "Banned by admin" }),
      });
      
      if (!res.ok) throw new Error("Failed to ban user");
      
      alert(`User @${login} banned!`);
      fetchUsers(); // Refresh list
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  }

  async function handleUnban(userId: number, login: string) {
    if (!confirm(`Unban user @${login}?`)) return;
    
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unban", user_id: userId }),
      });
      
      if (!res.ok) throw new Error("Failed to unban user");
      
      alert(`User @${login} unbanned!`);
      fetchUsers(); // Refresh list
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  }

  const filteredAndSorted = useMemo(() => {
    let result = [...users];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.github_login.toLowerCase().includes(q) ||
          (u.name && u.name.toLowerCase().includes(q))
      );
    }

    // District filter
    if (filterDistrict !== "all") {
      result = result.filter((u) => u.district === filterDistrict);
    }

    // Sort
    switch (sortBy) {
      case "xp":
        result.sort((a, b) => b.xp_total - a.xp_total);
        break;
      case "visits":
        result.sort((a, b) => b.visit_count - a.visit_count);
        break;
      case "contributions":
        result.sort((a, b) => b.contributions - a.contributions);
        break;
      case "streak":
        result.sort((a, b) => b.current_streak - a.current_streak);
        break;
    }

    return result;
  }, [users, search, sortBy, filterDistrict]);

  const districts = useMemo(() => {
    const set = new Set(users.map((u) => u.district).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [users]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      claimed: users.filter((u) => u.claimed).length,
      avgXp: Math.round(users.reduce((sum, u) => sum + u.xp_total, 0) / (users.length || 1)),
      avgVisits: Math.round(users.reduce((sum, u) => sum + u.visit_count, 0) / (users.length || 1)),
    };
  }, [users]);

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
            onClick={() => router.push("/")}
            className="mt-4 rounded-none border border-[#374151] bg-[#161618] px-4 py-2 font-pixel text-white hover:bg-[#1c1c20]"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0f] font-pixel text-[#e8dcc8]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#2a2a30] px-6 py-4">
        <div>
          <div className="text-lg text-[#ed0584]">👥 Users & Analytics</div>
          <div className="text-xs text-[#8c8c9c] mt-1">Logged in as @{githubLogin}</div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/admin")}
            className="rounded-none border border-[#2a2a30] bg-[#161618] px-3 py-1.5 text-sm hover:bg-[#1c1c20] hover:border-[#ed0584] transition-colors"
          >
            ← Dashboard
          </button>
          <button
            onClick={async () => {
              const supabase = createBrowserSupabase();
              await supabase.auth.signOut();
              router.push("/");
            }}
            className="rounded-none border border-[#2a2a30] bg-[#161618] px-3 py-1.5 text-sm hover:bg-[#1c1c20] hover:border-[#ed0584] transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 max-w-7xl mx-auto mb-8">
          <div className="rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl text-[#ed0584]">{stats.total}</div>
            <div className="text-xs text-[#8c8c9c]">Total Users</div>
          </div>
          <div className="rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6">
            <div className="text-3xl mb-2">🏠</div>
            <div className="text-2xl text-[#ed0584]">{stats.claimed}</div>
            <div className="text-xs text-[#8c8c9c]">Claimed Buildings</div>
          </div>
          <div className="rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-2xl text-[#ed0584]">{stats.avgXp}</div>
            <div className="text-xs text-[#8c8c9c]">Avg XP</div>
          </div>
          <div className="rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6">
            <div className="text-3xl mb-2">👁️</div>
            <div className="text-2xl text-[#ed0584]">{stats.avgVisits}</div>
            <div className="text-xs text-[#8c8c9c]">Avg Visits</div>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="🔍 Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] rounded-none border-2 border-[#2a2a30] bg-[#101018] px-4 py-2 text-sm focus:border-[#ed0584] focus:outline-none"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-none border-2 border-[#2a2a30] bg-[#101018] px-4 py-2 text-sm focus:border-[#ed0584] focus:outline-none"
            >
              <option value="xp">Sort by XP</option>
              <option value="visits">Sort by Visits</option>
              <option value="contributions">Sort by Contributions</option>
              <option value="streak">Sort by Streak</option>
            </select>
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="rounded-none border-2 border-[#2a2a30] bg-[#101018] px-4 py-2 text-sm focus:border-[#ed0584] focus:outline-none"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d === "all" ? "All Districts" : d}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-2 text-xs text-[#8c8c9c]">
            Showing {filteredAndSorted.length} of {users.length} users
          </div>
        </div>

        {/* Users Table */}
        <div className="max-w-7xl mx-auto">
          <div className="overflow-x-auto rounded-none border-4 border-[#1a1a24] bg-[#101018]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a30]">
                  <th className="text-left px-4 py-3 text-xs text-[#8c8c9c]">User</th>
                  <th className="text-left px-4 py-3 text-xs text-[#8c8c9c]">District</th>
                  <th className="text-right px-4 py-3 text-xs text-[#8c8c9c]">XP</th>
                  <th className="text-right px-4 py-3 text-xs text-[#8c8c9c]">Visits</th>
                  <th className="text-right px-4 py-3 text-xs text-[#8c8c9c]">Contribs</th>
                  <th className="text-right px-4 py-3 text-xs text-[#8c8c9c]">Streak</th>
                  <th className="text-center px-4 py-3 text-xs text-[#8c8c9c]">Claimed</th>
                  <th className="text-center px-4 py-3 text-xs text-[#8c8c9c]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.map((user) => (
                  <tr key={user.id} className="border-b border-[#1a1a24] hover:bg-[#16161e] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.avatar_url && (
                          <img
                            src={user.avatar_url}
                            alt={user.github_login}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div>
                          <div className="text-sm text-[#ed0584]">@{user.github_login}</div>
                          {user.name && (
                            <div className="text-xs text-[#8c8c9c]">{user.name}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#8c8c9c]">{user.district || "-"}</td>
                    <td className="px-4 py-3 text-right text-sm text-[#ed0584]">{user.xp_total.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-sm">{user.visit_count.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-sm">{user.contributions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-sm">
                      <span className={user.current_streak >= 7 ? "text-[#ed0584]" : "text-[#8c8c9c]"}>
                        🔥 {user.current_streak}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.claimed ? (
                        <span className="text-xs text-[#5a8a00]">✅ Yes</span>
                      ) : (
                        <span className="text-xs text-[#8c8c9c]">❌ No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleBan(user.id, user.github_login)}
                        className="text-xs rounded-none border border-red-900 bg-red-950 px-2 py-1 hover:bg-red-900 transition-colors"
                        title="Ban user"
                      >
                        🚫 Ban
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
