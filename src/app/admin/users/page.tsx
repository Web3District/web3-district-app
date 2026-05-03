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
  claimed: boolean;
  claimed_by: string | null;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Developer[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Developer[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredUsers(users);
    } else {
      const q = search.toLowerCase();
      setFilteredUsers(
        users.filter(
          (u) =>
            u.github_login.toLowerCase().includes(q) ||
            u.id.toString().includes(q) ||
            (u.name ?? "").toLowerCase().includes(q)
        )
      );
    }
  }, [search, users]);

  async function checkAuth() {
    const supabase = createBrowserSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push("/admin/login?next=/admin/users");
      return;
    }

    const githubLogin = session.user.user_metadata?.user_name ?? 
                        session.user.user_metadata?.full_name ?? 
                        session.user.email?.split("@")[0] ?? "";
    
    const adminLogins = (process.env.NEXT_PUBLIC_ADMIN_GITHUB_LOGINS ?? "eddiezebra").split(",").map(s => s.trim().toLowerCase());
    
    if (!adminLogins.includes(githubLogin.toLowerCase())) {
      setError("Access denied: Admin access required");
      setLoading(false);
      return;
    }

    fetchUsers();
  }

  async function fetchUsers() {
    try {
      const supabase = createBrowserSupabase();
      
      const { data: devs, error: devsError } = await supabase
        .from("developers")
        .select("id, github_login, name, avatar_url, visit_count, contributions, public_repos, district, account_created_at, xp_total, current_streak, claimed, claimed_by")
        .order("xp_total", { ascending: false });

      if (devsError) throw devsError;

      setUsers(devs ?? []);
      setFilteredUsers(devs ?? []);
    } catch (err: any) {
      setError(err.message ?? "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }

  async function handleBan(userId: number, githubLogin: string) {
    if (!confirm(`Ban user ${githubLogin}? They will be unable to access the app.`)) return;

    try {
      const supabase = createBrowserSupabase();
      
      const { error } = await supabase
        .from("banned_users")
        .insert({ user_id: userId, reason: "Banned by admin", banned_at: new Date().toISOString() });

      if (error) throw error;

      setSuccess(`User ${githubLogin} has been banned`);
      setTimeout(() => setSuccess(null), 3000);
      fetchUsers();
    } catch (err: any) {
      setError(err.message ?? "Failed to ban user");
      setTimeout(() => setError(null), 3000);
    }
  }

  function escapeHtml(s: string) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d0f]">
        <p className="text-[#8c8c9c] font-pixel">Loading...</p>
      </div>
    );
  }

  if (error && !users.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d0f]">
        <div className="text-center">
          <p className="text-red-400 font-pixel">{error}</p>
          <button
            onClick={() => router.push("/admin/city")}
            className="mt-4 rounded-none border border-[#374151] bg-[#161618] px-4 py-2 font-pixel text-white hover:bg-[#1c1c20]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0f] font-pixel text-[#e8dcc8]">
      <header className="flex items-center gap-4 border-b border-[#2a2a30] px-6 py-4">
        <button
          onClick={() => router.push("/admin/city")}
          className="rounded-none border border-[#2a2a30] bg-[#161618] px-3 py-1.5 text-sm hover:bg-[#1c1c20]"
        >
          ← Back
        </button>
        <h1 className="text-lg">User Management</h1>
      </header>

      <main className="p-6">
        {success && (
          <div className="mb-4 rounded-none border border-green-600 bg-green-900/20 px-4 py-3 text-green-400">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-none border border-red-600 bg-red-900/20 px-4 py-3 text-red-400">
            {error}
          </div>
        )}

        <div className="mb-6 flex gap-3">
          <input
            type="text"
            placeholder="Search by id, username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2.5 font-pixel text-white placeholder-[#6b7280] focus:border-[#e040c0] focus:outline-none"
          />
          <button
            onClick={fetchUsers}
            className="rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2.5 font-pixel text-sm hover:bg-[#1c1c20]"
          >
            Reload
          </button>
        </div>

        <div className="overflow-x-auto rounded-none border-4 border-[#1a1a24] bg-[#101018]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#161618] text-[#8c8c9c]">
              <tr>
                <th className="px-4 py-3 font-pixel">ID</th>
                <th className="px-4 py-3 font-pixel">Username</th>
                <th className="px-4 py-3 font-pixel">XP</th>
                <th className="px-4 py-3 font-pixel">Visits</th>
                <th className="px-4 py-3 font-pixel">Contributions</th>
                <th className="px-4 py-3 font-pixel">District</th>
                <th className="px-4 py-3 font-pixel">Joined</th>
                <th className="px-4 py-3 font-pixel">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a30]">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#161618]/50">
                  <td className="px-4 py-3 text-[#8c8c9c]">{user.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold">{escapeHtml(user.github_login)}</div>
                    {user.name && <div className="text-xs text-[#8c8c9c]">{escapeHtml(user.name)}</div>}
                  </td>
                  <td className="px-4 py-3" style={{ color: ACCENT }}>{user.xp_total}</td>
                  <td className="px-4 py-3 text-[#8c8c9c]">{user.visit_count}</td>
                  <td className="px-4 py-3 text-[#8c8c9c]">{user.contributions.toLocaleString()}</td>
                  <td className="px-4 py-3 text-[#8c8c9c]">{user.district || "-"}</td>
                  <td className="px-4 py-3 text-[#8c8c9c]">
                    {new Date(user.account_created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleBan(user.id, user.github_login)}
                      className="rounded-none border border-red-600 bg-red-900/20 px-3 py-1 text-xs text-red-400 hover:bg-red-900/40"
                    >
                      Ban
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="mt-8 text-center text-[#8c8c9c]">
            No users found{search ? ` for "${search}"` : ""}
          </div>
        )}
      </main>
    </div>
  );
}
