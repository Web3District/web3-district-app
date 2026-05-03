"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const ACCENT = "#ed0584";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  url: string;
  active: boolean;
  created_at: string;
}

export default function AdminJobsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "full-time",
    url: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const supabase = createBrowserSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push("/admin/login?next=/admin/jobs");
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

    fetchJobs();
  }

  async function fetchJobs() {
    try {
      const supabase = createBrowserSupabase();
      
      const { data, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (jobsError) throw jobsError;

      setJobs(data ?? []);
    } catch (err: any) {
      setError(err.message ?? "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    try {
      const supabase = createBrowserSupabase();
      
      const { error } = await supabase.from("jobs").insert({
        ...formData,
        active: true,
      });

      if (error) throw error;

      setSuccess("Job created successfully");
      setTimeout(() => setSuccess(null), 3000);
      setFormData({ title: "", company: "", location: "", type: "full-time", url: "" });
      await fetchJobs();
    } catch (err: any) {
      setError(err.message ?? "Failed to create job");
      setTimeout(() => setError(null), 3000);
    }
  }

  async function handleToggle(id: number, current: boolean) {
    try {
      const supabase = createBrowserSupabase();
      
      const { error } = await supabase
        .from("jobs")
        .update({ active: !current })
        .eq("id", id);

      if (error) throw error;

      await fetchJobs();
    } catch (err: any) {
      setError(err.message ?? "Failed to update job");
      setTimeout(() => setError(null), 3000);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this job?")) return;

    try {
      const supabase = createBrowserSupabase();
      
      const { error } = await supabase.from("jobs").delete().eq("id", id);

      if (error) throw error;

      await fetchJobs();
    } catch (err: any) {
      setError(err.message ?? "Failed to delete job");
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
        <h1 className="text-lg">Jobs</h1>
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
          <h3 className="mb-4 text-lg text-[#ed0584]">Create Job</h3>
          <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Title</label>
              <input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Senior Developer"
                className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#ed0584] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Company</label>
              <input
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Acme Inc"
                className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#ed0584] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Location</label>
              <input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Remote"
                className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#ed0584] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-[#8c8c9c]">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#ed0584] focus:outline-none"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-[#8c8c9c]">URL</label>
              <input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-none border border-[#2a2a30] bg-[#161618] px-4 py-2 font-pixel text-white focus:border-[#ed0584] focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="rounded-none border border-[#2a2a30] bg-[#161618] px-6 py-2 font-pixel text-white hover:bg-[#1c1c20] md:col-span-2"
              style={{ borderColor: ACCENT }}
            >
              Create Job
            </button>
          </form>
        </section>

        <section className="rounded-none border-4 border-[#1a1a24] bg-[#101018] p-6">
          <h3 className="mb-4 text-lg text-[#ed0584]">Jobs List</h3>
          
          {jobs.length === 0 ? (
            <p className="text-[#8c8c9c]">No jobs posted.</p>
          ) : (
            <div className="space-y-2">
              {jobs.map((job) => (
                <div key={job.id} className="rounded-none border-2 border-[#2a2a38] bg-[#1a1a24] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold">{job.title}</div>
                      <div className="text-xs text-[#8c8c9c]">
                        {job.company} · {job.location || "Remote"} · {job.type}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggle(job.id, job.active)}
                        className={`rounded-none border px-3 py-1 text-xs ${
                          job.active
                            ? "border-green-600 bg-green-900/20 text-green-400"
                            : "border-[#2a2a30] bg-[#161618] text-[#8c8c9c]"
                        }`}
                      >
                        {job.active ? "Active" : "Inactive"}
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
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
