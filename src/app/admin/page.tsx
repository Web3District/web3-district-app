"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminPanelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [githubLogin, setGithubLogin] = useState<string>("");

  useEffect(() => {
    checkAuth();
  }, []);

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
            onClick={() => router.push("/")}
            style={{ marginTop: 16, padding: "8px 12px", border: "1px solid #374151", background: "#111827", color: "#fff", borderRadius: 8, cursor: "pointer" }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,Arial", background: "#0f172a", color: "#fff", margin: 0 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", borderBottom: "1px solid #1f2937" }}>
        <div>Admin Panel</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <a
            href="/admin/dashboard"
            style={{ padding: "8px 12px", border: "1px solid #374151", background: "#111827", color: "#fff", textDecoration: "none", borderRadius: 8 }}
          >
            Dashboard
          </a>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Session TTL / Idle enforced</div>
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
        <section style={{ border: "1px solid #1f2937", borderRadius: 12, padding: 16, marginBottom: 16, background: "#0b1220" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600 }}>Live Status</h3>
          <div id="status" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}></div>
        </section>

        <section style={{ border: "1px solid #1f2937", borderRadius: 12, padding: 16, marginBottom: 16, background: "#0b1220" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600 }}>Users Overview</h3>
          <p style={{ margin: "0 0 12px", opacity: 0.8, fontSize: 14 }}>Telegram ID, Wallet, Badges (stub view)</p>
          <a
            href="/admin/users"
            style={{ padding: "8px 12px", border: "1px solid #374151", background: "#111827", color: "#fff", textDecoration: "none", borderRadius: 8, display: "inline-block" }}
          >
            Open
          </a>
        </section>

        <section style={{ border: "1px solid #1f2937", borderRadius: 12, padding: 16, marginBottom: 16, background: "#0b1220" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600 }}>Quests</h3>
          <p style={{ margin: "0 0 12px", opacity: 0.8, fontSize: 14 }}>Create/edit Featured and per-user quests.</p>
          <a
            href="/admin/quests"
            style={{ padding: "8px 12px", border: "1px solid #374151", background: "#111827", color: "#fff", textDecoration: "none", borderRadius: 8, display: "inline-block" }}
          >
            Open
          </a>
        </section>

        <section style={{ border: "1px solid #1f2937", borderRadius: 12, padding: 16, marginBottom: 16, background: "#0b1220" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600 }}>Content Blocks</h3>
          <p style={{ margin: "0 0 12px", opacity: 0.8, fontSize: 14 }}>Edit texts, button links, and images used in the app.</p>
          <a
            href="/admin/content"
            style={{ padding: "8px 12px", border: "1px solid #374151", background: "#111827", color: "#fff", textDecoration: "none", borderRadius: 8, display: "inline-block" }}
          >
            Open
          </a>
        </section>

        <section style={{ border: "1px solid #1f2937", borderRadius: 12, padding: 16, marginBottom: 16, background: "#0b1220" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600 }}>Venues</h3>
          <p style={{ margin: "0 0 12px", opacity: 0.8, fontSize: 14 }}>Manage venue locations and check-in spots.</p>
          <a
            href="/admin/venues"
            style={{ padding: "8px 12px", border: "1px solid #374151", background: "#111827", color: "#fff", textDecoration: "none", borderRadius: 8, display: "inline-block" }}
          >
            Open
          </a>
        </section>

        <section style={{ border: "1px solid #1f2937", borderRadius: 12, padding: 16, marginBottom: 16, background: "#0b1220" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600 }}>Districts</h3>
          <p style={{ margin: "0 0 12px", opacity: 0.8, fontSize: 14 }}>View territory claims and district statistics.</p>
          <a
            href="/admin/districts"
            style={{ padding: "8px 12px", border: "1px solid #374151", background: "#111827", color: "#fff", textDecoration: "none", borderRadius: 8, display: "inline-block" }}
          >
            Open
          </a>
        </section>
      </main>

      <script dangerouslySetInnerHTML={{ __html: `
        const box = document.getElementById('status');
        function pill(ok) {
          return '<span style="display:inline-block;padding:2px 8px;border-radius:999px;background:' + (ok ? '#16a34a' : '#dc2626') + ';font-size:12px">' + (ok ? 'UP' : 'DOWN') + '</span>';
        }
        function renderStatus(list) {
          box.innerHTML = list.map(c => 
            '<div style="border:1px solid #1f2937;border-radius:8px;padding:10px;background:#0b1220">' +
              '<div style="font-weight:600">' + c.url.replace(location.origin, '') + '</div>' +
              '<div style="opacity:.8">HTTP ' + c.code + ' ' + pill(c.ok) + '</div>' +
            '</div>'
          ).join('');
        }
        async function tick() {
          try {
            const res = await fetch('/admin/status_api.php');
            const data = await res.json();
            renderStatus(data.checks || []);
          } catch(e) {
            renderStatus([{url:'/admin/status_api.php', code: 0, ok: false}]);
          }
        }
        tick();
        setInterval(tick, 5000);
      `}} />
    </div>
  );
}
