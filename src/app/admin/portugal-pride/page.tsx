"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const ACCENT = "#FF007F"; // Portugal Pride pink

interface Report {
  id: number;
  report_id: string;
  organization_name: string;
  description: string;
  status: string;
  risk_level: number | null;
  anonymity_preference: string;
  created_at: string;
  contact_value: string | null;
}

interface Stats {
  total_reports: number;
  pending_review: number;
  organizations_contacted: number;
  resolved: number;
  high_risk: number;
  anonymous_reports: number;
  unique_organizations: number;
}

export default function PortugalPrideDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "high-risk">("all");

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const supabase = createBrowserSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/admin/login");
        return;
      }

      const githubLogin = session.user.user_metadata?.user_name ?? 
                          session.user.user_metadata?.full_name ?? 
                          session.user.email?.split("@")[0] ?? "";
      
      const adminLogins = (process.env.NEXT_PUBLIC_ADMIN_GITHUB_LOGINS ?? "eddiezebra").split(",").map(s => s.trim().toLowerCase());
      
      if (!adminLogins.includes(githubLogin.toLowerCase())) {
        setError("Access denied: Portugal Pride admin access required");
        setLoading(false);
        return;
      }

      await Promise.all([fetchReports(), fetchStats()]);
      setLoading(false);
    } catch (err: any) {
      setError(err.message ?? "Authentication failed");
      setLoading(false);
    }
  }

  async function fetchReports() {
    const supabase = createBrowserSupabase();
    let query = supabase
      .from("pinkwashing_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter === "pending") {
      query = query.eq("status", "received");
    } else if (filter === "high-risk") {
      query = query.gte("risk_level", 3);
    }

    const { data, error } = await query.limit(100);
    if (error) throw error;
    setReports(data ?? []);
  }

  async function fetchStats() {
    const supabase = createBrowserSupabase();
    const { data, error } = await supabase
      .from("dashboard_stats")
      .select("*")
      .single();

    if (error) throw error;
    setStats(data);
  }

  async function updateReportStatus(reportId: string, newStatus: string) {
    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase
        .from("pinkwashing_reports")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("report_id", reportId);

      if (error) throw error;
      
      await fetchReports();
      await fetchStats();
    } catch (err: any) {
      alert("Error updating status: " + err.message);
    }
  }

  async function exportReports() {
    try {
      const supabase = createBrowserSupabase();
      const { data, error } = await supabase
        .from("pinkwashing_reports")
        .select("*");

      if (error) throw error;

      // Convert to CSV
      const csv = convertToCSV(data);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pinkwashing-reports-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    } catch (err: any) {
      alert("Error exporting: " + err.message);
    }
  }

  function convertToCSV(data: any[]) {
    const headers = ["Report ID", "Organization", "Status", "Risk Level", "Created At", "Anonymous"];
    const rows = data.map(r => [
      r.report_id,
      r.organization_name,
      r.status,
      r.risk_level ?? "N/A",
      new Date(r.created_at).toLocaleDateString(),
      r.anonymity_preference === "yes" ? "Yes" : "No"
    ]);
    
    return [headers, ...rows].map(row => row.join(",")).join("\n");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a24] font-pixel text-[#FF007F]">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a24] font-pixel text-white">
      {/* Header */}
      <header className="border-b-4 border-[#FF007F] bg-[#0d0d0f] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl text-[#FF007F]">🏳️‍🌈 Portugal Pride Observatory</h1>
            <p className="text-xs text-[#8c8c9c]">Pinkwashing Reports Dashboard</p>
          </div>
          <button
            onClick={exportReports}
            className="rounded-none border-2 border-[#FF007F] bg-[#FF007F]/20 px-4 py-2 text-sm hover:bg-[#FF007F]/30"
          >
            📥 Export CSV
          </button>
        </div>
      </header>

      <main className="p-6">
        {error && (
          <div className="mb-4 rounded-none border border-red-600 bg-red-900/20 px-4 py-3 text-red-400">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-none border-4 border-[#2a2a30] bg-[#101018] p-4 text-center">
              <div className="text-3xl">📊</div>
              <div className="mt-2 text-2xl font-bold text-white">{stats.total_reports}</div>
              <div className="text-xs text-[#8c8c9c]">Total Reports</div>
            </div>
            <div className="rounded-none border-4 border-[#2a2a30] bg-[#101018] p-4 text-center">
              <div className="text-3xl">⏳</div>
              <div className="mt-2 text-2xl font-bold text-[#FF007F]">{stats.pending_review}</div>
              <div className="text-xs text-[#8c8c9c]">Pending Review</div>
            </div>
            <div className="rounded-none border-4 border-[#2a2a30] bg-[#101018] p-4 text-center">
              <div className="text-3xl">⚠️</div>
              <div className="mt-2 text-2xl font-bold text-red-400">{stats.high_risk}</div>
              <div className="text-xs text-[#8c8c9c]">High Risk</div>
            </div>
            <div className="rounded-none border-4 border-[#2a2a30] bg-[#101018] p-4 text-center">
              <div className="text-3xl">✅</div>
              <div className="mt-2 text-2xl font-bold text-green-400">{stats.resolved}</div>
              <div className="text-xs text-[#8c8c9c]">Resolved</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => { setFilter("all"); fetchReports(); }}
            className={`rounded-none border px-4 py-2 text-sm ${
              filter === "all"
                ? "border-[#FF007F] bg-[#FF007F]/20 text-[#FF007F]"
                : "border-[#2a2a30] bg-[#161618] text-[#8c8c9c]"
            }`}
          >
            All Reports
          </button>
          <button
            onClick={() => { setFilter("pending"); fetchReports(); }}
            className={`rounded-none border px-4 py-2 text-sm ${
              filter === "pending"
                ? "border-[#FF007F] bg-[#FF007F]/20 text-[#FF007F]"
                : "border-[#2a2a30] bg-[#161618] text-[#8c8c9c]"
            }`}
          >
            Pending Review
          </button>
          <button
            onClick={() => { setFilter("high-risk"); fetchReports(); }}
            className={`rounded-none border px-4 py-2 text-sm ${
              filter === "high-risk"
                ? "border-[#FF007F] bg-[#FF007F]/20 text-[#FF007F]"
                : "border-[#2a2a30] bg-[#161618] text-[#8c8c9c]"
            }`}
          >
            High Risk
          </button>
        </div>

        {/* Reports Table */}
        <section className="rounded-none border-4 border-[#2a2a30] bg-[#101018] p-6">
          <h3 className="mb-4 text-lg text-[#FF007F]">📋 Recent Reports</h3>
          
          {reports.length === 0 ? (
            <p className="text-[#8c8c9c]">No reports yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-[#2a2a30]">
                    <th className="px-3 py-2 text-left text-[#8c8c9c]">Report ID</th>
                    <th className="px-3 py-2 text-left text-[#8c8c9c]">Organization</th>
                    <th className="px-3 py-2 text-left text-[#8c8c9c]">Risk</th>
                    <th className="px-3 py-2 text-left text-[#8c8c9c]">Status</th>
                    <th className="px-3 py-2 text-left text-[#8c8c9c]">Anonymous</th>
                    <th className="px-3 py-2 text-left text-[#8c8c9c]">Date</th>
                    <th className="px-3 py-2 text-left text-[#8c8c9c]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b border-[#2a2a30]">
                      <td className="px-3 py-3 font-mono text-xs text-[#8c8c9c]">{report.report_id}</td>
                      <td className="px-3 py-3 font-bold text-white">{report.organization_name}</td>
                      <td className="px-3 py-3">
                        {report.risk_level === null && <span className="text-[#8c8c9c]">Not rated</span>}
                        {report.risk_level === 0 && <span className="text-green-400">0 - None</span>}
                        {report.risk_level === 1 && <span className="text-blue-400">1 - Low</span>}
                        {report.risk_level === 2 && <span className="text-yellow-400">2 - Moderate</span>}
                        {report.risk_level === 3 && <span className="text-orange-400">3 - High</span>}
                        {report.risk_level === 4 && <span className="text-red-400 font-bold">4 - Critical</span>}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`rounded px-2 py-1 text-xs ${
                          report.status === "received" ? "bg-blue-900/50 text-blue-400" :
                          report.status === "analyzing" ? "bg-purple-900/50 text-purple-400" :
                          report.status === "human_review" ? "bg-yellow-900/50 text-yellow-400" :
                          report.status === "contact_sent" ? "bg-orange-900/50 text-orange-400" :
                          report.status === "resolved" ? "bg-green-900/50 text-green-400" :
                          "bg-gray-900/50 text-gray-400"
                        }`}>
                          {report.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {report.anonymity_preference === "yes" ? (
                          <span className="text-[#FF007F]">🔒 Yes</span>
                        ) : (
                          <span className="text-[#8c8c9c]">No</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs text-[#8c8c9c]">
                        {new Date(report.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-3">
                        <select
                          value={report.status}
                          onChange={(e) => updateReportStatus(report.report_id, e.target.value)}
                          className="rounded-none border border-[#2a2a30] bg-[#161618] px-2 py-1 text-xs"
                        >
                          <option value="received">Received</option>
                          <option value="analyzing">Analyzing</option>
                          <option value="human_review">Human Review</option>
                          <option value="contact_sent">Contact Sent</option>
                          <option value="resolved">Resolved</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
