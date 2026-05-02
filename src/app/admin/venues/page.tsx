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
  created_at?: string;
}

export default function AdminVenuesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Venue>({
    name: "",
    lat: null,
    lng: null,
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

  function handleEdit(venue: Venue) {
    setEditingVenue(venue);
    setFormData(venue);
  }

  function handleNew() {
    setEditingVenue(null);
    setFormData({
      name: "",
      lat: null,
      lng: null,
      verified_partner: false,
      is_event: false,
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const supabase = createBrowserSupabase();
      
      const venueData = {
        name: formData.name,
        lat: formData.lat,
        lng: formData.lng,
        verified_partner: formData.verified_partner,
        is_event: formData.is_event,
      };

      if (editingVenue?.id) {
        // Update existing
        const { error } = await supabase
          .from("venues")
          .update(venueData)
          .eq("id", editingVenue.id);

        if (error) throw error;
        setSuccess("Venue updated successfully");
      } else {
        // Create new
        const { error } = await supabase
          .from("venues")
          .insert(venueData);

        if (error) throw error;
        setSuccess("Venue created successfully");
      }

      setTimeout(() => setSuccess(null), 3000);
      handleNew();
      fetchVenues();
    } catch (err: any) {
      setError(err.message ?? "Failed to save venue");
      setTimeout(() => setError(null), 3000);
    }
  }

  async function handleDelete(venueId: number) {
    if (!confirm("Delete this venue?")) return;

    try {
      const supabase = createBrowserSupabase();
      
      const { error } = await supabase
        .from("venues")
        .delete()
        .eq("id", venueId);

      if (error) throw error;

      setSuccess("Venue deleted");
      setTimeout(() => setSuccess(null), 3000);
      fetchVenues();
    } catch (err: any) {
      setError(err.message ?? "Failed to delete venue");
      setTimeout(() => setError(null), 3000);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a12]">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: ACCENT }} />
          <p className="text-[#8c8c9c]">Loading venues...</p>
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
          <h1 className="text-xl font-bold">Venue Management</h1>
        </div>
        <div className="text-sm text-[#8c8c9c]">
          {venues.length} venues
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
            {editingVenue ? "Edit Venue" : "Add / Edit Venue"}
          </h2>
          <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm text-[#8c8c9c]">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Venue name"
                required
                className="w-full rounded-lg border border-[#374151] bg-[#0b1220] px-4 py-2.5 text-white focus:border-[#e040c0] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.lat ?? ""}
                onChange={(e) => setFormData({ ...formData, lat: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="Lat"
                className="w-full rounded-lg border border-[#374151] bg-[#0b1220] px-4 py-2.5 text-white focus:border-[#e040c0] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.lng ?? ""}
                onChange={(e) => setFormData({ ...formData, lng: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="Lng"
                className="w-full rounded-lg border border-[#374151] bg-[#0b1220] px-4 py-2.5 text-white focus:border-[#e040c0] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="verified_partner"
                checked={formData.verified_partner}
                onChange={(e) => setFormData({ ...formData, verified_partner: e.target.checked })}
                className="h-4 w-4 rounded border-[#374151] bg-[#0b1220] text-[#e040c0] focus:ring-[#e040c0]"
              />
              <label htmlFor="verified_partner" className="text-sm text-[#8c8c9c]">
                Verified partner
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_event"
                checked={formData.is_event}
                onChange={(e) => setFormData({ ...formData, is_event: e.target.checked })}
                className="h-4 w-4 rounded border-[#374151] bg-[#0b1220] text-[#e040c0] focus:ring-[#e040c0]"
              />
              <label htmlFor="is_event" className="text-sm text-[#8c8c9c]">
                Is event
              </label>
            </div>

            <div className="sm:col-span-2 mt-2 flex gap-3">
              <button
                type="submit"
                className="rounded-lg px-6 py-2.5 font-medium"
                style={{ backgroundColor: ACCENT }}
              >
                {editingVenue ? "Update" : "Save"} Venue
              </button>
              {editingVenue && (
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

        {/* Venues List */}
        <section className="rounded-xl border border-[#1f2937] bg-[#111827] p-6">
          <h2 className="mb-4 text-lg font-bold">Venues List</h2>
          <div className="space-y-3">
            {venues.map((venue) => (
              <div
                key={venue.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#1f2937] p-4"
              >
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-bold">{venue.name}</span>
                    {venue.verified_partner && (
                      <span className="rounded bg-green-900/30 px-2 py-0.5 text-xs text-green-400">
                        ✓ Verified
                      </span>
                    )}
                    {venue.is_event && (
                      <span className="rounded bg-blue-900/30 px-2 py-0.5 text-xs text-blue-400">
                        📅 Event
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#8c8c9c]">
                    {venue.lat != null && venue.lng != null ? (
                      <span>📍 {venue.lat.toFixed(6)}, {venue.lng.toFixed(6)}</span>
                    ) : (
                      <span>No coordinates</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(venue)}
                    className="rounded border border-[#374151] bg-[#111827] px-3 py-1.5 text-xs hover:bg-[#1f2937]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => venue.id && handleDelete(venue.id)}
                    className="rounded border border-red-600/30 bg-red-900/20 px-3 py-1.5 text-xs text-red-400 hover:bg-red-900/40"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {venues.length === 0 && (
              <p className="text-center text-[#8c8c9c]">No venues yet</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
