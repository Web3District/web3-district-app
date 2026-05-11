"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

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

// ─── Types ───────────────────────────────────────────────────────────────────

interface InteractionUser {
  login: string;
  country: string | null;
  device: string | null;
  impressions: number;
  clicks: number;
  ctaClicks: number;
  conversions: number;
  firstSeen: string;
  lastSeen: string;
  funnel: string;
  events: Array<{
    type: string;
    time: string;
    clickId?: string;
    conversion?: { event_name: string; revenue_cents: number | null; currency: string } | null;
  }>;
}

interface EventRow {
  id: string;
  ad_id: string;
  event_type: string;
  github_login: string | null;
  country: string | null;
  device: string | null;
  ip_hash: string | null;
  click_id: string | null;
  user_agent: string | null;
  created_at: string;
  conversion: { event_name: string; revenue_cents: number | null; currency: string } | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatRevenue(cents: number | null, currency: string): string {
  if (!cents) return "—";
  return `${currency} ${(cents / 100).toFixed(2)}`;
}

// ─── Funnel Badge ────────────────────────────────────────────────────────────

function FunnelBadge({ funnel }: { funnel: string }) {
  const steps = funnel.split(" → ");
  const colors: Record<string, string> = {
    viewed: "bg-[#2a2a30] text-[#8c8c9c]",
    clicked: "bg-[#1a3a1a] text-[#5a8a00]",
    visited: "bg-[#1a2a3a] text-[#4a8acc]",
    converted: "bg-[#3a1a2a] text-[#ed0584]",
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {steps.map((step, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-[#3a3a40] text-[10px]">→</span>}
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${colors[step] ?? "bg-[#2a2a30] text-[#8c8c9c]"}`}>
            {step}
          </span>
        </span>
      ))}
    </div>
  );
}

// ─── User Detail Modal ──────────────────────────────────────────────────────

function UserDetailModal({ user, onClose }: { user: InteractionUser; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-none border-4 border-[#1a1a24] bg-[#0d0d12] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-start justify-between border-b border-[#2a2a30] pb-4">
          <div>
            <h2 className="text-xl text-[#ed0584] font-pixel">@{user.login}</h2>
            <p className="mt-1 text-xs text-[#8c8c9c]">
              {user.country ? `${COUNTRY_NAMES[user.country] ?? user.country}` : "Unknown location"} · {user.device ?? "unknown device"}
            </p>
            <p className="text-xs text-[#8c8c9c]">
              First seen: {formatDate(user.firstSeen)} {formatTime(user.firstSeen)} · {formatTimeAgo(user.lastSeen)}
            </p>
          </div>
          <button onClick={onClose} className="cursor-pointer rounded-none border border-[#2a2a30] bg-[#161618] px-3 py-1 text-xs text-[#8c8c9c] hover:border-[#ed0584] hover:text-[#ed0584]">
            ✕
          </button>
        </div>

        <div className="mb-6 grid grid-cols-4 gap-3">
          {[
            { icon: "👁️", label: "Impressions", value: user.impressions, color: "text-[#8c8c9c]" },
            { icon: "🖱️", label: "Clicks", value: user.clicks, color: "text-[#5a8a00]" },
            { icon: "🔗", label: "CTA Clicks", value: user.ctaClicks, color: "text-[#4a8acc]" },
            { icon: "💰", label: "Conversions", value: user.conversions, color: "text-[#ed0584]" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-none border-2 border-[#1a1a24] bg-[#101018] p-3 text-center">
              <div className="mb-1 text-xl">{stat.icon}</div>
              <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-[#8c8c9c]">{stat.label}</div>
            </div>
          ))}
        </div>

        <h3 className="mb-3 text-sm font-pixel text-[#e8dcc8]">EVENT TIMELINE</h3>
        <div className="space-y-0">
          {user.events.slice().sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()).map((ev, i) => {
            const icons: Record<string, string> = { impression: "👁️", click: "🖱️", cta_click: "🔗" };
            const eventColors: Record<string, string> = { impression: "border-[#2a2a30]", click: "border-[#5a8a00]", cta_click: "border-[#4a8acc]" };
            return (
              <div key={i} className={`rounded-none border-l-4 ${eventColors[ev.type] ?? "border-[#2a2a30]"} bg-[#101018] px-4 py-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{icons[ev.type] ?? "❓"}</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#e8dcc8]">{ev.type.replace("_", " ")}</span>
                  </div>
                  <span className="font-mono text-xs text-[#8c8c9c]">{formatTime(ev.time)}</span>
                </div>
                {ev.conversion && (
                  <div className="mt-2 rounded-none border border-[#3a1a2a] bg-[#1a0a12] px-3 py-2">
                    <span className="text-xs text-[#ed0584]">Conversion: {ev.conversion.event_name} — {formatRevenue(ev.conversion.revenue_cents, ev.conversion.currency)}</span>
                  </div>
                )}
                {ev.clickId && <div className="mt-1 font-mono text-[10px] text-[#8c8c9c]">click_id: {ev.clickId}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function InteractionsPanel({ adId, brand }: { adId: string; brand: string }) {
  const [view, setView] = useState<"users" | "events">("users");
  const [period, setPeriod] = useState("7d");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<InteractionUser[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [eventsSummary, setEventsSummary] = useState({ uniqueUsers: 0, impressions: 0, clicks: 0, ctaClicks: 0, conversions: 0 });
  const [eventsBreakdown, setEventsBreakdown] = useState({ countries: [] as Array<{ code: string; count: number }>, devices: [] as Array<{ type: string; count: number }> });
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsTotalPages, setEventsTotalPages] = useState(0);
  const [selectedUser, setSelectedUser] = useState<InteractionUser | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ads/${adId}/interactions/users?period=${period}`);
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [adId, period]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ads/${adId}/interactions?period=${period}&page=${eventsPage}&limit=50${search ? `&search=${encodeURIComponent(search)}` : ""}`);
      const data = await res.json();
      setEvents(data.events ?? []);
      setEventsSummary(data.summary);
      setEventsBreakdown(data.breakdown);
      setEventsTotalPages(data.totalPages);
    } catch { /* ignore */ }
    setLoading(false);
  }, [adId, period, eventsPage, search]);

  useEffect(() => { if (view === "users") fetchUsers(); else fetchEvents(); }, [view, period, fetchUsers, fetchEvents]);
  useEffect(() => { if (view === "events") fetchEvents(); }, [eventsPage]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter((u) => u.login.toLowerCase().includes(q) || (u.country && COUNTRY_NAMES[u.country]?.toLowerCase().includes(q)) || u.device?.toLowerCase().includes(q) || u.funnel.toLowerCase().includes(q));
  }, [users, search]);

  return (
    <div className="rounded-none border-4 border-[#1a1a24] bg-[#0d0d12]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2a2a30] px-4 py-3">
        <h2 className="text-sm font-pixel text-[#ed0584]">{brand} — Interactions</h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-none border-2 border-[#2a2a30]">
            <button onClick={() => { setView("users"); setEventsPage(1); }} className={`cursor-pointer px-3 py-1 text-xs font-bold transition-colors ${view === "users" ? "bg-[#ed0584]/20 text-[#ed0584]" : "text-[#8c8c9c] hover:text-[#e8dcc8]"}`}>USERS</button>
            <button onClick={() => { setView("events"); setEventsPage(1); }} className={`cursor-pointer px-3 py-1 text-xs font-bold transition-colors ${view === "events" ? "bg-[#ed0584]/20 text-[#ed0584]" : "text-[#8c8c9c] hover:text-[#e8dcc8]"}`}>EVENTS</button>
          </div>
          <div className="flex rounded-none border-2 border-[#2a2a30]">
            {PERIODS.map((p) => (
              <button key={p.value} onClick={() => { setPeriod(p.value); setEventsPage(1); }} className={`cursor-pointer px-2 py-1 text-xs transition-colors ${period === p.value ? "bg-[#ed0584]/20 text-[#ed0584]" : "text-[#8c8c9c] hover:text-[#e8dcc8]"}`}>{p.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="border-b border-[#1a1a24] px-4 py-2">
        <input type="text" placeholder="Search by username, country, device, or funnel..." value={search} onChange={(e) => { setSearch(e.target.value); setEventsPage(1); }} className="w-full rounded-none border-2 border-[#2a2a30] bg-[#101018] px-4 py-2 text-xs focus:border-[#ed0584] focus:outline-none" />
      </div>

      {loading && <div className="h-0.5 w-full overflow-hidden bg-[#1a1a24]"><div className="h-full w-1/3 bg-[#ed0584]" style={{ animation: "loading-slide 1s ease-in-out infinite" }} /><style>{`@keyframes loading-slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }`}</style></div>}

      {view === "users" && (
        <div className="p-4">
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-none border-2 border-[#1a1a24] bg-[#101018] p-3"><div className="text-2xl font-bold text-[#ed0584]">{users.length}</div><div className="text-[10px] uppercase tracking-wider text-[#8c8c9c]">Unique Users</div></div>
            <div className="rounded-none border-2 border-[#1a1a24] bg-[#101018] p-3"><div className="text-2xl font-bold text-[#5a8a00]">{users.filter((u) => u.clicks > 0).length}</div><div className="text-[10px] uppercase tracking-wider text-[#8c8c9c]">Clicked</div></div>
            <div className="rounded-none border-2 border-[#1a1a24] bg-[#101018] p-3"><div className="text-2xl font-bold text-[#4a8acc]">{users.filter((u) => u.ctaClicks > 0).length}</div><div className="text-[10px] uppercase tracking-wider text-[#8c8c9c]">Visited</div></div>
            <div className="rounded-none border-2 border-[#1a1a24] bg-[#101018] p-3"><div className="text-2xl font-bold text-[#ed0584]">{users.filter((u) => u.conversions > 0).length}</div><div className="text-[10px] uppercase tracking-wider text-[#8c8c9c]">Converted</div></div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#8c8c9c]">No interactions found for this ad in the selected period.</div>
          ) : (
            <div className="overflow-x-auto rounded-none border-2 border-[#1a1a24]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2a30] bg-[#101018]">
                    <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-[#8c8c9c]">User</th>
                    <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-[#8c8c9c]">Location</th>
                    <th className="px-3 py-2 text-center text-[10px] uppercase tracking-wider text-[#8c8c9c]">👁️</th>
                    <th className="px-3 py-2 text-center text-[10px] uppercase tracking-wider text-[#8c8c9c]">🖱️</th>
                    <th className="px-3 py-2 text-center text-[10px] uppercase tracking-wider text-[#8c8c9c]">🔗</th>
                    <th className="px-3 py-2 text-center text-[10px] uppercase tracking-wider text-[#8c8c9c]">💰</th>
                    <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-[#8c8c9c]">Funnel</th>
                    <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-[#8c8c9c]">Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.login} className="cursor-pointer border-b border-[#1a1a24] transition-colors hover:bg-[#16161e]" onClick={() => setSelectedUser(user)}>
                      <td className="px-3 py-2"><span className="text-xs font-bold text-[#ed0584]">@{user.login}</span></td>
                      <td className="px-3 py-2 text-xs text-[#8c8c9c]">{user.country ? `${COUNTRY_NAMES[user.country] ?? user.country}` : "—"}</td>
                      <td className="px-3 py-2 text-center text-xs">{user.impressions || "—"}</td>
                      <td className="px-3 py-2 text-center text-xs text-[#5a8a00]">{user.clicks || "—"}</td>
                      <td className="px-3 py-2 text-center text-xs text-[#4a8acc]">{user.ctaClicks || "—"}</td>
                      <td className="px-3 py-2 text-center text-xs text-[#ed0584]">{user.conversions || "—"}</td>
                      <td className="px-3 py-2"><FunnelBadge funnel={user.funnel} /></td>
                      <td className="px-3 py-2 text-right text-[10px] text-[#8c8c9c]">{formatTimeAgo(user.lastSeen)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {view === "events" && (
        <div className="p-4">
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="rounded-none border-2 border-[#1a1a24] bg-[#101018] p-3"><div className="text-2xl font-bold text-[#e8dcc8]">{eventsSummary.uniqueUsers}</div><div className="text-[10px] uppercase tracking-wider text-[#8c8c9c]">Users</div></div>
            <div className="rounded-none border-2 border-[#1a1a24] bg-[#101018] p-3"><div className="text-2xl font-bold text-[#8c8c9c]">{eventsSummary.impressions.toLocaleString()}</div><div className="text-[10px] uppercase tracking-wider text-[#8c8c9c]">Impressions</div></div>
            <div className="rounded-none border-2 border-[#1a1a24] bg-[#101018] p-3"><div className="text-2xl font-bold text-[#5a8a00]">{eventsSummary.clicks.toLocaleString()}</div><div className="text-[10px] uppercase tracking-wider text-[#8c8c9c]">Clicks</div></div>
            <div className="rounded-none border-2 border-[#1a1a24] bg-[#101018] p-3"><div className="text-2xl font-bold text-[#4a8acc]">{eventsSummary.ctaClicks.toLocaleString()}</div><div className="text-[10px] uppercase tracking-wider text-[#8c8c9c]">CTA Clicks</div></div>
            <div className="rounded-none border-2 border-[#1a1a24] bg-[#101018] p-3"><div className="text-2xl font-bold text-[#ed0584]">{eventsSummary.conversions}</div><div className="text-[10px] uppercase tracking-wider text-[#8c8c9c]">Conversions</div></div>
          </div>

          {eventsBreakdown.countries.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div className="rounded-none border-2 border-[#1a1a24] bg-[#101018] p-3">
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#8c8c9c]">Top Countries</h4>
                {eventsBreakdown.countries.slice(0, 6).map((c) => (
                  <div key={c.code} className="flex items-center justify-between py-1 text-xs"><span>{COUNTRY_NAMES[c.code] ?? c.code}</span><span className="font-bold text-[#ed0584]">{c.count}</span></div>
                ))}
              </div>
              <div className="rounded-none border-2 border-[#1a1a24] bg-[#101018] p-3">
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#8c8c9c]">Devices</h4>
                {eventsBreakdown.devices.map((d) => (
                  <div key={d.type} className="flex items-center justify-between py-1 text-xs"><span className="capitalize">{d.type}</span><span className="font-bold text-[#ed0584]">{d.count}</span></div>
                ))}
              </div>
            </div>
          )}

          {events.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#8c8c9c]">No events found.</div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-none border-2 border-[#1a1a24]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2a30] bg-[#101018]">
                      <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-[#8c8c9c]">Time</th>
                      <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-[#8c8c9c]">Event</th>
                      <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-[#8c8c9c]">User</th>
                      <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-[#8c8c9c]">Country</th>
                      <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-[#8c8c9c]">Device</th>
                      <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-[#8c8c9c]">Conversion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((ev) => {
                      const icons: Record<string, string> = { impression: "👁️", click: "🖱️", cta_click: "🔗" };
                      const colors: Record<string, string> = { impression: "text-[#8c8c9c]", click: "text-[#5a8a00]", cta_click: "text-[#4a8acc]" };
                      return (
                        <tr key={ev.id} className="border-b border-[#1a1a24] transition-colors hover:bg-[#16161e]">
                          <td className="px-3 py-2 font-mono text-[10px] text-[#8c8c9c]">{formatDate(ev.created_at)} {formatTime(ev.created_at)}</td>
                          <td className="px-3 py-2 text-xs"><span className={`font-bold ${colors[ev.event_type] ?? "text-[#e8dcc8]"}`}>{icons[ev.event_type] ?? ""} {ev.event_type.replace("_", " ")}</span></td>
                          <td className="px-3 py-2 text-xs text-[#ed0584]">{ev.github_login ? `@${ev.github_login}` : "—"}</td>
                          <td className="px-3 py-2 text-xs text-[#8c8c9c]">{ev.country ? `${COUNTRY_NAMES[ev.country] ?? ev.country}` : "—"}</td>
                          <td className="px-3 py-2 text-xs text-[#8c8c9c] capitalize">{ev.device ?? "—"}</td>
                          <td className="px-3 py-2 text-xs">{ev.conversion ? <span className="text-[#ed0584]">{ev.conversion.event_name} ({formatRevenue(ev.conversion.revenue_cents, ev.conversion.currency)})</span> : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {eventsTotalPages > 1 && (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-[#8c8c9c]">Page {eventsPage} of {eventsTotalPages}</span>
                  <div className="flex gap-2">
                    <button disabled={eventsPage <= 1} onClick={() => setEventsPage((p) => p - 1)} className="cursor-pointer rounded-none border border-[#2a2a30] bg-[#101018] px-3 py-1 text-xs disabled:opacity-30 hover:border-[#ed0584]">← Prev</button>
                    <button disabled={eventsPage >= eventsTotalPages} onClick={() => setEventsPage((p) => p + 1)} className="cursor-pointer rounded-none border border-[#2a2a30] bg-[#101018] px-3 py-1 text-xs disabled:opacity-30 hover:border-[#ed0584]">Next →</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {selectedUser && <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
}
