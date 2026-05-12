"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const ACCENT = "#ed0584";

interface LandmarkSummary {
  landmark_slug: string;
  total_impressions: number;
  total_clicks: number;
  total_card_views: number;
  total_cta_clicks: number;
  total_shares: number;
  shares_x: number;
  shares_telegram: number;
  shares_linkedin: number;
  unique_users: number;
  last_activity: string;
}

interface UserActivity {
  user_github_login: string;
  landmark_slug: string;
  event_type: string;
  url: string | null;
  created_at: string;
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<LandmarkSummary[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"summary" | "users">("summary");

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const supabase = createBrowserSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/admin/login");
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

      await fetchAnalytics();
      setLoading(false);
    } catch (err: any) {
      setError(err.message ?? "Authentication failed");
      setLoading(false);
    }
  }

  async function fetchAnalytics() {
    try {
      const supabase = createBrowserSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      const type = view === "users" ? "users" : "summary";
      const response = await fetch(`/api/analytics/landmark?type=${type}`, {
        headers: {
          "Authorization": `Bearer ${session?.access_token}`,
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error ?? "Failed to fetch analytics");
      }

      if (view === "users") {
        setUserActivity(result.activity ?? []);
      } else {
        setSummary(result.summary ?? []);
      }
    } catch (err: any) {
      setError(err.message ?? "Failed to fetch analytics");
    }
  }

  useEffect(() => {
    if (!loading) {
      fetchAnalytics();
    }
  }, [view]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d0f] font-pixel text-[#ed0584]">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0f] font-pixel text-white">
      {/* Header */}
      <header className="border-b-4 border-[#1a1a24] bg-[#101018] px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg text-[#ed0584]">📊 Landmark Analytics</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setView("summary")}
              className={`rounded-none border px-4 py-1.5 text-sm transition-colors ${
                view === "summary"
                  ? "border-[#ed0584] bg-[#ed0584]/20 text-[#ed0584]"
                  : "border-[#2a2a30] bg-[#161618] text-[#8c8c9c] hover:border-[#ed0584]"
              }`}
            >
              📈 Summary
            </button>
            <button
              onClick={() => setView("users")}
              className={`rounded-none border px-4 py-1.5 text-sm transition-colors ${
                view === "users"
                  ? "border-[#ed0584] bg-[#ed0584]/20 text-[#ed0584]"
                  : "border-[#2a2a30] bg-[#161618] text-[#8c8c9c] hover:border-[#ed0584]"
              }`}
            >
              👥 User Activity
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        {error && (
          <div className="mb-4 rounded-none border border-red-600 bg-red-900/20 px-4 py-3 text-red-400">
            {error}
          </div>
        )}

        {view === "summary" ? (
          /* SUMMARY VIEW */
          <section className="rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6">
            <h3 className="mb-4 text-lg text-[#ed0584]">🏛️ Landmark Performance</h3>
            
            {summary.length === 0 ? (
              <p className="text-[#8c8c9c]">No analytics data yet. Events will appear here once users interact with landmarks.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-[#2a2a30]">
                      <th className="px-3 py-2 text-left text-[#8c8c9c]">Landmark</th>
                      <th className="px-3 py-2 text-right text-[#8c8c9c]">👁️ Impressions</th>
                      <th className="px-3 py-2 text-right text-[#8c8c9c]">🖱️ Clicks</th>
                      <th className="px-3 py-2 text-right text-[#8c8c9c]">📄 Card Views</th>
                      <th className="px-3 py-2 text-right text-[#8c8c9c]">🔗 CTA Clicks</th>
                      <th className="px-3 py-2 text-right text-[#ed0584]">📤 Total Shares</th>
                      <th className="px-3 py-2 text-right text-[#8c8c9c]">👥 Unique Users</th>
                      <th className="px-3 py-2 text-right text-[#8c8c9c]">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.map((landmark) => (
                      <tr key={landmark.landmark_slug} className="border-b border-[#2a2a30]">
                        <td className="px-3 py-3 font-bold text-[#ed0584]">{landmark.landmark_slug}</td>
                        <td className="px-3 py-3 text-right text-[#8c8c9c]">{landmark.total_impressions.toLocaleString()}</td>
                        <td className="px-3 py-3 text-right text-white">{landmark.total_clicks.toLocaleString()}</td>
                        <td className="px-3 py-3 text-right text-[#8c8c9c]">{landmark.total_card_views.toLocaleString()}</td>
                        <td className="px-3 py-3 text-right text-[#6090e0]">{landmark.total_cta_clicks.toLocaleString()}</td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[#ed0584]">{landmark.total_shares.toLocaleString()}</span>
                            {landmark.shares_x > 0 && (
                              <span className="rounded bg-[#1a1a24] px-1.5 py-0.5 text-xs text-white" title="X (Twitter)">
                                𝕏 {landmark.shares_x}
                              </span>
                            )}
                            {landmark.shares_telegram > 0 && (
                              <span className="rounded bg-[#1a1a24] px-1.5 py-0.5 text-xs text-white" title="Telegram">
                                ✈ {landmark.shares_telegram}
                              </span>
                            )}
                            {landmark.shares_linkedin > 0 && (
                              <span className="rounded bg-[#1a1a24] px-1.5 py-0.5 text-xs text-white" title="LinkedIn">
                                in {landmark.shares_linkedin}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right text-[#8c8c9c]">{landmark.unique_users.toLocaleString()}</td>
                        <td className="px-3 py-3 text-right text-xs text-[#8c8c9c]">
                          {landmark.last_activity ? new Date(landmark.last_activity).toLocaleDateString() : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : (
          /* USER ACTIVITY VIEW */
          <section className="rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6">
            <h3 className="mb-4 text-lg text-[#ed0584]">👥 Who Shared What</h3>
            
            {userActivity.length === 0 ? (
              <p className="text-[#8c8c9c]">No user activity yet. Shares and CTA clicks will appear here.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-[#2a2a30]">
                      <th className="px-3 py-2 text-left text-[#8c8c9c]">User</th>
                      <th className="px-3 py-2 text-left text-[#8c8c9c]">Landmark</th>
                      <th className="px-3 py-2 text-left text-[#8c8c9c]">Action</th>
                      <th className="px-3 py-2 text-left text-[#8c8c9c]">URL</th>
                      <th className="px-3 py-2 text-right text-[#8c8c9c]">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userActivity.map((activity, i) => (
                      <tr key={i} className="border-b border-[#2a2a30]">
                        <td className="px-3 py-3 font-bold text-white">@{activity.user_github_login}</td>
                        <td className="px-3 py-3 text-[#ed0584]">{activity.landmark_slug}</td>
                        <td className="px-3 py-3">
                          {activity.event_type === "share_x" && <span className="text-[#ed0584]">📤 Shared on X</span>}
                          {activity.event_type === "share_telegram" && <span className="text-[#ed0584]">✈ Shared on Telegram</span>}
                          {activity.event_type === "share_linkedin" && <span className="text-[#ed0584]">💼 Shared on LinkedIn</span>}
                          {activity.event_type === "cta_clicked" && <span className="text-[#6090e0]">🔗 Clicked CTA</span>}
                        </td>
                        <td className="px-3 py-3 text-xs text-[#8c8c9c]">
                          {activity.url ? (
                            <a href={activity.url} target="_blank" rel="noopener noreferrer" className="hover:text-[#ed0584] hover:underline">
                              {activity.url.length > 50 ? activity.url.substring(0, 50) + "..." : activity.url}
                            </a>
                          ) : "-"}
                        </td>
                        <td className="px-3 py-3 text-right text-xs text-[#8c8c9c]">
                          {new Date(activity.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Stats Cards */}
        {view === "summary" && summary.length > 0 && (
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-none border-4 border-[#1a1a24] bg-[#101018] p-4 text-center">
              <div className="text-3xl text-[#8c8c9c]">👁️</div>
              <div className="mt-2 text-2xl font-bold text-white">
                {summary.reduce((sum, l) => sum + l.total_impressions, 0).toLocaleString()}
              </div>
              <div className="text-xs text-[#8c8c9c]">Total Impressions</div>
            </div>
            <div className="rounded-none border-4 border-[#1a1a24] bg-[#101018] p-4 text-center">
              <div className="text-3xl text-[#8c8c9c]">🖱️</div>
              <div className="mt-2 text-2xl font-bold text-white">
                {summary.reduce((sum, l) => sum + l.total_clicks, 0).toLocaleString()}
              </div>
              <div className="text-xs text-[#8c8c9c]">Total Clicks</div>
            </div>
            <div className="rounded-none border-4 border-[#1a1a24] bg-[#101018] p-4 text-center">
              <div className="text-3xl text-[#8c8c9c]">📤</div>
              <div className="mt-2 text-2xl font-bold text-[#ed0584]">
                {summary.reduce((sum, l) => sum + l.total_shares, 0).toLocaleString()}
              </div>
              <div className="text-xs text-[#8c8c9c]">Total Shares</div>
            </div>
            <div className="rounded-none border-4 border-[#1a1a24] bg-[#101018] p-4 text-center">
              <div className="text-3xl text-[#8c8c9c]">👥</div>
              <div className="mt-2 text-2xl font-bold text-white">
                {summary.reduce((sum, l) => sum + l.unique_users, 0).toLocaleString()}
              </div>
              <div className="text-xs text-[#8c8c9c]">Unique Users</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
