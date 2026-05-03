"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const ACCENT = "#e040c0";

interface Venue {
  id?: number;
  name: string;
  lat: number | null;
  lng: number | null;
  verified_partner: boolean;
  is_event: boolean;
}

export default function AdminVenuesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    lat: "",
    lng: "",
    verified_partner: false,
    is_event: false,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const supabase = createBrowserSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push("/admin/login?next=/admin/venues");
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

    fetchVenues();
  }

  async function fetchVenues() {
    try {
      const supabase = createBrowserSupabase();
      
      const { data, error: venuesError } = await supabase
        .from("venues")
        .select("*")
        .order("name", { ascending: true });

      if (venuesError) throw venuesError;

      setVenues(data ?? []);
    } catch (err: any) {
      setError(err.message ?? "Failed to fetch venues");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(v: Venue) {
    setFormData({
      id: v.id?.toString() ?? "",
      name: v.name || "",
      lat: v.lat != null ? v.lat.toString() : "",
      lng: v.lng != null ? v.lng.toString() : "",
      verified_partner: !!v.verified_partner,
      is_event: !!v.is_event,
    });
  }

  function handleNew() {
    setFormData({
      id: "",
      name: "",
      lat: "",
      lng: "",
      verified_partner: false,
      is_event: false,
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    try {
      const supabase = createBrowserSupabase();
      
      const payload = {
        name: formData.name,
        lat: formData.lat ? parseFloat(formData.lat) : null,
        lng: formData.lng ? parseFloat(formData.lng) : null,
        verified_partner: formData.verified_partner,
        is_event: formData.is_event,
      };

      if (formData.id) {
        const { error } = await supabase.from("venues").update(payload).eq("id", parseInt(formData.id, 10));
        if (error) throw error;
      } else {
        const { error } = await supabase.from("venues").insert(payload);
        if (error) throw error;
      }

      setSuccess("Venue saved successfully");
      setTimeout(() => setSuccess(null), 3000);
      handleNew();
      await fetchVenues();
    } catch (err: any) {
      setError(err.message ?? "Failed to save venue");
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
        <h1 className="text-lg">Venues</h1>
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
          <h3 className="mb-4 text-lg text-[#e040c0]">Add / Edit Venue</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Name</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Venue name"
                className="w-full max-w-md rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm text-[#8c8c9c]">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                  placeholder="38.7223"
                  className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-[#8c8c9c]">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                  placeholder="-9.1393"
                  className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.verified_partner}
                  onChange={(e) => setFormData({ ...formData, verified_partner: e.target.checked })}
                  className="rounded-none border-[#2a2a30] bg-[#161618]"
                />
                <span className="text-sm">Verified partner</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_event}
                  onChange={(e) => setFormData({ ...formData, is_event: e.target.checked })}
                  className="rounded-none border-[#2a2a30] bg-[#161618]"
                />
                <span className="text-sm">Is event</span>
              </label>
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
          <h3 className="mb-4 text-lg text-[#e040c0]">Venues list</h3>
          
          {venues.length === 0 ? (
            <p className="text-[#8c8c9c]">No venues.</p>
          ) : (
            <div className="space-y-2">
              {venues.map((v) => (
                <div key={v.id} className="rounded-none border-2 border-[#2a2a38] bg-[#1a1a24] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold">{escapeHtml(v.name)}</div>
                      <div className="text-xs text-[#8c8c9c]">
                        id {v.id} · {v.lat != null ? v.lat : "-"}, {v.lng != null ? v.lng : "-"}
                        {v.verified_partner && <span className="ml-2 text-green-400">· verified</span>}
                        {v.is_event && <span className="ml-2 text-[#e040c0]">· event</span>}
                      </div>
                    </div>
                    <button onClick={() => handleEdit(v)} className="rounded-none border border-[#2a2a30] bg-[#161618] px-3 py-1 text-xs hover:bg-[#1c1c20]">
                      Edit
                    </button>
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
