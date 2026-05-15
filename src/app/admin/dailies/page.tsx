"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const ACCENT = "#ed0584";

interface Mission {
  id: string;
  title: string;
  description: string;
  threshold: number;
  desktopOnly?: boolean;
  active?: boolean;
}

export default function AdminDailiesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [githubLogin, setGithubLogin] = useState<string>("");
  const [missions, setMissions] = useState<Mission[]>([]);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<Record<string, { completions: number; uniqueUsers: number }>>({});
  
  // New mission form
  const [newMission, setNewMission] = useState<Partial<Mission>>({
    id: "",
    title: "",
    description: "",
    threshold: 1,
    desktopOnly: false,
    active: true,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading && !error) {
      loadMissions();
      loadStats();
    }
  }, [loading, error]);

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

  async function loadMissions() {
    try {
      const res = await fetch("/api/admin/dailies", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setMissions(data.missions || []);
      }
    } catch (err) {
      console.error("Failed to load missions:", err);
    }
  }

  async function loadStats() {
    try {
      const res = await fetch("/api/admin/dailies/stats", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats || {});
      }
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/dailies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missions }),
      });
      if (res.ok) {
        alert("✅ Missions saved successfully!");
        loadStats();
      } else {
        const err = await res.json();
        alert("❌ Failed to save: " + (err.error || "Unknown error"));
      }
    } catch (err) {
      alert("❌ Failed to save: " + err);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddMission() {
    if (!newMission.id || !newMission.title || !newMission.description) {
      alert("❌ Please fill in all required fields");
      return;
    }
    
    if (missions.some(m => m.id === newMission.id)) {
      alert("❌ Mission ID already exists");
      return;
    }

    setMissions([...missions, {
      id: newMission.id!,
      title: newMission.title!,
      description: newMission.description!,
      threshold: newMission.threshold || 1,
      desktopOnly: newMission.desktopOnly || false,
      active: newMission.active !== false,
    }]);

    setNewMission({
      id: "",
      title: "",
      description: "",
      threshold: 1,
      desktopOnly: false,
      active: true,
    });
  }

  function handleRemoveMission(id: string) {
    setMissions(missions.filter(m => m.id !== id));
  }

  function handleToggleActive(id: string) {
    setMissions(missions.map(m => 
      m.id === id ? { ...m, active: !m.active } : m
    ));
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
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin")}
            className="text-sm text-[#8c8c9c] hover:text-[#ed0584]"
          >
            ← Back
          </button>
          <div>
            <div className="text-lg text-[#ed0584]">🎯 Daily Missions Manager</div>
            <div className="text-xs text-[#8c8c9c] mt-1">Manage quest pool for all users</div>
          </div>
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

      {/* Main Content */}
      <main className="p-8 max-w-7xl mx-auto">
        {/* Stats Overview */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-[#2a2a30] bg-[#161618] p-4">
            <div className="text-2xl text-[#ed0584]">{missions.length}</div>
            <div className="text-xs text-[#8c8c9c]">Total Missions</div>
          </div>
          <div className="border border-[#2a2a30] bg-[#161618] p-4">
            <div className="text-2xl text-[#ed0584]">{missions.filter(m => m.active).length}</div>
            <div className="text-xs text-[#8c8c9c]">Active Missions</div>
          </div>
          <div className="border border-[#2a2a30] bg-[#161618] p-4">
            <div className="text-2xl text-[#ed0584]">{missions.filter(m => !m.active).length}</div>
            <div className="text-xs text-[#8c8c9c]">Inactive Missions</div>
          </div>
          <div className="border border-[#2a2a30] bg-[#161618] p-4">
            <div className="text-2xl text-[#ed0584]">{missions.filter(m => m.desktopOnly).length}</div>
            <div className="text-xs text-[#8c8c9c]">Desktop Only</div>
          </div>
        </div>

        {/* Add New Mission Form */}
        <div className="mb-8 border border-[#2a2a30] bg-[#161618] p-6">
          <h2 className="text-lg text-[#ed0584] mb-4">➕ Add New Mission</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Mission ID (snake_case)"
              value={newMission.id || ""}
              onChange={(e) => setNewMission({ ...newMission, id: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
              className="border border-[#2a2a30] bg-[#0d0d0f] px-3 py-2 text-sm text-[#e8dcc8] placeholder-[#8c8c9c] focus:border-[#ed0584] focus:outline-none"
            />
            <input
              type="text"
              placeholder="Title (e.g., 'Kudos Master')"
              value={newMission.title || ""}
              onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
              className="border border-[#2a2a30] bg-[#0d0d0f] px-3 py-2 text-sm text-[#e8dcc8] placeholder-[#8c8c9c] focus:border-[#ed0584] focus:outline-none"
            />
            <input
              type="text"
              placeholder="Description (e.g., 'Give 10 kudos')"
              value={newMission.description || ""}
              onChange={(e) => setNewMission({ ...newMission, description: e.target.value })}
              className="border border-[#2a2a30] bg-[#0d0d0f] px-3 py-2 text-sm text-[#e8dcc8] placeholder-[#8c8c9c] focus:border-[#ed0584] focus:outline-none"
            />
            <input
              type="number"
              placeholder="Threshold"
              value={newMission.threshold || 1}
              onChange={(e) => setNewMission({ ...newMission, threshold: parseInt(e.target.value) || 1 })}
              className="border border-[#2a2a30] bg-[#0d0d0f] px-3 py-2 text-sm text-[#e8dcc8] placeholder-[#8c8c9c] focus:border-[#ed0584] focus:outline-none"
            />
            <label className="flex items-center gap-2 text-sm text-[#8c8c9c]">
              <input
                type="checkbox"
                checked={newMission.desktopOnly || false}
                onChange={(e) => setNewMission({ ...newMission, desktopOnly: e.target.checked })}
                className="accent-[#ed0584]"
              />
              Desktop Only
            </label>
            <button
              onClick={handleAddMission}
              className="border border-[#ed0584] bg-[#ed0584]/10 px-4 py-2 text-sm text-[#ed0584] hover:bg-[#ed0584] hover:text-white transition-colors"
            >
              Add Mission
            </button>
          </div>
        </div>

        {/* Mission List */}
        <div className="border border-[#2a2a30] bg-[#161618]">
          <div className="flex items-center justify-between border-b border-[#2a2a30] px-6 py-4">
            <h2 className="text-lg text-[#ed0584]">📋 Mission Pool</h2>
            <button
              onClick={handleSave}
              disabled={saving}
              className="border border-[#ed0584] bg-[#ed0584] px-4 py-2 text-sm text-white hover:bg-[#ed0584]/80 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "💾 Save Changes"}
            </button>
          </div>

          <div className="divide-y divide-[#2a2a30]">
            {missions.length === 0 ? (
              <div className="p-8 text-center text-[#8c8c9c]">
                No missions yet. Add your first mission above!
              </div>
            ) : (
              missions.map((mission) => {
                const stat = stats[mission.id];
                return (
                  <div key={mission.id} className={`flex items-center gap-4 px-6 py-4 ${!mission.active ? "opacity-50" : ""}`}>
                    {/* Status Toggle */}
                    <button
                      onClick={() => handleToggleActive(mission.id)}
                      className={`shrink-0 w-3 h-3 rounded-full ${mission.active ? "bg-[#00ff88]" : "bg-[#8c8c9c]"}`}
                      title={mission.active ? "Active" : "Inactive"}
                    />
                    
                    {/* Mission Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#e8dcc8]">{mission.title}</span>
                        <span className="text-xs text-[#8c8c9c]">({mission.id})</span>
                        {mission.desktopOnly && (
                          <span className="text-[10px] border border-[#8c8c9c] px-1.5 py-0.5 text-[#8c8c9c]">Desktop</span>
                        )}
                      </div>
                      <div className="text-xs text-[#8c8c9c] mt-0.5">{mission.description}</div>
                      <div className="text-[10px] text-[#8c8c9c] mt-1">
                        Threshold: <span className="text-[#ed0584]">{mission.threshold}</span>
                        {stat && (
                          <span className="ml-3">
                            • Completions: <span className="text-[#00ff88]">{stat.completions}</span>
                            • Users: <span className="text-[#00ccff]">{stat.uniqueUsers}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => handleRemoveMission(mission.id)}
                      className="shrink-0 border border-red-500/50 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-xs text-[#8c8c9c]">
          <p>💡 <strong>Tip:</strong> Users get 3 random missions daily (always includes "checkin"). Changes apply to all users immediately.</p>
        </div>
      </main>
    </div>
  );
}
