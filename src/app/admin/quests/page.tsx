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
  requirements: Record<string, unknown> | string;
  gblx_cost: number;
  reward_gblx: number;
  reward_aura: number;
  sort_order: number;
  status: "draft" | "live";
}

export default function AdminQuestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    id: "",
    quest_id: "",
    category: "personal",
    title: "",
    description: "",
    requirements: "{}",
    gblx_cost: "0",
    reward_gblx: "0",
    reward_aura: "0",
    sort_order: "0",
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

  function handleEdit(q: Quest) {
    setFormData({
      id: q.id?.toString() ?? "",
      quest_id: q.quest_id || "",
      category: q.category || "personal",
      title: q.title || "",
      description: q.description || "",
      requirements: typeof q.requirements === "string" ? q.requirements : JSON.stringify(q.requirements, null, 2),
      gblx_cost: (q.gblx_cost ?? 0).toString(),
      reward_gblx: (q.reward_gblx ?? 0).toString(),
      reward_aura: (q.reward_aura ?? 0).toString(),
      sort_order: (q.sort_order ?? 0).toString(),
      status: q.status || "draft",
    });
  }

  function handleNew() {
    setFormData({
      id: "",
      quest_id: "",
      category: "personal",
      title: "",
      description: "",
      requirements: "{}",
      gblx_cost: "0",
      reward_gblx: "0",
      reward_aura: "0",
      sort_order: "0",
      status: "draft",
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    try {
      const supabase = createBrowserSupabase();
      
      let reqObj: Record<string, unknown> = {};
      if (formData.requirements && formData.requirements.trim()) {
        reqObj = JSON.parse(formData.requirements);
      }

      const payload = {
        quest_id: formData.quest_id,
        category: formData.category,
        title: formData.title,
        description: formData.description,
        requirements: reqObj,
        gblx_cost: parseInt(formData.gblx_cost, 10),
        reward_gblx: parseInt(formData.reward_gblx, 10),
        reward_aura: parseInt(formData.reward_aura, 10),
        sort_order: parseInt(formData.sort_order, 10),
        status: formData.status,
      };

      if (formData.id) {
        const { error } = await supabase.from("quest_definitions").update(payload).eq("id", parseInt(formData.id, 10));
        if (error) throw error;
      } else {
        const { error } = await supabase.from("quest_definitions").insert(payload);
        if (error) throw error;
      }

      setSuccess("Quest saved successfully");
      setTimeout(() => setSuccess(null), 3000);
      handleNew();
      await fetchQuests();
    } catch (err: any) {
      setError(err.message ?? "Failed to save quest");
      setTimeout(() => setError(null), 3000);
    }
  }

  async function handleApprove(id?: number) {
    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase.from("quest_definitions").update({ status: "live" }).eq("id", id ?? 0);
      if (error) throw error;
      setSuccess("Quest approved");
      setTimeout(() => setSuccess(null), 3000);
      await fetchQuests();
    } catch (err: any) {
      setError(err.message ?? "Failed to approve quest");
      setTimeout(() => setError(null), 3000);
    }
  }

  async function handleDelete(id?: number) {
    if (!confirm("Delete this quest?")) return;

    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase.from("quest_definitions").delete().eq("id", id ?? 0);
      if (error) throw error;
      setSuccess("Quest deleted");
      setTimeout(() => setSuccess(null), 3000);
      await fetchQuests();
    } catch (err: any) {
      setError(err.message ?? "Failed to delete quest");
      setTimeout(() => setError(null), 3000);
    }
  }

  function escapeHtml(s: string) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
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
        <h1 className="text-lg">Quests</h1>
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
          <h3 className="mb-4 text-lg text-[#e040c0]">Create / Edit Quest</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Quest ID (slug)</label>
              <input
                value={formData.quest_id}
                onChange={(e) => setFormData({ ...formData, quest_id: e.target.value })}
                placeholder="connect_email"
                className="w-full max-w-md rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as "personal" | "global" })}
                className="w-full max-w-md rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
              >
                <option value="personal">personal</option>
                <option value="global">global</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Title</label>
              <input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Connect your email"
                className="w-full max-w-md rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Connect your email to get started"
                rows={3}
                className="w-full max-w-md rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Requirements (JSON)</label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder='{"connections":["email"]}'
                rows={2}
                className="w-full max-w-md rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-sm text-[#8c8c9c]">GBLX cost</label>
                <input
                  type="number"
                  min="0"
                  value={formData.gblx_cost}
                  onChange={(e) => setFormData({ ...formData, gblx_cost: e.target.value })}
                  className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#8c8c9c]">Reward GBLX</label>
                <input
                  type="number"
                  min="0"
                  value={formData.reward_gblx}
                  onChange={(e) => setFormData({ ...formData, reward_gblx: e.target.value })}
                  className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#8c8c9c]">Reward Aura</label>
                <input
                  type="number"
                  min="0"
                  value={formData.reward_aura}
                  onChange={(e) => setFormData({ ...formData, reward_aura: e.target.value })}
                  className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm text-[#8c8c9c]">Sort order</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                  className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#8c8c9c]">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "draft" | "live" })}
                  className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
                >
                  <option value="draft">draft</option>
                  <option value="live">live</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="rounded-none border border-[#2a2a30] bg-[#161618] px-6 py-2 font-pixel text-white hover:bg-[#1c1c20]" style={{ borderColor: ACCENT }}>
                Save
              </button>
              <button type="button" onClick={handleNew} className="rounded-none border border-[#2a2a30] bg-[#161618] px-6 py-2 font-pixel text-white hover:bg-[#1c1c20]">
                New
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6">
          <h3 className="mb-4 text-lg text-[#e040c0]">Quests list</h3>
          
          {quests.length === 0 ? (
            <p className="text-[#8c8c9c]">No quests.</p>
          ) : (
            <div className="space-y-2">
              {quests.map((q) => (
                <div key={q.id} className="rounded-none border-2 border-[#2a2a38] bg-[#1a1a24] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-bold">{escapeHtml(q.title)}</div>
                      <div className="text-xs text-[#8c8c9c]">
                        {q.quest_id} · {q.category} · cost {q.gblx_cost} GBLX · +{q.reward_gblx} GBLX, +{q.reward_aura} Aura · {q.status}
                      </div>
                      <div className="mt-1 text-xs text-[#8c8c9c]">
                        {escapeHtml((q.description || "").slice(0, 100))}{(q.description || "").length > 100 ? "..." : ""}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(q)} className="rounded-none border border-[#2a2a30] bg-[#161618] px-3 py-1 text-xs hover:bg-[#1c1c20]">Edit</button>
                      {q.status === "draft" && (
                        <button onClick={() => handleApprove(q.id)} className="rounded-none border border-green-600 bg-green-900/20 px-3 py-1 text-xs text-green-400 hover:bg-green-900/40">Go live</button>
                      )}
                      <button onClick={() => handleDelete(q.id)} className="rounded-none border border-red-600 bg-red-900/20 px-3 py-1 text-xs text-red-400 hover:bg-red-900/40">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
