"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import Link from "next/link";

interface DeveloperWithWallet {
  id: number;
  github_login: string;
  name: string | null;
  avatar_url: string | null;
  bloxid_wallet: string;
  claimed_at: string | null;
  xp_total: number;
  rank: number | null;
}

export default function BloxIDAdminPage() {
  const [wallets, setWallets] = useState<DeveloperWithWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    withWallet: 0,
    percentage: 0,
  });

  useEffect(() => {
    fetchWallets();
  }, []);

  async function fetchWallets() {
    const supabase = createBrowserSupabase();
    if (!supabase) return;

    try {
      // Fetch all developers with wallets
      const { data, error } = await supabase
        .from("developers")
        .select("id, github_login, name, avatar_url, bloxid_wallet, claimed_at, xp_total, rank")
        .not("bloxid_wallet", "is", null)
        .order("claimed_at", { ascending: false });

      if (error) throw error;

      setWallets(data || []);

      // Fetch stats
      const { data: allDevs } = await supabase
        .from("developers")
        .select("id, bloxid_wallet", { count: "exact", head: true });

      const { data: devsNoWallet } = await supabase
        .from("developers")
        .select("id", { count: "exact", head: true })
        .is("bloxid_wallet", null);

      setStats({
        total: allDevs?.length || 0,
        withWallet: data?.length || 0,
        percentage: allDevs && allDevs.length > 0
          ? Math.round(((data?.length || 0) / allDevs.length) * 100)
          : 0,
      });
    } catch (err) {
      console.error("Failed to fetch BloxID wallets:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg font-pixel uppercase text-warm p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-block text-sm text-muted transition-colors hover:text-cream mb-4"
          >
            ← Back to Admin
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-cream">
            🐝 BloxID Wallet Management
          </h1>
          <p className="text-sm text-muted mt-1 normal-case">
            Track and manage developer BloxID wallets
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="border-[3px] border-border bg-bg-raised p-4">
            <div className="text-3xl font-bold text-[#627EEA]">{stats.total}</div>
            <div className="text-xs text-muted mt-1">Total Developers</div>
          </div>
          <div className="border-[3px] border-border bg-bg-raised p-4">
            <div className="text-3xl font-bold text-[#627EEA]">{stats.withWallet}</div>
            <div className="text-xs text-muted mt-1">With BloxID Wallet</div>
          </div>
          <div className="border-[3px] border-border bg-bg-raised p-4">
            <div className="text-3xl font-bold text-[#627EEA]">{stats.percentage}%</div>
            <div className="text-xs text-muted mt-1">Adoption Rate</div>
          </div>
        </div>

        {/* Wallets Table */}
        <div className="border-[3px] border-border bg-bg-raised overflow-hidden">
          <div className="border-b-[3px] border-border px-4 py-3 bg-bg/50">
            <h2 className="text-sm font-bold text-cream">Developer Wallets</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-muted">Loading...</div>
          ) : wallets.length === 0 ? (
            <div className="p-8 text-center text-muted">
              No wallets created yet. Users will get wallets automatically on login.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-bg/50 text-muted">
                  <tr>
                    <th className="text-left px-4 py-2">Developer</th>
                    <th className="text-left px-4 py-2">BloxID Wallet</th>
                    <th className="text-left px-4 py-2">Rank</th>
                    <th className="text-left px-4 py-2">XP Total</th>
                    <th className="text-left px-4 py-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {wallets.map((dev) => (
                    <tr
                      key={dev.id}
                      className="border-t border-border hover:bg-bg/30"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {dev.avatar_url && (
                            <img
                              src={dev.avatar_url}
                              alt={dev.github_login}
                              className="w-6 h-6 rounded"
                              style={{ imageRendering: "pixelated" }}
                            />
                          )}
                          <div>
                            <div className="font-bold text-cream">
                              {dev.name || dev.github_login}
                            </div>
                            <div className="text-muted text-[10px]">
                              @{dev.github_login}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block px-2 py-1 border"
                          style={{
                            borderColor: "#627EEA",
                            color: "#627EEA",
                          }}
                        >
                          {dev.bloxid_wallet.slice(0, 8)}...
                          {dev.bloxid_wallet.slice(-6)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-cream">
                        #{dev.rank || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-cream">
                        {dev.xp_total?.toLocaleString() || 0}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {dev.claimed_at
                          ? new Date(dev.claimed_at).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={fetchWallets}
            className="btn-press px-4 py-2 text-sm text-bg"
            style={{
              backgroundColor: "#627EEA",
              boxShadow: "3px 3px 0 0 #4030a0",
            }}
          >
            Refresh
          </button>
          <a
            href="https://thirdweb.com/dashboard/prj_cmpdh2jp00medam0lxf7nh0cl"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-press px-4 py-2 text-sm text-bg"
            style={{
              backgroundColor: "#627EEA",
              boxShadow: "3px 3px 0 0 #4030a0",
            }}
          >
            Thirdweb Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
