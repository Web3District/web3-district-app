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

  function escapeHtml(s: string) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  if (loading) {
    return (
      <div style={{ fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,Arial", background: "#0f172a", color: "#fff", margin: 0, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#8c8c9c" }}>Loading...</p>
      </div>
    );
  }

  if (error && !users.length) {
    return (
      <div style={{ fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,Arial", background: "#0f172a", color: "#fff", margin: 0, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#ef4444" }}>{error}</p>
          <button
            onClick={() => router.push("/admin/city")}
            style={{ marginTop: 16, padding: "8px 12px", border: "1px solid #374151", background: "#111827", color: "#fff", borderRadius: 8, cursor: "pointer" }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,Arial", background: "#0f172a", color: "#fff", margin: 0 }}>
      <header style={{ display: "flex", gap: 8, alignItems: "center", padding: "12px", borderBottom: "1px solid #1f2937" }}>
        <button
          onClick={() => router.push("/admin/city")}
          style={{ padding: "6px 10px", border: "1px solid #374151", background: "#111827", color: "#fff", borderRadius: 8, cursor: "pointer" }}
        >
          ← Back
        </button>
        <button
          onClick={() => router.push("/admin/dashboard")}
          style={{ padding: "6px 10px", border: "1px solid #374151", background: "#111827", color: "#fff", borderRadius: 8, cursor: "pointer" }}
        >
          Dashboard
        </button>
        <div style={{ opacity: 0.8 }}>Users</div>
      </header>

      <main style={{ padding: 16 }}>
        {success && (
          <div style={{ marginBottom: 12, padding: "8px 12px", border: "1px solid #16a34a", background: "#16a34a20", borderRadius: 8, color: "#16a34a" }}>
            {success}
          </div>
        )}
        {error && (
          <div style={{ marginBottom: 12, padding: "8px 12px", border: "1px solid #ef4444", background: "#ef444420", borderRadius: 8, color: "#ef4444" }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <input
            id="search"
            placeholder="Search by id, email, wallet…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: 8, borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#fff", marginRight: 8, maxWidth: 320 }}
          />
          <button
            onClick={fetchUsers}
            style={{ padding: "6px 10px", border: "1px solid #374151", background: "#111827", color: "#fff", borderRadius: 8, cursor: "pointer" }}
          >
            Reload
          </button>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #1f2937" }}>
              <th style={{ padding: "8px 10px", opacity: 0.9, fontWeight: 600 }}>ID</th>
              <th style={{ padding: "8px 10px", opacity: 0.9, fontWeight: 600 }}>Username</th>
              <th style={{ padding: "8px 10px", opacity: 0.9, fontWeight: 600 }}>XP</th>
              <th style={{ padding: "8px 10px", opacity: 0.9, fontWeight: 600 }}>Visits</th>
              <th style={{ padding: "8px 10px", opacity: 0.9, fontWeight: 600 }}>Contributions</th>
              <th style={{ padding: "8px 10px", opacity: 0.9, fontWeight: 600 }}>District</th>
              <th style={{ padding: "8px 10px", opacity: 0.9, fontWeight: 600 }}>Last activity</th>
              <th style={{ padding: "8px 10px", opacity: 0.9, fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody id="usersBody">
            {filteredUsers.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid #1f2937" }}>
                <td style={{ padding: "8px 10px", opacity: 0.8 }}>{u.id}</td>
                <td style={{ padding: "8px 10px" }}>
                  <div style={{ fontWeight: 600 }}>{escapeHtml(u.github_login)}</div>
                  {u.name && <div style={{ fontSize: 12, opacity: 0.6 }}>{escapeHtml(u.name)}</div>}
                </td>
                <td style={{ padding: "8px 10px", opacity: 0.8 }}>{u.xp_total}</td>
                <td style={{ padding: "8px 10px", opacity: 0.8 }}>{u.visit_count}</td>
                <td style={{ padding: "8px 10px", opacity: 0.8 }}>{u.contributions.toLocaleString()}</td>
                <td style={{ padding: "8px 10px", opacity: 0.8 }}>{u.district || "-"}</td>
                <td style={{ padding: "8px 10px", opacity: 0.8 }}>
                  {u.account_created_at ? u.account_created_at.replace("T", " ").slice(0, 19) : "-"}
                </td>
                <td style={{ padding: "8px 10px" }}>
                  <button
                    onClick={() => handleBan(u.id, u.github_login)}
                    style={{ padding: "4px 8px", border: "1px solid #374151", background: "#111827", color: "#fff", borderRadius: 8, cursor: "pointer", fontSize: 12 }}
                  >
                    Ban
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div style={{ marginTop: 24, textAlign: "center", opacity: 0.7 }}>
            No users found{search ? ` for "${search}"` : ""}
          </div>
        )}
      </main>
    </div>
  );
}
