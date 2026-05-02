"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const ACCENT = "#e040c0";

interface Content {
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
    setError(null);
    setSuccess(null);

    try {
      const supabase = createBrowserSupabase();
      
      const { data: existing } = await supabase
        .from("app_content")
        .select("id")
        .eq("id", 1)
        .single();

      let error;
      if (existing) {
        // Update
        ({ error } = await supabase
          .from("app_content")
          .update(content)
          .eq("id", 1));
      } else {
        // Insert
        ({ error } = await supabase
          .from("app_content")
          .insert({ id: 1, ...content }));
      }

      if (error) throw error;

      setSuccess("Content saved successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message ?? "Failed to save content");
      setTimeout(() => setError(null), 3000);
    }
  }

  function handleChange(field: keyof Content, value: string) {
    setContent({ ...content, [field]: value });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a12]">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: ACCENT }} />
          <p className="text-[#8c8c9c]">Loading content...</p>
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
          <h1 className="text-xl font-bold">Content CMS</h1>
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

      <main className="p-6">
        <form onSubmit={handleSave}>
          {/* Web4City Section */}
          <section className="mb-8 rounded-xl border border-[#1f2937] bg-[#111827] p-6">
            <h2 className="mb-4 text-lg font-bold">Web4City (Home)</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-[#8c8c9c]">Web4City Title</label>
                <input
                  type="text"
                  value={content.web4city_title}
                  onChange={(e) => handleChange("web4city_title", e.target.value)}
                  placeholder="Web4City"
                  className="w-full rounded-lg border border-[#374151] bg-[#0b1220] px-4 py-2.5 text-white focus:border-[#e040c0] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-[#8c8c9c]">Web4City Subtitle</label>
                <input
                  type="text"
                  value={content.web4city_subtitle}
                  onChange={(e) => handleChange("web4city_subtitle", e.target.value)}
                  placeholder="Your GitHub as a 3D City"
                  className="w-full rounded-lg border border-[#374151] bg-[#0b1220] px-4 py-2.5 text-white focus:border-[#e040c0] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#8c8c9c]">Wallet Button Text</label>
                <input
                  type="text"
                  value={content.wallet_button_text}
                  onChange={(e) => handleChange("wallet_button_text", e.target.value)}
                  placeholder="Connect Wallet"
                  className="w-full rounded-lg border border-[#374151] bg-[#0b1220] px-4 py-2.5 text-white focus:border-[#e040c0] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#8c8c9c]">Wallet Button Link (optional)</label>
                <input
                  type="text"
                  value={content.wallet_button_link}
                  onChange={(e) => handleChange("wallet_button_link", e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-[#374151] bg-[#0b1220] px-4 py-2.5 text-white focus:border-[#e040c0] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#8c8c9c]">Featured Image (Passport)</label>
                <input
                  type="text"
                  value={content.featured_image_passport}
                  onChange={(e) => handleChange("featured_image_passport", e.target.value)}
                  placeholder="ProBlox_NEW.png"
                  className="w-full rounded-lg border border-[#374151] bg-[#0b1220] px-4 py-2.5 text-white focus:border-[#e040c0] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#8c8c9c]">Featured Image (Quest)</label>
                <input
                  type="text"
                  value={content.featured_image_quest}
                  onChange={(e) => handleChange("featured_image_quest", e.target.value)}
                  placeholder="QuestBlox_NEW.png"
                  className="w-full rounded-lg border border-[#374151] bg-[#0b1220] px-4 py-2.5 text-white focus:border-[#e040c0] focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Explore Section */}
          <section className="mb-8 rounded-xl border border-[#1f2937] bg-[#111827] p-6">
            <h2 className="mb-4 text-lg font-bold">Explore City</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-[#8c8c9c]">Explore Title</label>
                <input
                  type="text"
                  value={content.explore_title}
                  onChange={(e) => handleChange("explore_title", e.target.value)}
                  placeholder="Explore City"
                  className="w-full rounded-lg border border-[#374151] bg-[#0b1220] px-4 py-2.5 text-white focus:border-[#e040c0] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-[#8c8c9c]">Explore Subtitle</label>
                <input
                  type="text"
                  value={content.explore_subtitle}
                  onChange={(e) => handleChange("explore_subtitle", e.target.value)}
                  placeholder="Browse Buildings"
                  className="w-full rounded-lg border border-[#374151] bg-[#0b1220] px-4 py-2.5 text-white focus:border-[#e040c0] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-[#8c8c9c]">Featured Image (Explore)</label>
                <input
                  type="text"
                  value={content.featured_image_explore}
                  onChange={(e) => handleChange("featured_image_explore", e.target.value)}
                  placeholder="Explore_NEW.png"
                  className="w-full rounded-lg border border-[#374151] bg-[#0b1220] px-4 py-2.5 text-white focus:border-[#e040c0] focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Lobby Section */}
          <section className="mb-8 rounded-xl border border-[#1f2937] bg-[#111827] p-6">
            <h2 className="mb-4 text-lg font-bold">Lobby</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-[#8c8c9c]">Lobby Title</label>
                <input
                  type="text"
                  value={content.lobby_title}
                  onChange={(e) => handleChange("lobby_title", e.target.value)}
                  placeholder="Lobby"
                  className="w-full rounded-lg border border-[#374151] bg-[#0b1220] px-4 py-2.5 text-white focus:border-[#e040c0] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-[#8c8c9c]">Lobby Subtitle</label>
                <input
                  type="text"
                  value={content.lobby_subtitle}
                  onChange={(e) => handleChange("lobby_subtitle", e.target.value)}
                  placeholder="Meet other devs"
                  className="w-full rounded-lg border border-[#374151] bg-[#0b1220] px-4 py-2.5 text-white focus:border-[#e040c0] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-[#8c8c9c]">Featured Image (Lobby)</label>
                <input
                  type="text"
                  value={content.featured_image_lobby}
                  onChange={(e) => handleChange("featured_image_lobby", e.target.value)}
                  placeholder="Lobby_NEW.png"
                  className="w-full rounded-lg border border-[#374151] bg-[#0b1220] px-4 py-2.5 text-white focus:border-[#e040c0] focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Preview */}
          <section className="mb-8 rounded-xl border border-[#1f2937] bg-[#111827] p-6">
            <h2 className="mb-4 text-lg font-bold">Preview</h2>
            <pre className="max-h-96 overflow-y-auto rounded-lg bg-[#0b1220] p-4 font-mono text-xs text-[#8c8c9c]">
              {JSON.stringify(content, null, 2)}
            </pre>
          </section>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-lg px-6 py-2.5 font-medium"
              style={{ backgroundColor: ACCENT }}
            >
              Save Content
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
