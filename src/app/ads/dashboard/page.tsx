"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface AdCampaign {
  id: string;
  package_id: string;
  status: string;
  brand: string | null;
  text: string | null;
  total_impressions: number;
  total_clicks: number;
  start_date: string | null;
  created_at: string;
}

export default function AdsDashboard() {
  const searchParams = useSearchParams();
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if user just completed checkout
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      setSuccess(true);
      // Clear the URL parameter
      window.history.replaceState({}, document.title, "/ads/dashboard");
    }

    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    try {
      const supabase = createClientComponentClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("ad_campaigns")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "active":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "paused":
        return "text-orange-400";
      case "cancelled":
      case "expired":
        return "text-red-400";
      default:
        return "text-cream";
    }
  }

  function getPackageLabel(packageId: string) {
    return packageId === "foundation" ? "Foundation" : "Skyline";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="h-8 w-48 animate-pulse rounded bg-border" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-border" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Success Message */}
        {success && (
          <div className="mb-8 border-2 border-green-400 bg-green-400/10 p-4">
            <p className="text-green-400">
              🎉 Payment successful! Your ad campaign is being activated.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-pixel text-2xl text-cream">Ad Dashboard</h1>
          <p className="mt-1 text-sm text-cream/50">
            Manage your ad campaigns and track performance
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Active Campaigns"
            value={campaigns.filter((c) => c.status === "active").length}
          />
          <StatCard
            label="Total Impressions"
            value={campaigns.reduce((sum, c) => sum + c.total_impressions, 0)}
          />
          <StatCard
            label="Total Clicks"
            value={campaigns.reduce((sum, c) => sum + c.total_clicks, 0)}
          />
          <StatCard
            label="Total Campaigns"
            value={campaigns.length}
          />
        </div>

        {/* Campaigns List */}
        <div>
          <h2 className="mb-4 font-pixel text-lg text-cream">Your Campaigns</h2>
          
          {campaigns.length === 0 ? (
            <div className="border border-border bg-bg-raised p-8 text-center">
              <p className="text-cream/50">No campaigns yet</p>
              <a
                href="/advertise"
                className="mt-4 inline-block border-2 border-lime px-6 py-2 text-xs text-lime transition-colors hover:bg-lime/10"
              >
                Create Your First Ad
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-bg-raised">
                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-cream/50">
                      Package
                    </th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-cream/50">
                      Status
                    </th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-cream/50">
                      Brand
                    </th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-cream/50">
                      Impressions
                    </th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-cream/50">
                      Clicks
                    </th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-cream/50">
                      Started
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr
                      key={campaign.id}
                      className="border-b border-border/50 hover:bg-bg-raised/50"
                    >
                      <td className="px-4 py-3 text-cream">
                        {getPackageLabel(campaign.package_id)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={getStatusColor(campaign.status)}>
                          {campaign.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-cream/70">
                        {campaign.brand || "—"}
                      </td>
                      <td className="px-4 py-3 text-cream/70">
                        {campaign.total_impressions.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-cream/70">
                        {campaign.total_clicks.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-cream/50">
                        {campaign.start_date
                          ? new Date(campaign.start_date).toLocaleDateString()
                          : "Pending"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border bg-bg-raised p-4">
      <p className="text-xs uppercase tracking-wider text-cream/50">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-cream">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
