"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const ACCENT = "#ed0584";

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
          <div className="text-lg text-[#ed0584]">🎮 Web4City Admin</div>
          <div className="text-xs text-[#8c8c9c] mt-1">Welcome back, @{githubLogin}</div>
        </div>
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
      </header>

      {/* Main Dashboard */}
      <main className="p-8">
        {/* Welcome Section */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl text-[#ed0584] mb-3">🚀 Admin Dashboard</h1>
          <p className="text-sm text-[#8c8c9c]">Select a section to manage your Web4City platform</p>
        </div>

        {/* Shortcut Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {/* Ads Manager */}
          <a
            href="/admin/ads"
            className="group relative overflow-hidden rounded-none border-4 border-[#1a1a24] bg-[#101018] p-8 hover:border-[#ed0584] transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#ed0584]/20"
          >
            <div className="text-5xl mb-4">📢</div>
            <h3 className="text-xl text-[#ed0584] mb-2">Ads Manager</h3>
            <p className="text-sm text-[#8c8c9c] mb-4">Create and manage ad campaigns</p>
            <div className="flex items-center text-xs text-[#6a6a7a]">
              <span className="mr-2">✈️ Planes</span>
              <span className="mr-2">🎈 Blimps</span>
              <span>🏢 Billboards</span>
            </div>
            <div className="absolute top-2 right-2 text-xs text-[#4a4a5a]">⌘1</div>
          </a>

          {/* Drops */}
          <a
            href="/admin/drops"
            className="group relative overflow-hidden rounded-none border-4 border-[#1a1a24] bg-[#101018] p-8 hover:border-[#ed0584] transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#ed0584]/20"
          >
            <div className="text-5xl mb-4">🎁</div>
            <h3 className="text-xl text-[#ed0584] mb-2">Drops</h3>
            <p className="text-sm text-[#8c8c9c] mb-4">Manage building drops & rewards</p>
            <div className="flex items-center text-xs text-[#6a6a7a]">
              <span className="mr-2">💎 Rare</span>
              <span className="mr-2">⭐ Epic</span>
              <span>🏆 Legendary</span>
            </div>
            <div className="absolute top-2 right-2 text-xs text-[#4a4a5a]">⌘2</div>
          </a>

          {/* Email Monitoring */}
          <a
            href="/admin/email-monitoring"
            className="group relative overflow-hidden rounded-none border-4 border-[#1a1a24] bg-[#101018] p-8 hover:border-[#ed0584] transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#ed0584]/20"
          >
            <div className="text-5xl mb-4">📧</div>
            <h3 className="text-xl text-[#ed0584] mb-2">Email Monitoring</h3>
            <p className="text-sm text-[#8c8c9c] mb-4">Track email verification status</p>
            <div className="flex items-center text-xs text-[#6a6a7a]">
              <span className="mr-2">✅ Verified</span>
              <span className="mr-2">⏳ Pending</span>
              <span>❌ Bounced</span>
            </div>
            <div className="absolute top-2 right-2 text-xs text-[#4a4a5a]">⌘3</div>
          </a>

          {/* Jobs */}
          <a
            href="/admin/jobs"
            className="group relative overflow-hidden rounded-none border-4 border-[#1a1a24] bg-[#101018] p-8 hover:border-[#ed0584] transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#ed0584]/20"
          >
            <div className="text-5xl mb-4">💼</div>
            <h3 className="text-xl text-[#ed0584] mb-2">Jobs</h3>
            <p className="text-sm text-[#8c8c9c] mb-4">Manage job listings</p>
            <div className="flex items-center text-xs text-[#6a6a7a]">
              <span className="mr-2">📝 Post</span>
              <span className="mr-2">👥 Applications</span>
              <span>✅ Active</span>
            </div>
            <div className="absolute top-2 right-2 text-xs text-[#4a4a5a]">⌘4</div>
          </a>

          {/* Landmarks */}
          <a
            href="/admin/landmarks"
            className="group relative overflow-hidden rounded-none border-4 border-[#1a1a24] bg-[#101018] p-8 hover:border-[#ed0584] transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#ed0584]/20"
          >
            <div className="text-5xl mb-4">🏛️</div>
            <h3 className="text-xl text-[#ed0584] mb-2">Landmarks</h3>
            <p className="text-sm text-[#8c8c9c] mb-4">Configure city landmarks</p>
            <div className="flex items-center text-xs text-[#6a6a7a]">
              <span className="mr-2">📍 Position</span>
              <span className="mr-2">🎯 Benefits</span>
              <span>👑 Ownership</span>
            </div>
            <div className="absolute top-2 right-2 text-xs text-[#4a4a5a]">⌘5</div>
          </a>

          {/* Users & Analytics */}
          <a
            href="/admin/users"
            className="group relative overflow-hidden rounded-none border-4 border-[#1a1a24] bg-[#101018] p-8 hover:border-[#ed0584] transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#ed0584]/20"
          >
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-xl text-[#ed0584] mb-2">Users & Analytics</h3>
            <p className="text-sm text-[#8c8c9c] mb-4">View all users & statistics</p>
            <div className="flex items-center text-xs text-[#6a6a7a]">
              <span className="mr-2">📊 Stats</span>
              <span className="mr-2">🏆 XP</span>
              <span>🚫 Ban</span>
            </div>
            <div className="absolute top-2 right-2 text-xs text-[#4a4a5a]">⌘6</div>
          </a>

          {/* City View */}
          <a
            href="/"
            className="group relative overflow-hidden rounded-none border-4 border-[#1a1a24] bg-[#101018] p-8 hover:border-[#ed0584] transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#ed0584]/20"
          >
            <div className="text-5xl mb-4">🏙️</div>
            <h3 className="text-xl text-[#ed0584] mb-2">View City</h3>
            <p className="text-sm text-[#8c8c9c] mb-4">Open the live city view</p>
            <div className="flex items-center text-xs text-[#6a6a7a]">
              <span className="mr-2">🌃 Live</span>
              <span className="mr-2">🎮 Interactive</span>
              <span>🚀 Explore</span>
            </div>
            <div className="absolute top-2 right-2 text-xs text-[#4a4a5a]">⌘0</div>
          </a>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 max-w-6xl mx-auto">
          <div className="border-t border-[#2a2a30] pt-8">
            <h3 className="text-lg text-[#8c8c9c] mb-4 text-center">Quick Access</h3>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => router.push("/admin/ads")}
                className="rounded-none border-2 border-[#2a2a30] bg-[#161618] px-4 py-2 text-sm hover:border-[#ed0584] hover:text-[#ed0584] transition-colors"
              >
                📢 Create Ad
              </button>
              <button
                onClick={() => router.push("/admin/drops")}
                className="rounded-none border-2 border-[#2a2a30] bg-[#161618] px-4 py-2 text-sm hover:border-[#ed0584] hover:text-[#ed0584] transition-colors"
              >
                🎁 New Drop
              </button>
              <button
                onClick={() => router.push("/admin/jobs")}
                className="rounded-none border-2 border-[#2a2a30] bg-[#161618] px-4 py-2 text-sm hover:border-[#ed0584] hover:text-[#ed0584] transition-colors"
              >
                💼 Post Job
              </button>
              <button
                onClick={() => window.open("https://web4city.xyz", "_blank")}
                className="rounded-none border-2 border-[#2a2a30] bg-[#161618] px-4 py-2 text-sm hover:border-[#ed0584] hover:text-[#ed0584] transition-colors"
              >
                🌐 Open City ↗
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
