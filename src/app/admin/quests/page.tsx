"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const ACCENT = "#e040c0";

interface Quest {
  id?: number;
  quest_id: string;
  category: "personal" | "global";
  title: string;
  description: string;
  requirements: Record<string, unknown>;
  gblx_cost: number;
  reward_gblx: number;
  reward_aura: number;
  sort_order: number;
  status: "draft" | "live";
  created_at?: string;
}

export default function AdminQuestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Quest>({
    quest_id: "",
    category: "personal",
    title: "",
    description: "",
    requirements: {},
    gblx_cost: 0,
    reward_gblx: 0,
    reward_aura: 0,
    sort_order: 0,
    status: "draft",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const supabase = createBrowserSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push("/admin/login?next=/admin/quests");
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

    fetchQuests();
  }

  async function fetchQuests() {
    try {
      const supabase = createBrowserSupabase();
      
      const { data, error: questsError } = await supabase
        .from("quest_definitions")
        .select("*")
        .order("sort_order", { ascending: true });

      if (questsError) throw questsError;

      setQuests(data ?? []);
    } catch (err: any) {
      setError(err.message ?? "Failed to fetch quests");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(quest: Quest) {
    setEditingQuest(quest);
    setFormData({
      ...quest,
      requirements: typeof quest.requirements === "string" 
        ? JSON.parse(quest.requirements as unknown as string) 
        : quest.requirements,
    });
  }

  function handleNew() {
    setEditingQuest(null);
    setFormData({
      quest_id: "",
      category: "personal",
      title: "",
      description: "",
      requirements: {},
      gblx_cost: 0,
      reward_gblx: 0,
      reward_aura: 0,
      sort_order: quests.length,
      status: "draft",
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const supabase = createBrowserSupabase();
      
      const questData = {
        ...formData,
        requirements: formData.requirements,
      };

      if (editingQuest?.id) {
        // Update existing
        const { error } = await supabase
          .from("quest_definitions")
          .update(questData)
          .eq("id", editingQuest.id);

        if (error) throw error;
        setSuccess("Quest updated successfully");
      } else {
        // Create new
        const { error } = await supabase
          .from("quest_definitions")
          .insert(questData);

        if (error) throw error;
        setSuccess("Quest created successfully");
      }

      setTimeout(() => setSuccess(null), 3000);
      handleNew();
      fetchQuests();
    } catch (err: any) {
      setError(err.message ?? "Failed to save quest");
      setTimeout(() => setError(null), 3000);
    }
  }

  async function handleDelete(questId: number) {
    if (!confirm("Delete this quest?")) return;

    try {
      const supabase = createBrowserSupabase();
      
      const { error } = await supabase
        .from("quest_definitions")
        .delete()
        .eq("id", questId);

      if (error) throw error;

      setSuccess("Quest deleted");
      setTimeout(() => setSuccess(null), 3000);
      fetchQuests();
    } catch (err: any) {
      setError(err.message ?? "Failed to delete quest");
      setTimeout(() => setError(null), 3000);
    }
  }

  function handleRequirementsChange(value: string) {
    try {
      const parsed = JSON.parse(value);
      setFormData({ ...formData, requirements: parsed });
    } catch {
      // Invalid JSON, ignore
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a12]">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: ACCENT }} />
          <p className="text-[#8c8c9c]">Loading quests...</p>
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
          <h1 className="text-xl font-bold">Quest Management</h1>
        </div>
        <div className="text-sm text-[#8c8c9c]">
          {quests.length} quests
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
        {/* Create/Edit Form */}
        <section className="mb-8 rounded-xl border border-[#1f2937] bg-[#111827] p-6">
          <h2 className="mb-4 text-lg font-bold">
            {editingQuest ? "Edit Quest" : "Create / Edit Quest"}
          </h2>
          <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-[#8c8c9c]">Quest ID (slug, e.g. connect_email)</label>
              <input
                type="text"
                value={formData.quest_id}
                onChange={(e) => setFormData({ ...formData, quest_id: e.target.value })}
                placeholder="quest_id"
                required
                className="w-full rounded-lg border border-[#374151] bg-[#0b1220] px-4 py-2.5 text-white focus:border-[#e040c0] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as "personal" | "global" })}
                className="w-full rounded-lg border border-[#374151] bg-[#0b1220] px-4 py-2.5 text-white focus:border-[#e040c0] focus:outline-none"
              >
                <option value="personal">personal</option>
                <option value="global">global</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "draft" | "live" })}
                className="w-full rounded-lg border border-[#374151] bg-[#0b1220] px-4 py-2.5 text-white focus:border-[#e040c0] focus:outline-none"
              >
                <option value="draft">draft</option>
                <option value="live">live</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-[#8c8c9c]">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Title"
                required
                className="w-full rounded-lg border border-[#374151] bg-[#0b1220] px-4 py-2.5 text-white focus:border-[#e040c0] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-[#8c8c9c]">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description"
                rows={3}
                className="w-full rounded-lg border border-[#374151] bg-[#0b1220] px-4 py-2.5 text-white focus:border-[#e040c0] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-[#8c8c9c]">Requirements (JSON, e.g. {"{connections:[\"email\"]}"})</label>
              <textarea
                value={JSON.stringify(formData.requirements, null, 2)}
                onChange={(e) => handleRequirementsChange(e.target.value)}
                placeholder='{"check_in":true}'
                rows={3}
                className="w-full rounded-lg border border-[#374151] bg-[#0b1220] px-4 py-2.5 font-mono text-sm text-white focus:border-[#e040c0] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">GBLX Cost</label>
              <input
                type="number"
                min="0"
                value={formData.gblx_cost}
                onChange={(e) => setFormData({ ...formData, gblx_cost: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-[#374151] bg-[#0b1220] px-4 py-2.5 text-white focus:border-[#e040c0] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Reward GBLX</label>
              <input
                type="number"
                min="0"
                value={formData.reward_gblx}
                onChange={(e) => setFormData({ ...formData, reward_gblx: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-[#374151] bg-[#0b1220] px-4 py-2.5 text-white focus:border-[#e040c0] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Reward Aura</label>
              <input
                type="number"
                min="0"
                value={formData.reward_aura}
                onChange={(e) => setFormData({ ...formData, reward_aura: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-[#374151] bg-[#0b1220] px-4 py-2.5 text-white focus:border-[#e040c0] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Sort Order</label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-[#374151] bg-[#0b1220] px-4 py-2.5 text-white focus:border-[#e040c0] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 mt-2 flex gap-3">
              <button
                type="submit"
                className="rounded-lg px-6 py-2.5 font-medium"
                style={{ backgroundColor: ACCENT }}
              >
                {editingQuest ? "Update" : "Create"} Quest
              </button>
              {editingQuest && (
                <button
                  type="button"
                  onClick={handleNew}
                  className="rounded-lg border border-[#374151] bg-[#111827] px-6 py-2.5 hover:bg-[#1f2937]"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Quests List */}
        <section className="rounded-xl border border-[#1f2937] bg-[#111827] p-6">
          <h2 className="mb-4 text-lg font-bold">Quests List</h2>
          <div className="space-y-3">
            {quests.map((quest) => (
              <div
                key={quest.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-[#1f2937] p-4"
              >
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-bold">{quest.quest_id}</span>
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        quest.status === "live"
                          ? "bg-green-900/30 text-green-400"
                          : "bg-yellow-900/30 text-yellow-400"
                      }`}
                    >
                      {quest.status}
                    </span>
                    <span className="text-xs text-[#8c8c9c]">
                      {quest.category}
                    </span>
                  </div>
                  <p className="text-sm text-[#8c8c9c]">{quest.description}</p>
                  <div className="mt-2 flex gap-4 text-xs text-[#6b7280]">
                    <span>Cost: {quest.gblx_cost} GBLX</span>
                    <span>Reward: {quest.reward_gblx} GBLX + {quest.reward_aura} Aura</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(quest)}
                    className="rounded border border-[#374151] bg-[#111827] px-3 py-1.5 text-xs hover:bg-[#1f2937]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => quest.id && handleDelete(quest.id)}
                    className="rounded border border-red-600/30 bg-red-900/20 px-3 py-1.5 text-xs text-red-400 hover:bg-red-900/40"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {quests.length === 0 && (
              <p className="text-center text-[#8c8c9c]">No quests yet</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
