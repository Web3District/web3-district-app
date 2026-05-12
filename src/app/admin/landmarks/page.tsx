"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const ACCENT = "#ed0584";
const LandmarkPlacer = dynamic(() => import("@/components/admin/LandmarkPlacer"), { ssr: false });

interface Landmark {
  id: number;
  name: string;
  description: string;
  lat: number;
  lng: number;
  grid_x?: number;
  grid_z?: number;
  building_type?: string;
  accent_color?: string;
  image_url?: string;
  loadout?: { crown: string | null; roof: string | null; aura: string | null } | null;
  active: boolean;
  created_at: string;
}

interface ShopItem {
  id: string;
  name: string;
  category: string;
  zone: string | null;
}

export default function AdminLandmarksPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showPlacer, setShowPlacer] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    lat: "",
    lng: "",
    image_url: "",
    grid_x: "",
    grid_z: "",
    building_type: "default",
    accent_color: "#ed0584",
    crown: "",
    roof: "",
    aura: "",
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
    fetchShopItems();
  }

  async function fetchShopItems() {
    try {
      const supabase = createBrowserSupabase();
      const { data, error } = await supabase
        .from("items")
        .select("id, name, category, zone")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setShopItems(data ?? []);
    } catch (err: any) {
      console.error("Failed to fetch shop items:", err);
    }
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

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const supabase = createBrowserSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await fetch("/api/admin/landmarks/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: formDataUpload,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      setFormData({ ...formData, image_url: result.url });
      setSuccess(`Model uploaded: ${file.name}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message ?? "Upload failed");
      setTimeout(() => setError(null), 3000);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    // Validate grid position
    const gridX = parseInt(formData.grid_x) || 0;
    const gridZ = parseInt(formData.grid_z) || 0;

    try {
      // Get auth token
      const supabase = createBrowserSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch("/api/admin/landmarks", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          grid_x: gridX,
          grid_z: gridZ,
          building_type: formData.building_type,
          accent_color: formData.accent_color,
          model_url: formData.image_url || null,
          loadout: {
            crown: formData.crown || null,
            roof: formData.roof || null,
            aura: formData.aura || null,
          },
          active: true,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      setSuccess("Landmark created successfully");
      setTimeout(() => setSuccess(null), 3000);
      setFormData({ 
        name: "", 
        description: "", 
        lat: "", 
        lng: "", 
        image_url: "",
        grid_x: "",
        grid_z: "",
        building_type: "default",
        accent_color: "#ed0584",
      });
      await fetchLandmarks();
    } catch (err: any) {
      setError(err.message ?? "Failed to create landmark");
      setTimeout(() => setError(null), 3000);
    }
  }

  async function handleToggle(id: number, current: boolean) {
    try {
      const supabase = createBrowserSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`/api/admin/landmarks?id=${id}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ id, active: !current }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

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
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`/api/admin/landmarks?id=${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${session?.access_token}`,
        },
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

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
          <h3 className="mb-4 text-lg text-[#ed0584]">Create Landmark</h3>
          
          {/* Visual placement button */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowPlacer(true)}
              className="rounded-none border border-[#6090e0] bg-[#6090e0]/20 px-4 py-2 text-sm text-[#6090e0] hover:bg-[#6090e0]/30"
            >
              🗺️ Select Position on Map
            </button>
            {(formData.grid_x || formData.grid_z) && (
              <span className="ml-4 text-sm text-[#8c8c9c]">
                Selected: Grid({formData.grid_x || 0}, {formData.grid_z || 0})
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
            {/* Grid Position (Visual or Manual) */}
            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Grid X</label>
              <input
                type="number"
                value={formData.grid_x}
                onChange={(e) => setFormData({ ...formData, grid_x: e.target.value })}
                placeholder="0"
                className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#ed0584] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Grid Z</label>
              <input
                type="number"
                value={formData.grid_z}
                onChange={(e) => setFormData({ ...formData, grid_z: e.target.value })}
                placeholder="0"
                className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#ed0584] focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-[#8c8c9c]">Name</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Tower Bridge"
                className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#ed0584] focus:outline-none"
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
                className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#ed0584] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Building Type</label>
              <select
                value={formData.building_type}
                onChange={(e) => setFormData({ ...formData, building_type: e.target.value })}
                className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#ed0584] focus:outline-none"
              >
                <option value="default">Default Tower</option>
                <option value="corporate">Corporate HQ</option>
                <option value="tech_hub">Tech Hub</option>
                <option value="custom">Custom Model</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Accent Color</label>
              <input
                type="color"
                value={formData.accent_color}
                onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                className="w-full h-10 rounded-none border border-[#2a2a30] bg-[#161618] font-pixel text-white focus:border-[#ed0584] focus:outline-none"
              />
            </div>

            {/* Shop Items Customization */}
            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Crown (Optional)</label>
              <select
                value={formData.crown}
                onChange={(e) => setFormData({ ...formData, crown: e.target.value })}
                className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#ed0584] focus:outline-none"
              >
                <option value="">None</option>
                {shopItems.filter(item => item.zone === "crown").map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Roof (Optional)</label>
              <select
                value={formData.roof}
                onChange={(e) => setFormData({ ...formData, roof: e.target.value })}
                className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#ed0584] focus:outline-none"
              >
                <option value="">None</option>
                {shopItems.filter(item => item.zone === "roof").map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Aura (Optional)</label>
              <select
                value={formData.aura}
                onChange={(e) => setFormData({ ...formData, aura: e.target.value })}
                className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#ed0584] focus:outline-none"
              >
                <option value="">None</option>
                {shopItems.filter(item => item.zone === "aura").map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-[#8c8c9c]">Custom Model (GLB)</label>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".glb"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="flex-1 rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#ed0584] focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:bg-[#2a2a30] file:text-white hover:file:bg-[#3a3a40]"
                />
                {uploading && (
                  <span className="text-sm text-[#8c8c9c]">Uploading...</span>
                )}
              </div>
              {formData.image_url && (
                <div className="mt-2 text-xs text-[#8c8c9c]">
                  ✓ Uploaded: {formData.image_url}
                </div>
              )}
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

        {/* Visual placement modal */}
        {showPlacer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="w-full max-w-6xl">
              <LandmarkPlacer
                existingLandmarks={landmarks.map(l => ({ grid_x: l.grid_x ?? 0, grid_z: l.grid_z ?? 0, name: l.name, accent_color: l.accent_color }))}
                onPositionSelect={(gridX, gridZ) => {
                  setFormData({ ...formData, grid_x: String(gridX), grid_z: String(gridZ) });
                  setShowPlacer(false);
                }}
                onCancel={() => setShowPlacer(false)}
              />
            </div>
          </div>
        )}

        <section className="rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6">
          <h3 className="mb-4 text-lg text-[#ed0584]">Landmarks List</h3>
          
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
