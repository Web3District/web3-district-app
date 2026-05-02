"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const ACCENT = "#e040c0";

interface AdminPage {
  href: string;
  title: string;
  description: string;
  icon: string;
  priority: "high" | "medium" | "low";
}

const adminPages: AdminPage[] = [
  {
    href: "/admin/city",
    title: "City Analytics",
    description: "View city stats, users, visits, contributions, and district breakdown",
    icon: "📊",
    priority: "high",
  },
  {
    href: "/admin/users",
    title: "User Management",
    description: "View all users, search, ban/unban, and moderate",
    icon: "👥",
    priority: "high",
  },
  {
    href: "/admin/districts",
    title: "Districts",
    description: "View territory claims and district building counts",
    icon: "🗺️",
    priority: "high",
  },
  {
    href: "/admin/quests",
    title: "Quests",
    description: "Create, edit, and activate user quests and missions",
    icon: "🎯",
    priority: "medium",
  },
  {
    href: "/admin/venues",
    title: "Venues",
    description: "Manage sponsor locations, check-in spots, and events",
    icon: "📍",
    priority: "medium",
  },
  {
    href: "/admin/content",
    title: "Content CMS",
    description: "Update app texts, titles, and images without deploying",
    icon: "📝",
    priority: "medium",
  },
  {
    href: "/admin/ads",
    title: "Ads",
    description: "Manage ad campaigns and sponsorships",
    icon: "📢",
    priority: "medium",
  },
  {
    href: "/admin/drops",
    title: "Drops",
    description: "Create and manage building drops",
    icon: "🎁",
    priority: "low",
  },
];

export default function AdminDashboardPage() {
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
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a12]">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: ACCENT }} />
          <p className="text-[#8c8c9c]">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a12]">
        <div className="text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded-lg px-4 py-2"
            style={{ backgroundColor: ACCENT }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      {/* Header */}
      <header className="border-b border-[#1f2937] px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Web4City Admin</h1>
            <p className="mt-1 text-sm text-[#8c8c9c]">
              Welcome back, <span className="font-medium text-white">@{githubLogin}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="rounded-lg border border-[#374151] bg-[#111827] px-4 py-2 text-sm hover:bg-[#1f2937]"
            >
              ← Back to App
            </a>
            <button
              onClick={async () => {
                const supabase = createBrowserSupabase();
                await supabase.auth.signOut();
                router.push("/");
              }}
              className="rounded-lg border border-red-600/30 bg-red-900/20 px-4 py-2 text-sm text-red-400 hover:bg-red-900/40"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Quick Stats */}
        <section className="mb-8 rounded-xl border border-[#1f2937] bg-[#111827] p-6">
          <h2 className="mb-4 text-lg font-bold">Quick Access</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {adminPages.filter(p => p.priority === "high").map((page) => (
              <a
                key={page.href}
                href={page.href}
                className="group rounded-xl border border-[#1f2937] bg-[#0b1220] p-4 transition-all hover:scale-[1.02] hover:border-[#e040c0]/50"
              >
                <div className="mb-2 text-2xl">{page.icon}</div>
                <h3 className="font-bold group-hover:text-[#e040c0]">{page.title}</h3>
                <p className="mt-1 text-xs text-[#8c8c9c]">{page.description}</p>
              </a>
            ))}
          </div>
        </section>

        {/* All Pages */}
        <section className="rounded-xl border border-[#1f2937] bg-[#111827] p-6">
          <h2 className="mb-4 text-lg font-bold">All Admin Pages</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {adminPages.map((page) => (
              <a
                key={page.href}
                href={page.href}
                className="group flex items-start gap-3 rounded-lg border border-[#1f2937] bg-[#0b1220] p-4 transition-all hover:border-[#e040c0]/50 hover:bg-[#111827]"
              >
                <div className="text-2xl">{page.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold group-hover:text-[#e040c0]">{page.title}</h3>
                  <p className="mt-1 text-xs text-[#8c8c9c]">{page.description}</p>
                  {page.priority === "high" && (
                    <span className="mt-2 inline-block rounded bg-green-900/30 px-2 py-0.5 text-[10px] text-green-400">
                      High Priority
                    </span>
                  )}
                </div>
                <svg
                  className="mt-1 h-5 w-5 text-[#6b7280] group-hover:text-[#e040c0]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-[#6b7280]">
          <p>Web4City Admin Panel • Built with Next.js & Supabase</p>
          <p className="mt-1 text-xs">
            Access restricted to authorized administrators only
          </p>
        </footer>
      </main>
    </div>
  );
}
