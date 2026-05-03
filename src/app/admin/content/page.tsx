"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Content {
  id?: number;
  web4city_title: string;
  web4city_subtitle: string;
  wallet_button_text: string;
  wallet_button_link: string;
  featured_image_passport: string;
  featured_image_quest: string;
  explore_title: string;
  explore_subtitle: string;
  featured_image_explore: string;
  lobby_title: string;
  lobby_subtitle: string;
  featured_image_lobby: string;
  updated_at?: string;
}

const defaultContent: Content = {
  web4city_title: "Web4City",
  web4city_subtitle: "Your GitHub as a 3D City",
  wallet_button_text: "Connect Wallet",
  wallet_button_link: "",
  featured_image_passport: "",
  featured_image_quest: "",
  explore_title: "Explore City",
  explore_subtitle: "Browse Buildings",
  featured_image_explore: "",
  lobby_title: "Lobby",
  lobby_subtitle: "Meet other devs",
  featured_image_lobby: "",
};

export default function AdminContentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<Content>(defaultContent);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const supabase = createBrowserSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push("/admin/login?next=/admin/content");
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

    fetchContent();
  }

  async function fetchContent() {
    try {
      const supabase = createBrowserSupabase();
      
      const { data, error: contentError } = await supabase
        .from("app_content")
        .select("*")
        .eq("id", 1)
        .single();

      if (contentError && contentError.code !== "PGRST116") throw contentError;

      if (data) {
        setContent({ ...defaultContent, ...data });
      }
    } catch (err: any) {
      setError(err.message ?? "Failed to fetch content");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    try {
      const supabase = createBrowserSupabase();
      
      const payload = {
        web4city_title: content.web4city_title,
        web4city_subtitle: content.web4city_subtitle,
        wallet_button_text: content.wallet_button_text,
        wallet_button_link: content.wallet_button_link,
        featured_image_passport: content.featured_image_passport,
        featured_image_quest: content.featured_image_quest,
        explore_title: content.explore_title,
        explore_subtitle: content.explore_subtitle,
        featured_image_explore: content.featured_image_explore,
        lobby_title: content.lobby_title,
        lobby_subtitle: content.lobby_subtitle,
        featured_image_lobby: content.featured_image_lobby,
        updated_at: new Date().toISOString(),
      };

      const { data: existing } = await supabase
        .from("app_content")
        .select("id")
        .eq("id", 1)
        .single();

      let error;
      if (existing) {
        const result = await supabase
          .from("app_content")
          .update(payload)
          .eq("id", 1);
        error = result.error;
      } else {
        const result = await supabase
          .from("app_content")
          .insert({ ...payload, id: 1 });
        error = result.error;
      }

      if (error) throw error;

      setSuccess("Content saved successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message ?? "Failed to save content");
      setTimeout(() => setError(null), 3000);
    }
  }

  function handleInputChange(field: keyof Content, value: string) {
    setContent({ ...content, [field]: value });
  }

  if (loading) {
    return (
      <div style={{ fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,Arial", background: "#0f172a", color: "#fff", margin: 0, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#8c8c9c" }}>Loading...</p>
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
        <div style={{ opacity: 0.8 }}>Content</div>
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

        <section style={{ border: "1px solid #1f2937", borderRadius: 12, padding: 16, marginBottom: 16, background: "#0b1220" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600 }}>App Copy & Links</h3>
          <form id="contentForm" onSubmit={handleSave}>
            <label style={{ display: "block", marginTop: 8, opacity: 0.9 }}>Web4City Title</label>
            <input
              name="web4city_title"
              value={content.web4city_title}
              onChange={(e) => handleInputChange("web4city_title", e.target.value)}
              placeholder="Web4City"
              style={{ width: "100%", padding: 8, margin: "6px 0", borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#fff" }}
            />

            <label style={{ display: "block", marginTop: 8, opacity: 0.9 }}>Web4City Subtitle</label>
            <input
              name="web4city_subtitle"
              value={content.web4city_subtitle}
              onChange={(e) => handleInputChange("web4city_subtitle", e.target.value)}
              placeholder="Your GitHub as a 3D City"
              style={{ width: "100%", padding: 8, margin: "6px 0", borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#fff" }}
            />

            <label style={{ display: "block", marginTop: 8, opacity: 0.9 }}>Wallet Button Text</label>
            <input
              name="wallet_button_text"
              value={content.wallet_button_text}
              onChange={(e) => handleInputChange("wallet_button_text", e.target.value)}
              placeholder="Connect Wallet"
              style={{ width: "100%", padding: 8, margin: "6px 0", borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#fff" }}
            />

            <label style={{ display: "block", marginTop: 8, opacity: 0.9 }}>Wallet Button Link (optional)</label>
            <input
              name="wallet_button_link"
              value={content.wallet_button_link}
              onChange={(e) => handleInputChange("wallet_button_link", e.target.value)}
              placeholder="https://..."
              style={{ width: "100%", padding: 8, margin: "6px 0", borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#fff" }}
            />

            <label style={{ display: "block", marginTop: 8, opacity: 0.9 }}>Featured Image (Passport)</label>
            <input
              name="featured_image_passport"
              value={content.featured_image_passport}
              onChange={(e) => handleInputChange("featured_image_passport", e.target.value)}
              placeholder="ProBlox_NEW.png"
              style={{ width: "100%", padding: 8, margin: "6px 0", borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#fff" }}
            />

            <label style={{ display: "block", marginTop: 8, opacity: 0.9 }}>Featured Image (Quest)</label>
            <input
              name="featured_image_quest"
              value={content.featured_image_quest}
              onChange={(e) => handleInputChange("featured_image_quest", e.target.value)}
              placeholder="QuestBlox_NEW.png"
              style={{ width: "100%", padding: 8, margin: "6px 0", borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#fff" }}
            />

            <hr style={{ margin: "12px 0", border: 0, borderTop: "1px solid #1f2937" }} />

            <h4 style={{ margin: "12px 0 8px", fontSize: 14 }}>Explore</h4>
            <label style={{ display: "block", marginTop: 8, opacity: 0.9 }}>Explore Title</label>
            <input
              name="explore_title"
              value={content.explore_title}
              onChange={(e) => handleInputChange("explore_title", e.target.value)}
              placeholder="Explore City"
              style={{ width: "100%", padding: 8, margin: "6px 0", borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#fff" }}
            />

            <label style={{ display: "block", marginTop: 8, opacity: 0.9 }}>Explore Subtitle</label>
            <input
              name="explore_subtitle"
              value={content.explore_subtitle}
              onChange={(e) => handleInputChange("explore_subtitle", e.target.value)}
              placeholder="Browse Buildings"
              style={{ width: "100%", padding: 8, margin: "6px 0", borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#fff" }}
            />

            <label style={{ display: "block", marginTop: 8, opacity: 0.9 }}>Featured Image (Explore)</label>
            <input
              name="featured_image_explore"
              value={content.featured_image_explore}
              onChange={(e) => handleInputChange("featured_image_explore", e.target.value)}
              placeholder="Explore_NEW.png"
              style={{ width: "100%", padding: 8, margin: "6px 0", borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#fff" }}
            />

            <hr style={{ margin: "12px 0", border: 0, borderTop: "1px solid #1f2937" }} />

            <h4 style={{ margin: "12px 0 8px", fontSize: 14 }}>Lobby</h4>
            <label style={{ display: "block", marginTop: 8, opacity: 0.9 }}>Lobby Title</label>
            <input
              name="lobby_title"
              value={content.lobby_title}
              onChange={(e) => handleInputChange("lobby_title", e.target.value)}
              placeholder="Lobby"
              style={{ width: "100%", padding: 8, margin: "6px 0", borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#fff" }}
            />

            <label style={{ display: "block", marginTop: 8, opacity: 0.9 }}>Lobby Subtitle</label>
            <input
              name="lobby_subtitle"
              value={content.lobby_subtitle}
              onChange={(e) => handleInputChange("lobby_subtitle", e.target.value)}
              placeholder="Meet other devs"
              style={{ width: "100%", padding: 8, margin: "6px 0", borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#fff" }}
            />

            <label style={{ display: "block", marginTop: 8, opacity: 0.9 }}>Featured Image (Lobby)</label>
            <input
              name="featured_image_lobby"
              value={content.featured_image_lobby}
              onChange={(e) => handleInputChange("featured_image_lobby", e.target.value)}
              placeholder="Lobby_NEW.png"
              style={{ width: "100%", padding: 8, margin: "6px 0", borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#fff" }}
            />

            <div style={{ marginTop: 16 }}>
              <button
                type="submit"
                style={{ padding: "6px 12px", border: "1px solid #374151", background: "#111827", color: "#fff", borderRadius: 8, cursor: "pointer" }}
              >
                Save
              </button>
            </div>
          </form>
        </section>

        <section style={{ border: "1px solid #1f2937", borderRadius: 12, padding: 16, marginBottom: 16, background: "#0b1220" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600 }}>Preview</h3>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, opacity: 0.8 }}>
            {JSON.stringify(content, null, 2)}
          </pre>
        </section>
      </main>
    </div>
  );
}
