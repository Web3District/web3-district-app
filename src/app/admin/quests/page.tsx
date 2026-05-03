"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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
  created_at?: string;
}

export default function AdminQuestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Form state
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
        const { error } = await supabase
          .from("quest_definitions")
          .update(payload)
          .eq("id", parseInt(formData.id, 10));
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("quest_definitions")
          .insert(payload);
        if (error) throw error;
      }

      handleNew();
      await fetchQuests();
    } catch (err: any) {
      setError(err.message ?? "Failed to save quest");
      setTimeout(() => setError(null), 3000);
    }
  }

  async function handleApprove(id?: number, questId?: string) {
    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase
        .from("quest_definitions")
        .update({ status: "live" })
        .eq("id", id ?? 0);
      if (error) throw error;
      await fetchQuests();
    } catch (err: any) {
      setError(err.message ?? "Failed to approve quest");
      setTimeout(() => setError(null), 3000);
    }
  }

  async function handleDelete(id?: number, questId?: string) {
    if (!confirm("Delete this quest?")) return;

    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase
        .from("quest_definitions")
        .delete()
        .eq("id", id ?? 0);
      if (error) throw error;
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
      <div style={{ fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,Arial", background: "#0f172a", color: "#fff", margin: 0, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#8c8c9c" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,Arial", background: "#0f172a", color: "#fff", margin: 0 }}>
      <header style={{ display: "flex", gap: 8, alignItems: "center", padding: "12px", borderBottom: "1px solid #1f2937" }}>
        <button
          onClick={() => router.push("/admin/panel")}
          style={{ padding: "6px 10px", border: "1px solid #374151", background: "#111827", color: "#fff", borderRadius: 8, cursor: "pointer" }}
        >
          ← Back
        </button>
        <button
          onClick={() => router.push("/admin/dashboard")}
          style={{ padding: "6px 10px", border: "1px solid #374151", background: "#111827", color: "#fff", borderRadius: 8, cursor: "pointer" }}
        >
          Dashboard
        </button>
        <div style={{ opacity: 0.8 }}>Quests (quest_definitions)</div>
      </header>

      <main style={{ padding: 16 }}>
        {error && (
          <div style={{ marginBottom: 12, padding: "8px 12px", border: "1px solid #ef4444", background: "#ef444420", borderRadius: 8, color: "#ef4444" }}>
            {error}
          </div>
        )}

        <section style={{ border: "1px solid #1f2937", borderRadius: 12, padding: 16, marginBottom: 16, background: "#0b1220" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600 }}>Create / Edit Quest</h3>
          <form id="questForm" onSubmit={handleSave}>
            <input type="hidden" name="id" value={formData.id} />
            
            <label style={{ display: "block", marginTop: 8, opacity: 0.9 }}>Quest ID (slug, e.g. connect_email)</label>
            <input
              name="quest_id"
              value={formData.quest_id}
              onChange={(e) => setFormData({ ...formData, quest_id: e.target.value })}
              placeholder="quest_id"
              required
              style={{ width: "100%", maxWidth: 400, padding: 8, margin: "6px 0", borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#fff" }}
            />

            <label style={{ display: "block", marginTop: 8, opacity: 0.9 }}>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as "personal" | "global" })}
              style={{ width: "100%", maxWidth: 400, padding: 8, margin: "6px 0", borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#fff" }}
            >
              <option value="personal">personal</option>
              <option value="global">global</option>
            </select>

            <label style={{ display: "block", marginTop: 8, opacity: 0.9 }}>Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Title"
              required
              style={{ width: "100%", maxWidth: 400, padding: 8, margin: "6px 0", borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#fff" }}
            />

            <label style={{ display: "block", marginTop: 8, opacity: 0.9 }}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description"
              rows={3}
              style={{ width: "100%", maxWidth: 400, padding: 8, margin: "6px 0", borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#fff" }}
            />

            <label style={{ display: "block", marginTop: 8, opacity: 0.9 }}>Requirements (JSON, e.g. {"{connections:[\"email\"]}"} or {"{check_in:true}"})</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder='{"connections":["email"]}'
              rows={2}
              style={{ width: "100%", maxWidth: 400, padding: 8, margin: "6px 0", borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#fff" }}
            />

            <label style={{ display: "block", marginTop: 8, opacity: 0.9 }}>GBLX cost</label>
            <input
              name="gblx_cost"
              type="number"
              min="0"
              value={formData.gblx_cost}
              onChange={(e) => setFormData({ ...formData, gblx_cost: e.target.value })}
              style={{ width: "100%", maxWidth: 400, padding: 8, margin: "6px 0", borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#fff" }}
            />

            <label style={{ display: "block", marginTop: 8, opacity: 0.9 }}>Reward GBLX</label>
            <input
              name="reward_gblx"
              type="number"
              min="0"
              value={formData.reward_gblx}
              onChange={(e) => setFormData({ ...formData, reward_gblx: e.target.value })}
              style={{ width: "100%", maxWidth: 400, padding: 8, margin: "6px 0", borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#fff" }}
            />

            <label style={{ display: "block", marginTop: 8, opacity: 0.9 }}>Reward Aura</label>
            <input
              name="reward_aura"
              type="number"
              min="0"
              value={formData.reward_aura}
              onChange={(e) => setFormData({ ...formData, reward_aura: e.target.value })}
              style={{ width: "100%", maxWidth: 400, padding: 8, margin: "6px 0", borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#fff" }}
            />

            <label style={{ display: "block", marginTop: 8, opacity: 0.9 }}>Sort order</label>
            <input
              name="sort_order"
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
              style={{ width: "100%", maxWidth: 400, padding: 8, margin: "6px 0", borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#fff" }}
            />

            <label style={{ display: "block", marginTop: 8, opacity: 0.9 }}>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as "draft" | "live" })}
              style={{ width: "100%", maxWidth: 400, padding: 8, margin: "6px 0", borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#fff" }}
            >
              <option value="draft">draft</option>
              <option value="live">live</option>
            </select>

            <div style={{ marginTop: 12 }}>
              <button
                type="submit"
                style={{ padding: "6px 10px", border: "1px solid #374151", background: "#111827", color: "#fff", borderRadius: 8, cursor: "pointer" }}
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleNew}
                style={{ marginLeft: 8, padding: "6px 10px", border: "1px solid #374151", background: "#111827", color: "#fff", borderRadius: 8, cursor: "pointer" }}
              >
                New
              </button>
            </div>
          </form>
        </section>

        <section style={{ border: "1px solid #1f2937", borderRadius: 12, padding: 16, marginBottom: 16, background: "#0b1220" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600 }}>Quests list</h3>
          <div id="quests">
            {quests.length === 0 ? (
              <p style={{ opacity: 0.7 }}>No quests.</p>
            ) : (
              quests.map((q, i) => (
                <div key={q.id ?? i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, border: "1px solid #1f2937", borderRadius: 8, padding: 12, marginBottom: 8 }}>
                  <div>
                    <strong>{escapeHtml(q.title || q.quest_id)}</strong>{" "}
                    <span style={{ fontSize: 12, opacity: 0.8 }}>({escapeHtml(q.quest_id)})</span>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      {escapeHtml(q.category)} · cost {q.gblx_cost} GBLX · +{q.reward_gblx} GBLX, +{q.reward_aura} Aura · {q.status}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      {escapeHtml((q.description || "").slice(0, 80))}{(q.description || "").length > 80 ? "…" : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => handleEdit(q)}
                      style={{ padding: "4px 8px", border: "1px solid #374151", background: "#111827", color: "#fff", borderRadius: 8, cursor: "pointer", fontSize: 12 }}
                    >
                      Edit
                    </button>
                    {q.status === "draft" && (
                      <button
                        onClick={() => handleApprove(q.id, q.quest_id)}
                        style={{ padding: "4px 8px", border: "1px solid #374151", background: "#111827", color: "#fff", borderRadius: 8, cursor: "pointer", fontSize: 12 }}
                      >
                        Go live
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(q.id, q.quest_id)}
                      style={{ padding: "4px 8px", border: "1px solid #374151", background: "#111827", color: "#fff", borderRadius: 8, cursor: "pointer", fontSize: 12 }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
