"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const ACCENT = "#e040c0";

interface EmailRecord {
  id: number;
  user_id: string;
  email: string;
  verified: boolean;
  created_at: string;
  last_checked?: string;
}

export default function AdminEmailMonitoringPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const supabase = createBrowserSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push("/admin/login?next=/admin/email-monitoring");
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

    fetchEmails();
  }

  async function fetchEmails() {
    try {
      const supabase = createBrowserSupabase();
      
      const { data, error: emailsError } = await supabase
        .from("email_verifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (emailsError) throw emailsError;

      setEmails(data ?? []);
    } catch (err: any) {
      setError(err.message ?? "Failed to fetch emails");
    } finally {
      setLoading(false);
    }
  }

  const filteredEmails = emails.filter(e => 
    search === "" || 
    e.email.toLowerCase().includes(search.toLowerCase())
  );

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
        <h1 className="text-lg">Email Monitoring</h1>
      </header>

      <main className="p-6">
        {error && (
          <div className="mb-4 rounded-none border border-red-600 bg-red-900/20 px-4 py-3 text-red-400">
            {error}
          </div>
        )}

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2.5 font-pixel text-white placeholder-[#6b7280] focus:border-[#e040c0] focus:outline-none"
          />
        </div>

        <div className="rounded-none border-4 border-[#1a1a24] bg-[#101018]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#161618] text-[#8c8c9c]">
              <tr>
                <th className="px-4 py-3 font-pixel">Email</th>
                <th className="px-4 py-3 font-pixel">Verified</th>
                <th className="px-4 py-3 font-pixel">Created</th>
                <th className="px-4 py-3 font-pixel">Last Checked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a30]">
              {filteredEmails.map((email) => (
                <tr key={email.id} className="hover:bg-[#161618]/50">
                  <td className="px-4 py-3">{email.email}</td>
                  <td className="px-4 py-3">
                    {email.verified ? (
                      <span className="text-green-400">Yes</span>
                    ) : (
                      <span className="text-[#8c8c9c]">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#8c8c9c]">
                    {new Date(email.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-[#8c8c9c]">
                    {email.last_checked ? new Date(email.last_checked).toLocaleDateString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmails.length === 0 && (
          <div className="mt-8 text-center text-[#8c8c9c]">
            No email records found{search ? ` for "${search}"` : ""}
          </div>
        )}
      </main>
    </div>
  );
}
