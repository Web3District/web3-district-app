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
      <header className="flex items-center justify-between border-b border-[#2a2a30] px-6 py-4">
        <div>
          <div className="text-lg">Admin Panel</div>
          <div className="text-xs text-[#8c8c9c] mt-1">Logged in as @{githubLogin}</div>
        </div>
        <button
          onClick={async () => {
            const supabase = createBrowserSupabase();
            await supabase.auth.signOut();
            router.push("/");
          }}
          className="rounded-none border border-[#2a2a30] bg-[#161618] px-3 py-1.5 text-sm hover:bg-[#1c1c20]"
        >
          Sign out
        </button>
      </header>

      <main className="p-6">
        <div className="mb-8">
          <h2 className="text-xl text-[#ed0584] mb-2">Admin Dashboard</h2>
          <p className="text-sm text-[#8c8c9c]">Manage Git City admin features</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <a href="/admin/ads" className="group rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6 hover:border-[#ed0584] transition-colors">
            <h3 className="mb-2 text-lg text-[#ed0584]">Ads</h3>
            <p className="text-sm text-[#8c8c9c]">Manage ad campaigns, track impressions and clicks</p>
          </a>

          <a href="/admin/drops" className="group rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6 hover:border-[#ed0584] transition-colors">
            <h3 className="mb-2 text-lg text-[#ed0584]">Drops</h3>
            <p className="text-sm text-[#8c8c9c]">Manage building drops and rewards</p>
          </a>

          <a href="/admin/email-monitoring" className="group rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6 hover:border-[#ed0584] transition-colors">
            <h3 className="mb-2 text-lg text-[#ed0584]">Email Monitoring</h3>
            <p className="text-sm text-[#8c8c9c]">Monitor email verification status</p>
          </a>

          <a href="/admin/jobs" className="group rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6 hover:border-[#ed0584] transition-colors">
            <h3 className="mb-2 text-lg text-[#ed0584]">Jobs</h3>
            <p className="text-sm text-[#8c8c9c]">Manage job listings</p>
          </a>

          <a href="/admin/landmarks" className="group rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6 hover:border-[#ed0584] transition-colors">
            <h3 className="mb-2 text-lg text-[#ed0584]">Landmarks</h3>
            <p className="text-sm text-[#8c8c9c]">Manage city landmarks</p>
          </a>
        </div>
      </main>
    </div>
  );
}
