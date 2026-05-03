"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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
      
      const { data: devs, error: devsError } = await supabase
        .from("developers")
        .select("id, github_login, name, district, home_district, xp_total, account_created_at")
        .order("xp_total", { ascending: false });

      if (devsError) throw devsError;

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
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d0f]">
        <p className="text-[#8c8c9c] font-pixel">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0f] font-pixel text-[#e8dcc8]">
      <header className="flex items-center gap-4 border-b border-[#2a2a30] px-6 py-4">
        <button
          onClick={() => router.push("/admin/panel")}
          className="rounded-none border border-[#2a2a30] bg-[#161618] px-3 py-1.5 text-sm hover:bg-[#1c1c20]"
        >
          ← Back
        </button>
        <h1 className="text-lg">Territories</h1>
      </header>

      <main className="p-6">
        <section className="rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6">
          <h3 className="mb-2 text-lg text-[#e040c0]">Territories</h3>
          <p className="mb-4 text-sm text-[#8c8c9c]">Users claim territories via the app.</p>
          
          {territories.length === 0 ? (
            <p className="text-[#8c8c9c]">No territories.</p>
          ) : (
            <div className="space-y-2">
              {territories.map((t) => (
                <div key={t.id} className="rounded-none border-2 border-[#2a2a38] bg-[#1a1a24] p-4">
                  <div className="font-bold">
                    #{t.id} owner_user_id: {t.owner_user_id} {t.owner_email ? ` (${escapeHtml(t.owner_email)})` : ""}
                  </div>
                  <div className="text-xs text-[#8c8c9c]">
                    {escapeHtml(t.summary || "")} · {t.created_at ? t.created_at.slice(0, 19) : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
