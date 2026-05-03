"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Developer {
  id: number;
  github_login: string;
  name: string | null;
  avatar_url: string | null;
  district: string | null;
  home_district: string | null;
  claimed: boolean;
  claimed_by: string | null;
  xp_total: number;
}

interface Territory {
  id: number;
  owner_user_id: number;
  owner_email?: string;
  summary?: string;
  created_at?: string;
}

export default function AdminDistrictsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const supabase = createBrowserSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push("/admin/login?next=/admin/districts");
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

    fetchTerritories();
  }

  async function fetchTerritories() {
    try {
      const supabase = createBrowserSupabase();
      
      // Get all developers with districts (territories)
      const { data: devs, error: devsError } = await supabase
        .from("developers")
        .select("id, github_login, name, district, home_district, claimed, claimed_by, xp_total, account_created_at")
        .order("xp_total", { ascending: false });

      if (devsError) throw devsError;

      // Convert to territory format
      const territoryList: Territory[] = (devs ?? [])
        .filter(d => d.district || d.home_district)
        .map((d, idx) => ({
          id: idx + 1,
          owner_user_id: d.id,
          owner_email: d.github_login,
          summary: d.district ? `District: ${d.district}` : d.home_district ? `Home: ${d.home_district}` : undefined,
          created_at: d.account_created_at,
        }));

      setTerritories(territoryList);
    } catch (err: any) {
      setError(err.message ?? "Failed to fetch territories");
    } finally {
      setLoading(false);
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

  if (error && !territories.length) {
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
          onClick={() => router.push("/admin/panel")}
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
        <div style={{ opacity: 0.8 }}>Territories</div>
      </header>

      <main style={{ padding: 16 }}>
        <section style={{ border: "1px solid #1f2937", borderRadius: 12, padding: 16, marginBottom: 16, background: "#0b1220" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600 }}>Territories (claimed by users via app)</h3>
          <p style={{ margin: "0 0 12px", opacity: 0.8, fontSize: 14 }}>No create from admin; users claim via the app.</p>
          <div id="territories">
            {territories.length === 0 ? (
              <p style={{ opacity: 0.7 }}>No territories.</p>
            ) : (
              territories.map((t) => (
                <div key={t.id} style={{ border: "1px solid #1f2937", borderRadius: 8, padding: 10, marginBottom: 8, fontSize: 14 }}>
                  <div>
                    <strong>#{t.id}</strong> owner_user_id: {t.owner_user_id} {t.owner_email ? ` (${escapeHtml(t.owner_email)})` : ""}
                  </div>
                  <div style={{ opacity: 0.8, fontSize: 12 }}>
                    {escapeHtml(t.summary || "")} · {t.created_at || ""}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
