"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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
  const [error, setError] = useState<string | null>(null);

  // Form state
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
        const { error } = await supabase
          .from("venues")
          .update(payload)
          .eq("id", parseInt(formData.id, 10));
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("venues")
          .insert(payload);
        if (error) throw error;
      }

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
        <div style={{ opacity: 0.8 }}>Venues</div>
      </header>

      <main style={{ padding: 16 }}>
        {error && (
          <div style={{ marginBottom: 12, padding: "8px 12px", border: "1px solid #ef4444", background: "#ef444420", borderRadius: 8, color: "#ef4444" }}>
            {error}
          </div>
        )}

        <section style={{ border: "1px solid #1f2937", borderRadius: 12, padding: 16, marginBottom: 16, background: "#0b1220" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600 }}>Add / Edit Venue</h3>
          <form id="venueForm" onSubmit={handleSave}>
            <input type="hidden" name="id" value={formData.id} />
            
            <label style={{ display: "block", margin: "6px 0", opacity: 0.9 }}>Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Venue name"
              required
              style={{ width: "100%", maxWidth: 320, padding: 8, margin: "6px 0", borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#fff" }}
            />

            <label style={{ display: "block", margin: "6px 0", opacity: 0.9 }}>Latitude</label>
            <input
              name="lat"
              type="number"
              step="any"
              value={formData.lat}
              onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
              placeholder="Lat"
              style={{ width: "100%", maxWidth: 320, padding: 8, margin: "6px 0", borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#fff" }}
            />

            <label style={{ display: "block", margin: "6px 0", opacity: 0.9 }}>Longitude</label>
            <input
              name="lng"
              type="number"
              step="any"
              value={formData.lng}
              onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
              placeholder="Lng"
              style={{ width: "100%", maxWidth: 320, padding: 8, margin: "6px 0", borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#fff" }}
            />

            <label style={{ display: "block", margin: "6px 0" }}>
              <input
                type="checkbox"
                name="verified_partner"
                checked={formData.verified_partner}
                onChange={(e) => setFormData({ ...formData, verified_partner: e.target.checked })}
                style={{ marginRight: 8 }}
              />
              Verified partner
            </label>

            <label style={{ display: "block", margin: "6px 0" }}>
              <input
                type="checkbox"
                name="is_event"
                checked={formData.is_event}
                onChange={(e) => setFormData({ ...formData, is_event: e.target.checked })}
                style={{ marginRight: 8 }}
              />
              Is event
            </label>

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
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600 }}>Venues list</h3>
          <div id="venues">
            {venues.length === 0 ? (
              <p style={{ opacity: 0.7 }}>No venues.</p>
            ) : (
              venues.map((v, i) => (
                <div key={v.id ?? i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, border: "1px solid #1f2937", borderRadius: 8, padding: 10, marginBottom: 8 }}>
                  <div>
                    <strong>{escapeHtml(v.name)}</strong>
                    <span style={{ opacity: 0.7, fontSize: 12 }}>
                      {" "}id {v.id} · {v.lat != null ? v.lat : "-"}, {v.lng != null ? v.lng : "-"}
                      {v.verified_partner ? " · verified" : ""}
                      {v.is_event ? " · event" : ""}
                    </span>
                  </div>
                  <button
                    onClick={() => handleEdit(v)}
                    style={{ padding: "4px 8px", border: "1px solid #374151", background: "#111827", color: "#fff", borderRadius: 8, cursor: "pointer", fontSize: 12 }}
                  >
                    Edit
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
