"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const ACCENT = "#ed0584";

interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  zone: string | null;
  price_usd_cents: number;
  is_active: boolean;
}

interface Developer {
  id: number;
  github_login: string;
  email: string;
}

interface GiftRecord {
  id: number;
  item_id: string;
  developer_id: number;
  created_at: string;
  message: string | null;
  items: { name: string };
  developers: { username: string };
}

export default function AdminGiftPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [gifts, setGifts] = useState<GiftRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    recipient_login: "",
    item_id: "",
    message: "",
  });

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

      await Promise.all([
        fetchItems(),
        fetchDevelopers(),
        fetchGifts(),
      ]);
      setLoading(false);
    } catch (err: any) {
      setError(err.message ?? "Authentication failed");
      setLoading(false);
    }
  }

  async function fetchItems() {
    const supabase = createBrowserSupabase();
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    setItems(data ?? []);
  }

  async function fetchDevelopers() {
    const supabase = createBrowserSupabase();
    const { data, error } = await supabase
      .from("developers")
      .select("id, github_login, email")
      .order("github_login");

    if (error) throw error;
    setDevelopers(data ?? []);
  }

  async function fetchGifts() {
    const supabase = createBrowserSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch("/api/admin/gift", {
      headers: {
        "Authorization": `Bearer ${session?.access_token}`,
      },
    });

    const result = await response.json();
    if (response.ok) {
      setGifts(result.gifts ?? []);
    }
  }

  async function handleSendGift(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createBrowserSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch("/api/admin/gift", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          recipient_username: formData.recipient_login,
          item_id: formData.item_id,
          message: formData.message,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error ?? "Failed to send gift");
      }

      setSuccess(`🎁 Gift sent to ${result.recipient.username}! Item: ${result.item.name}`);
      setFormData({ recipient_username: "", item_id: "", message: "" });
      fetchGifts(); // Refresh gift history
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message ?? "Failed to send gift");
      setTimeout(() => setError(null), 5000);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d0f] font-pixel text-[#ed0584]">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0f] font-pixel text-white">
      {/* Header */}
      <header className="border-b-4 border-[#1a1a24] bg-[#101018] px-6 py-4">
        <h1 className="text-lg text-[#ed0584]">🎁 Admin Gift Center</h1>
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

        {/* Send Gift Form */}
        <section className="mb-6 rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6">
          <h3 className="mb-4 text-lg text-[#ed0584]">Send Free Gift</h3>
          
          <form onSubmit={handleSendGift} className="grid gap-4 md:grid-cols-2">
            {/* Recipient */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-[#8c8c9c]">Recipient GitHub Login</label>
              <input
                type="text"
                value={formData.recipient_login}
                onChange={(e) => setFormData({ ...formData, recipient_login: e.target.value })}
                placeholder="eddiezebra"
                className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#ed0584] focus:outline-none"
                list="developers-list"
                required
              />
              <datalist id="developers-list">
                {developers.map(dev => (
                  <option key={dev.id} value={dev.github_login} />
                ))}
              </datalist>
              <p className="mt-1 text-xs text-[#8c8c9c]">Start typing to see suggestions</p>
            </div>

            {/* Item Selection */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-[#8c8c9c]">Shop Item</label>
              <select
                value={formData.item_id}
                onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
                className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#ed0584] focus:outline-none"
                required
              >
                <option value="">Select an item...</option>
                {items.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} - ${item.price_usd_cents / 100} ({item.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-[#8c8c9c]">Gift Message (Optional)</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Congrats on your achievement! 🎉"
                rows={3}
                className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#ed0584] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="rounded-none border bg-[#161618] px-6 py-3 font-pixel text-white hover:bg-[#1c1c20] disabled:opacity-50 md:col-span-2"
              style={{ borderColor: ACCENT }}
            >
              {sending ? "🎁 Sending..." : "🎁 Send Free Gift"}
            </button>
          </form>
        </section>

        {/* Gift History */}
        <section className="rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6">
          <h3 className="mb-4 text-lg text-[#ed0584]">📜 Gift History</h3>
          
          {gifts.length === 0 ? (
            <p className="text-[#8c8c9c]">No gifts sent yet.</p>
          ) : (
            <div className="space-y-2">
              {gifts.map(gift => (
                <div
                  key={gift.id}
                  className="rounded-none border border-[#2a2a30] bg-[#161618] p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[#ed0584]">🎁 {gift.items.name}</div>
                      <div className="text-sm text-[#8c8c9c]">
                        To: <span className="text-white">@{(gift.developers as any)?.username || "Unknown"}</span>
                      </div>
                      {gift.message && (
                        <div className="mt-2 text-xs text-[#8c8c9c] italic">
                          "{gift.message}"
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-[#8c8c9c]">
                      {new Date(gift.created_at).toLocaleDateString()}
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
