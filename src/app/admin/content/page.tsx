"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const ACCENT = "#e040c0";

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
        ...content,
        updated_at: new Date().toISOString(),
      };

      const { data: existing } = await supabase
        .from("app_content")
        .select("id")
        .eq("id", 1)
        .single();

      let error;
      if (existing) {
        const result = await supabase.from("app_content").update(payload).eq("id", 1);
        error = result.error;
      } else {
        const result = await supabase.from("app_content").insert({ ...payload, id: 1 });
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
        <h1 className="text-lg">Content</h1>
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

        <section className="mb-6 rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6">
          <h3 className="mb-4 text-lg text-[#e040c0]">App Copy & Links</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Web4City Title</label>
              <input
                value={content.web4city_title}
                onChange={(e) => handleInputChange("web4city_title", e.target.value)}
                placeholder="Web4City"
                className="w-full max-w-md rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Web4City Subtitle</label>
              <input
                value={content.web4city_subtitle}
                onChange={(e) => handleInputChange("web4city_subtitle", e.target.value)}
                placeholder="Your GitHub as a 3D City"
                className="w-full max-w-md rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Wallet Button Text</label>
              <input
                value={content.wallet_button_text}
                onChange={(e) => handleInputChange("wallet_button_text", e.target.value)}
                placeholder="Connect Wallet"
                className="w-full max-w-md rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Wallet Button Link</label>
              <input
                value={content.wallet_button_link}
                onChange={(e) => handleInputChange("wallet_button_link", e.target.value)}
                placeholder="https://..."
                className="w-full max-w-md rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
              />
            </div>

            <hr className="border-[#2a2a30]" />

            <h4 className="text-[#e040c0]">Passport</h4>
            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Featured Image</label>
              <input
                value={content.featured_image_passport}
                onChange={(e) => handleInputChange("featured_image_passport", e.target.value)}
                placeholder="ProBlox_NEW.png"
                className="w-full max-w-md rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
              />
            </div>

            <hr className="border-[#2a2a30]" />

            <h4 className="text-[#e040c0]">Quest</h4>
            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Featured Image</label>
              <input
                value={content.featured_image_quest}
                onChange={(e) => handleInputChange("featured_image_quest", e.target.value)}
                placeholder="QuestBlox_NEW.png"
                className="w-full max-w-md rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
              />
            </div>

            <hr className="border-[#2a2a30]" />

            <h4 className="text-[#e040c0]">Explore</h4>
            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Title</label>
              <input
                value={content.explore_title}
                onChange={(e) => handleInputChange("explore_title", e.target.value)}
                placeholder="Explore City"
                className="w-full max-w-md rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Subtitle</label>
              <input
                value={content.explore_subtitle}
                onChange={(e) => handleInputChange("explore_subtitle", e.target.value)}
                placeholder="Browse Buildings"
                className="w-full max-w-md rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Featured Image</label>
              <input
                value={content.featured_image_explore}
                onChange={(e) => handleInputChange("featured_image_explore", e.target.value)}
                placeholder="Explore_NEW.png"
                className="w-full max-w-md rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
              />
            </div>

            <hr className="border-[#2a2a30]" />

            <h4 className="text-[#e040c0]">Lobby</h4>
            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Title</label>
              <input
                value={content.lobby_title}
                onChange={(e) => handleInputChange("lobby_title", e.target.value)}
                placeholder="Lobby"
                className="w-full max-w-md rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Subtitle</label>
              <input
                value={content.lobby_subtitle}
                onChange={(e) => handleInputChange("lobby_subtitle", e.target.value)}
                placeholder="Meet other devs"
                className="w-full max-w-md rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Featured Image</label>
              <input
                value={content.featured_image_lobby}
                onChange={(e) => handleInputChange("featured_image_lobby", e.target.value)}
                placeholder="Lobby_NEW.png"
                className="w-full max-w-md rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="mt-4 rounded-none border border-[#2a2a30] bg-[#161618] px-6 py-2 font-pixel text-white hover:bg-[#1c1c20]"
              style={{ borderColor: ACCENT }}
            >
              Save
            </button>
          </form>
        </section>

        <section className="rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6">
          <h3 className="mb-4 text-lg text-[#e040c0]">Preview</h3>
          <pre className="whitespace-pre-wrap text-xs text-[#8c8c9c]">
            {JSON.stringify(content, null, 2)}
          </pre>
        </section>
      </main>
    </div>
  );
}
