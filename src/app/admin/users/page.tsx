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
      
      // Add to banned table (you'll need to create this table)
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

  async function handleUnban(userId: number, githubLogin: string) {
    if (!confirm(`Unban user ${githubLogin}?`)) return;

    try {
      const supabase = createBrowserSupabase();
      
      const { error } = await supabase
        .from("banned_users")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      setSuccess(`User ${githubLogin} has been unbanned`);
      setTimeout(() => setSuccess(null), 3000);
      fetchUsers();
    } catch (err: any) {
      setError(err.message ?? "Failed to unban user");
      setTimeout(() => setError(null), 3000);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a12]">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: ACCENT }} />
          <p className="text-[#8c8c9c]">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error && !users.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a12]">
        <div className="text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => router.push("/admin/city")}
            className="mt-4 rounded-lg px-4 py-2"
            style={{ backgroundColor: ACCENT }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#1f2937] px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/city")}
            className="rounded-lg border border-[#374151] bg-[#111827] px-3 py-1.5 text-sm hover:bg-[#1f2937]"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold">User Management</h1>
        </div>
        <div className="text-sm text-[#8c8c9c]">
          {filteredUsers.length} / {users.length} users
        </div>
      </header>

      {/* Alerts */}
      {success && (
        <div className="mx-6 mt-4 rounded-lg border border-green-600/30 bg-green-900/20 px-4 py-3 text-green-400">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="mx-6 mt-4 rounded-lg border border-red-600/30 bg-red-900/20 px-4 py-3 text-red-400">
          ❌ {error}
        </div>
      )}

      {/* Search */}
      <main className="p-6">
        <div className="mb-6 flex gap-3">
          <input
            type="text"
            placeholder="Search by username, ID, or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md rounded-lg border border-[#374151] bg-[#111827] px-4 py-2.5 text-white placeholder-[#6b7280] focus:border-[#e040c0] focus:outline-none"
          />
          <button
            onClick={fetchUsers}
            className="rounded-lg border border-[#374151] bg-[#111827] px-4 py-2.5 hover:bg-[#1f2937]"
          >
            Reload
          </button>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-lg border border-[#1f2937]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#111827] text-[#8c8c9c]">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">XP</th>
                <th className="px-4 py-3 font-medium">Visits</th>
                <th className="px-4 py-3 font-medium">Contributions</th>
                <th className="px-4 py-3 font-medium">District</th>
                <th className="px-4 py-3 font-medium">Claimed</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#111827]/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.avatar_url && (
                        <img
                          src={user.avatar_url}
                          alt={user.github_login}
                          className="h-8 w-8 rounded-full"
                        />
                      )}
                      <div>
                        <div className="font-medium">{user.github_login}</div>
                        {user.name && (
                          <div className="text-xs text-[#8c8c9c]">{user.name}</div>
                        )}
                        <div className="text-xs text-[#6b7280]">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-purple-900/30 px-2 py-0.5 text-purple-400">
                      {user.xp_total}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#8c8c9c]">{user.visit_count}</td>
                  <td className="px-4 py-3 text-[#8c8c9c]">
                    {user.contributions.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {user.district ? (
                      <span className="rounded bg-blue-900/30 px-2 py-0.5 text-blue-400 capitalize">
                        {user.district}
                      </span>
                    ) : (
                      <span className="text-[#6b7280]">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {user.claimed ? (
                      <span className="text-green-400">✅ Yes</span>
                    ) : (
                      <span className="text-[#6b7280]">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#8c8c9c]">
                    {new Date(user.account_created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleBan(user.id, user.github_login)}
                      className="rounded border border-red-600/30 bg-red-900/20 px-3 py-1 text-xs text-red-400 hover:bg-red-900/40"
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
