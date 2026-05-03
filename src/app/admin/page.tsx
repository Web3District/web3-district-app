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
        <div className="text-lg">Admin Panel</div>
        <div className="flex items-center gap-4">
          <a
            href="/admin/dashboard"
            className="rounded-none border border-[#2a2a30] bg-[#161618] px-3 py-1.5 text-sm hover:bg-[#1c1c20]"
          >
            Dashboard
          </a>
          <div className="text-xs text-[#8c8c9c]">Session TTL / Idle enforced</div>
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
        </div>
      </header>

      <main className="p-6">
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <a href="/admin/users" className="rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6 hover:border-[#e040c0]">
            <h3 className="mb-2 text-lg text-[#e040c0]">Users</h3>
            <p className="text-sm text-[#8c8c9c]">View and manage all users</p>
          </a>

          <a href="/admin/quests" className="rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6 hover:border-[#e040c0]">
            <h3 className="mb-2 text-lg text-[#e040c0]">Quests</h3>
            <p className="text-sm text-[#8c8c9c]">Create/edit quests</p>
          </a>

          <a href="/admin/venues" className="rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6 hover:border-[#e040c0]">
            <h3 className="mb-2 text-lg text-[#e040c0]">Venues</h3>
            <p className="text-sm text-[#8c8c9c]">Manage venue locations</p>
          </a>

          <a href="/admin/districts" className="rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6 hover:border-[#e040c0]">
            <h3 className="mb-2 text-lg text-[#e040c0]">Districts</h3>
            <p className="text-sm text-[#8c8c9c]">View territory claims</p>
          </a>

          <a href="/admin/content" className="rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6 hover:border-[#e040c0]">
            <h3 className="mb-2 text-lg text-[#e040c0]">Content</h3>
            <p className="text-sm text-[#8c8c9c]">Edit app texts and images</p>
          </a>

          <a href="/admin/city" className="rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6 hover:border-[#e040c0]">
            <h3 className="mb-2 text-lg text-[#e040c0]">City Analytics</h3>
            <p className="text-sm text-[#8c8c9c]">View city stats</p>
          </a>
        </div>
      </main>
    </div>
  );
}
