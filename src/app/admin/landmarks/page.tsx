"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const ACCENT = "#e040c0";

interface Landmark {
  id: number;
  name: string;
  description: string;
  lat: number;
  lng: number;
  image_url?: string;
  active: boolean;
  created_at: string;
}

export default function AdminLandmarksPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    lat: "",
    lng: "",
    image_url: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const supabase = createBrowserSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push("/admin/login?next=/admin/landmarks");
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

    fetchLandmarks();
  }

  async function fetchLandmarks() {
    try {
      const supabase = createBrowserSupabase();
      
      const { data, error: landmarksError } = await supabase
        .from("landmarks")
        .select("*")
        .order("created_at", { ascending: false });

      if (landmarksError) throw landmarksError;

      setLandmarks(data ?? []);
    } catch (err: any) {
      setError(err.message ?? "Failed to fetch landmarks");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    try {
      const supabase = createBrowserSupabase();
      
      const { error } = await supabase.from("landmarks").insert({
        name: formData.name,
        description: formData.description,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        image_url: formData.image_url || null,
        active: true,
      });

      if (error) throw error;

      setSuccess("Landmark created successfully");
      setTimeout(() => setSuccess(null), 3000);
      setFormData({ name: "", description: "", lat: "", lng: "", image_url: "" });
      await fetchLandmarks();
    } catch (err: any) {
      setError(err.message ?? "Failed to create landmark");
      setTimeout(() => setError(null), 3000);
    }
  }

  async function handleToggle(id: number, current: boolean) {
    try {
      const supabase = createBrowserSupabase();
      
      const { error } = await supabase
        .from("landmarks")
        .update({ active: !current })
        .eq("id", id);

      if (error) throw error;

      await fetchLandmarks();
    } catch (err: any) {
      setError(err.message ?? "Failed to update landmark");
      setTimeout(() => setError(null), 3000);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this landmark?")) return;

    try {
      const supabase = createBrowserSupabase();
      
      const { error } = await supabase.from("landmarks").delete().eq("id", id);

      if (error) throw error;

      await fetchLandmarks();
    } catch (err: any) {
      setError(err.message ?? "Failed to delete landmark");
      setTimeout(() => setError(null), 3000);
    }
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
          onClick={() => router.push("/admin")}
          className="rounded-none border border-[#2a2a30] bg-[#161618] px-3 py-1.5 text-sm hover:bg-[#1c1c20]"
        >
          ← Back
        </button>
        <h1 className="text-lg">Landmarks</h1>
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
          <h3 className="mb-4 text-lg text-[#e040c0]">Create Landmark</h3>
          <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-[#8c8c9c]">Name</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Tower Bridge"
                className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-[#8c8c9c]">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Famous landmark in London"
                rows={3}
                className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                placeholder="51.5055"
                className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                placeholder="-0.0754"
                className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-[#8c8c9c]">Image URL</label>
              <input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#e040c0] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="rounded-none border border-[#2a2a30] bg-[#161618] px-6 py-2 font-pixel text-white hover:bg-[#1c1c20] md:col-span-2"
              style={{ borderColor: ACCENT }}
            >
              Create Landmark
            </button>
          </form>
        </section>

        <section className="rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6">
          <h3 className="mb-4 text-lg text-[#e040c0]">Landmarks List</h3>
          
          {landmarks.length === 0 ? (
            <p className="text-[#8c8c9c]">No landmarks created.</p>
          ) : (
            <div className="space-y-2">
              {landmarks.map((landmark) => (
                <div key={landmark.id} className="rounded-none border-2 border-[#2a2a38] bg-[#1a1a24] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold">{landmark.name}</div>
                      <div className="text-xs text-[#8c8c9c]">
                        {landmark.lat}, {landmark.lng}
                      </div>
                      {landmark.description && (
                        <div className="mt-1 text-sm text-[#8c8c9c]">{landmark.description}</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggle(landmark.id, landmark.active)}
                        className={`rounded-none border px-3 py-1 text-xs ${
                          landmark.active
                            ? "border-green-600 bg-green-900/20 text-green-400"
                            : "border-[#2a2a30] bg-[#161618] text-[#8c8c9c]"
                        }`}
                      >
                        {landmark.active ? "Active" : "Inactive"}
                      </button>
                      <button
                        onClick={() => handleDelete(landmark.id)}
                        className="rounded-none border border-red-600 bg-red-900/20 px-3 py-1 text-xs text-red-400"
                      >
                        Delete
                      </button>
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
