"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const ACCENT = "#e040c0";

interface District {
  id: string;
  name: string;
  color: string;
  description: string;
  building_count: number;
  claimed_buildings: number;
}

interface Building {
  id: number;
  github_login: string;
  name: string | null;
  avatar_url: string | null;
  district: string | null;
  home_district: string | null;
  claimed: boolean;
  claimed_by: string | null;
  xp_total: number;
}

const DISTRICT_COLORS: Record<string, string> = {
  ai: "#3b82f6",
  web3: "#8b5cf6",
  growth: "#10b981",
  gaming: "#f59e0b",
  social: "#ec4899",
  devtools: "#06b6d4",
  cloud: "#6366f1",
  downtown: "#e040c0",
};

export default function AdminDistrictsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [districts, setDistricts] = useState<District[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const supabase = createBrowserSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push("/admin/login?next=/admin/districts");
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

    fetchData();
  }

  async function fetchData() {
    try {
      const supabase = createBrowserSupabase();
      
      // Get all buildings
      const { data: devs, error: devsError } = await supabase
        .from("developers")
        .select("id, github_login, name, avatar_url, district, home_district, claimed, claimed_by, xp_total")
        .order("xp_total", { ascending: false });

      if (devsError) throw devsError;

      setBuildings(devs ?? []);

      // Calculate district stats
      const districtStats: Record<string, District> = {
        ai: { id: "ai", name: "AI District", color: DISTRICT_COLORS.ai, description: "Artificial Intelligence & ML", building_count: 0, claimed_buildings: 0 },
        web3: { id: "web3", name: "Web3 District", color: DISTRICT_COLORS.web3, description: "Blockchain & Crypto", building_count: 0, claimed_buildings: 0 },
        growth: { id: "growth", name: "Growth District", color: DISTRICT_COLORS.growth, description: "Startups & Scale-ups", building_count: 0, claimed_buildings: 0 },
        gaming: { id: "gaming", name: "Gaming District", color: DISTRICT_COLORS.gaming, description: "Games & Interactive", building_count: 0, claimed_buildings: 0 },
        social: { id: "social", name: "Social District", color: DISTRICT_COLORS.social, description: "Social & Communication", building_count: 0, claimed_buildings: 0 },
        devtools: { id: "devtools", name: "DevTools District", color: DISTRICT_COLORS.devtools, description: "Developer Tools", building_count: 0, claimed_buildings: 0 },
        cloud: { id: "cloud", name: "Cloud District", color: DISTRICT_COLORS.cloud, description: "Cloud & Infrastructure", building_count: 0, claimed_buildings: 0 },
        downtown: { id: "downtown", name: "Downtown", color: DISTRICT_COLORS.downtown, description: "City Center", building_count: 0, claimed_buildings: 0 },
      };

      devs?.forEach((dev: Building) => {
        const district = dev.district ?? "unclaimed";
        if (districtStats[district]) {
          districtStats[district].building_count++;
          if (dev.claimed) {
            districtStats[district].claimed_buildings++;
          }
        }
      });

      setDistricts(Object.values(districtStats));
    } catch (err: any) {
      setError(err.message ?? "Failed to fetch districts");
    } finally {
      setLoading(false);
    }
  }

  function getBuildingsByDistrict(district: string) {
    return buildings.filter(b => b.district === district);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a12]">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: ACCENT }} />
          <p className="text-[#8c8c9c]">Loading districts...</p>
        </div>
      </div>
    );
  }

  if (error && !districts.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a12]">
        <div className="text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => router.push("/admin/city")}
            className="mt-4 rounded-lg px-4 py-2"
            style={{ backgroundColor: ACCENT }}
          >
            Back to Dashboard
          </button>
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
          <h1 className="text-xl font-bold">District Management</h1>
        </div>
      </header>

      <main className="p-6">
        {/* District Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {districts.map((district) => (
            <button
              key={district.id}
              onClick={() => setSelectedDistrict(selectedDistrict === district.id ? null : district.id)}
              className="rounded-xl border p-4 text-left transition-all hover:scale-[1.02]"
              style={{
                borderColor: district.color + "40",
                backgroundColor: selectedDistrict === district.id ? district.color + "20" : "#111827",
              }}
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-bold">{district.name}</h3>
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: district.color }}
                />
              </div>
              <p className="mb-3 text-xs text-[#8c8c9c]">{district.description}</p>
              <div className="flex gap-4 text-sm">
                <div>
                  <div className="text-[#8c8c9c]">Buildings</div>
                  <div className="font-bold">{district.building_count}</div>
                </div>
                <div>
                  <div className="text-[#8c8c9c]">Claimed</div>
                  <div className="font-bold">{district.claimed_buildings}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Selected District Details */}
        {selectedDistrict && (
          <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {districts.find(d => d.id === selectedDistrict)?.name} Buildings
              </h2>
              <button
                onClick={() => setSelectedDistrict(null)}
                className="text-sm text-[#8c8c9c] hover:text-white"
              >
                ✕ Close
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-[#8c8c9c]">
                  <tr>
                    <th className="pb-3">User</th>
                    <th className="pb-3">XP</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2937]">
                  {getBuildingsByDistrict(selectedDistrict).map((building) => (
                    <tr key={building.id}>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          {building.avatar_url && (
                            <img
                              src={building.avatar_url}
                              alt={building.github_login}
                              className="h-6 w-6 rounded-full"
                            />
                          )}
                          <span>{building.github_login}</span>
                        </div>
                      </td>
                      <td className="py-3 text-[#8c8c9c]">{building.xp_total}</td>
                      <td className="py-3">
                        {building.claimed ? (
                          <span className="text-green-400">Claimed</span>
                        ) : (
                          <span className="text-[#6b7280]">Unclaimed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-red-600/30 bg-red-900/20 px-4 py-3 text-red-400">
            ❌ {error}
          </div>
        )}
      </main>
    </div>
  );
}
