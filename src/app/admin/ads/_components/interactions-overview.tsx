"use client";

import { useState, useEffect, useCallback } from "react";

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States", BR: "Brazil", IN: "India", DE: "Germany", GB: "United Kingdom",
  FR: "France", CA: "Canada", AU: "Australia", JP: "Japan", NL: "Netherlands",
  KR: "South Korea", CN: "China", RU: "Russia", ES: "Spain", IT: "Italy",
  SE: "Sweden", PL: "Poland", MX: "Mexico", AR: "Argentina", CO: "Colombia",
  PT: "Portugal", TR: "Turkey", ID: "Indonesia", PH: "Philippines", NG: "Nigeria",
};

const PERIODS = [
  { label: "24h", value: "1d" },
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "All", value: "all" },
] as const;

interface AdInteractionStats {
  id: string;
  brand: string;
  vehicle: string;
  active: boolean;
  impressions: number;
  clicks: number;
  ctaClicks: number;
  uniqueUsers: number;
  usersClicked: number;
  usersVisited: number;
  conversions: number;
  topCountry: string | null;
  topDevice: string | null;
  lastEvent: string | null;
}

function formatTimeAgo(iso: string | null): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function InteractionsOverview({
  ads: _ads,
  onSelectAd,
}: {
  ads: Array<{ id: string; brand: string }>;
  onSelectAd: (ad: { id: string; brand: string }) => void;
}) {
  const [period, setPeriod] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdInteractionStats[]>([]);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ads/interactions-overview?period=${period}`);
      const data = await res.json();
      setStats(data.ads ?? []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = stats.filter((ad) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return ad.brand.toLowerCase().includes(q) || ad.vehicle.toLowerCase().includes(q) ||
      (ad.topCountry && COUNTRY_NAMES[ad.topCountry]?.toLowerCase().includes(q));
  });

  // Global totals
  const totals = {
    ads: stats.length,
    users: stats.reduce((s, a) => s + a.uniqueUsers, 0),
    impressions: stats.reduce((s, a) => s + a.impressions, 0),
    clicks: stats.reduce((s, a) => s + a.clicks, 0),
    ctaClicks: stats.reduce((s, a) => s + a.ctaClicks, 0),
    conversions: stats.reduce((s, a) => s + a.conversions, 0),
  };

  return (
    <div className="rounded-none border-4 border-[#1a1a24] bg-[#0d0d12]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2a2a30] px-4 py-3">
        <div>
          <h2 className="text-sm font-pixel text-[#ed0584]">📊 All Ads — Interactions Overview</h2>
          <p className="mt-1 text-xs text-[#8c8c9c]">Per-ad breakdown of who viewed, clicked, and converted</p>
        </div>
        <div className="flex rounded-none border-2 border-[#2a2a30]">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`cursor-pointer px-2 py-1 text-xs transition-colors ${
                period === p.value ? "bg-[#ed0584]/20 text-[#ed0584]" : "text-[#8c8c9c] hover:text-[#e8dcc8]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-[#1a1a24] px-4 py-2">
        <input
          type="text"
          placeholder="🔍 Search by brand name, vehicle type, or country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-none border-2 border-[#2a2a30] bg-[#101018] px-4 py-2 text-xs focus:border-[#ed0584] focus:outline-none"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="h-0.5 w-full overflow-hidden bg-[#1a1a24]">
          <div className="h-full w-1/3 bg-[#ed0584]" style={{ animation: "loading-slide 1s ease-in-out infinite" }} />
          <style>{`@keyframes loading-slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }`}</style>
        </div>
      )}

      {/* Global Summary */}
      <div className="border-b border-[#1a1a24] px-4 py-4">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {[
            { label: "Ads", value: totals.ads, color: "text-[#e8dcc8]" },
            { label: "Users", value: totals.users, color: "text-[#ed0584]" },
            { label: "Impressions", value: totals.impressions.toLocaleString(), color: "text-[#8c8c9c]" },
            { label: "Clicks", value: totals.clicks.toLocaleString(), color: "text-[#5a8a00]" },
            { label: "CTA Clicks", value: totals.ctaClicks.toLocaleString(), color: "text-[#4a8acc]" },
            { label: "Conversions", value: totals.conversions.toLocaleString(), color: "text-[#ed0584]" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-[#8c8c9c]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ad List */}
      <div className="p-4">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#8c8c9c]">
            No ads with interactions in this period.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-none border-2 border-[#1a1a24]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a30] bg-[#101018]">
                  <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-[#8c8c9c]">Ad</th>
                  <th className="px-3 py-2 text-center text-[10px] uppercase tracking-wider text-[#8c8c9c]">👁️ Views</th>
                  <th className="px-3 py-2 text-center text-[10px] uppercase tracking-wider text-[#8c8c9c]">🖱️ Clicks</th>
                  <th className="px-3 py-2 text-center text-[10px] uppercase tracking-wider text-[#8c8c9c]">🔗 CTA</th>
                  <th className="px-3 py-2 text-center text-[10px] uppercase tracking-wider text-[#8c8c9c]">👥 Users</th>
                  <th className="px-3 py-2 text-center text-[10px] uppercase tracking-wider text-[#8c8c9c]">💰 Conv.</th>
                  <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-[#8c8c9c]">📍 Top</th>
                  <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-[#8c8c9c]">📱 Device</th>
                  <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-[#8c8c9c]">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ad) => (
                  <tr
                    key={ad.id}
                    className="cursor-pointer border-b border-[#1a1a24] transition-colors hover:bg-[#16161e]"
                    onClick={() => onSelectAd(ad)}
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${ad.active ? "bg-[#5a8a00]" : "bg-[#555]"}`} />
                        <span className="text-xs font-bold text-[#ed0584]">{ad.brand}</span>
                        <span className="text-[10px] text-[#8c8c9c] uppercase">{ad.vehicle}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center text-xs text-[#8c8c9c]">{ad.impressions.toLocaleString()}</td>
                    <td className="px-3 py-2 text-center text-xs text-[#5a8a00]">{ad.clicks.toLocaleString()}</td>
                    <td className="px-3 py-2 text-center text-xs text-[#4a8acc]">{ad.ctaClicks.toLocaleString()}</td>
                    <td className="px-3 py-2 text-center text-xs">{ad.uniqueUsers}</td>
                    <td className="px-3 py-2 text-center text-xs text-[#ed0584]">{ad.conversions}</td>
                    <td className="px-3 py-2 text-xs text-[#8c8c9c]">
                      {ad.topCountry ? `${COUNTRY_NAMES[ad.topCountry] ?? ad.topCountry}` : "—"}
                    </td>
                    <td className="px-3 py-2 text-xs text-[#8c8c9c] capitalize">{ad.topDevice ?? "—"}</td>
                    <td className="px-3 py-2 text-right text-[10px] text-[#8c8c9c]">{formatTimeAgo(ad.lastEvent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="border-t border-[#1a1a24] px-4 py-2 text-center text-[10px] text-[#8c8c9c]">
        Click any ad row to see detailed user interactions and event timelines
      </div>
    </div>
  );
}
