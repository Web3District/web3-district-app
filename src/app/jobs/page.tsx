"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase";

const ACCENT = "#ed0584";
const BG = "#0d0d0f";
const CARD_BG = "#101018";
const BORDER = "#2a2a30";
const CREAM = "#e8dcc8";
const MUTED = "#8c8c9c";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  url: string;
  description: string | null;
  salary_range: string | null;
  active: boolean;
  featured: boolean;
  created_at: string;
}

type JobType = "all" | "full-time" | "part-time" | "contract" | "internship";
type JobLocation = "all" | "remote" | "onsite" | "hybrid";

export default function JobsPage() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [typeFilter, setTypeFilter] = useState<JobType>("all");
  const [locationFilter, setLocationFilter] = useState<JobLocation>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, typeFilter, locationFilter, searchQuery]);

  async function fetchJobs() {
    try {
      const supabase = createBrowserSupabase();
      
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("active", true)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data ?? []);
    } catch (err: any) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...jobs];

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(job => job.type === typeFilter);
    }

    // Location filter
    if (locationFilter !== "all") {
      filtered = filtered.filter(job => {
        const loc = job.location.toLowerCase();
        if (locationFilter === "remote") return loc.includes("remote");
        if (locationFilter === "onsite") return !loc.includes("remote") && !loc.includes("hybrid");
        if (locationFilter === "hybrid") return loc.includes("hybrid");
        return true;
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        (job.description && job.description.toLowerCase().includes(query))
      );
    }

    setFilteredJobs(filtered);
  }

  function getTypeColor(type: string) {
    switch (type) {
      case "full-time": return "#10b981";
      case "part-time": return "#3b82f6";
      case "contract": return "#f59e0b";
      case "internship": return "#8b5cf6";
      default: return MUTED;
    }
  }

  function getFeaturedBadge(job: Job) {
    if (!job.featured) return null;
    return (
      <div
        className="mb-2 inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-[10px] uppercase"
        style={{
          backgroundColor: `${ACCENT}20`,
          color: ACCENT,
          border: `1px solid ${ACCENT}`,
        }}
      >
        ⭐ Featured
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: BG }}>
        <p className="font-pixel text-[#8c8c9c]">Loading jobs...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen font-pixel"
      style={{ backgroundColor: BG, color: CREAM }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          backgroundColor: BG,
          borderColor: BORDER,
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-lg transition-colors hover:text-[#ed0584]"
          >
            ← Back to City
          </Link>
          <h1 className="text-xl">
            <span style={{ color: ACCENT }}>Web4City</span> Jobs
          </h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Hero */}
      <div className="border-b py-12" style={{ borderColor: BORDER }}>
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl md:text-4xl">
            Find Your Next <span style={{ color: ACCENT }}>Adventure</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#8c8c9c] normal-case">
            Discover opportunities from top companies in web3, AI, and tech. 
            Build your future while building in the city.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search jobs, companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-none border px-4 py-2 font-pixel text-sm focus:outline-none"
              style={{
                backgroundColor: CARD_BG,
                borderColor: BORDER,
                color: CREAM,
              }}
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as JobType)}
              className="rounded-none border px-3 py-2 text-sm focus:outline-none"
              style={{
                backgroundColor: CARD_BG,
                borderColor: BORDER,
                color: CREAM,
              }}
            >
              <option value="all">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>

            {/* Location Filter */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value as JobLocation)}
              className="rounded-none border px-3 py-2 text-sm focus:outline-none"
              style={{
                backgroundColor: CARD_BG,
                borderColor: BORDER,
                color: CREAM,
              }}
            >
              <option value="all">All Locations</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-[#8c8c9c]">
            Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
            {typeFilter !== "all" && ` · ${typeFilter}`}
            {locationFilter !== "all" && ` · ${locationFilter}`}
          </p>
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mb-4 text-6xl">🔍</div>
            <h3 className="text-xl text-[#8c8c9c]">No jobs found</h3>
            <p className="mt-2 text-sm text-[#8c8c9c]">
              Try adjusting your filters or check back later
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredJobs.map((job) => (
              <a
                key={job.id}
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-none border-2 p-5 transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: CARD_BG,
                  borderColor: job.featured ? ACCENT : BORDER,
                  boxShadow: job.featured ? `0 0 20px ${ACCENT}30` : "none",
                }}
              >
                {getFeaturedBadge(job)}
                
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-cream group-hover:text-[#ed0584] transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-sm" style={{ color: ACCENT }}>
                    {job.company}
                  </p>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  {/* Type Badge */}
                  <span
                    className="rounded-none px-2 py-0.5 text-[10px] uppercase"
                    style={{
                      backgroundColor: `${getTypeColor(job.type)}20`,
                      color: getTypeColor(job.type),
                      border: `1px solid ${getTypeColor(job.type)}`,
                    }}
                  >
                    {job.type}
                  </span>

                  {/* Location */}
                  {job.location && (
                    <span className="rounded-none border border-[#2a2a30] px-2 py-0.5 text-[10px] text-[#8c8c9c]">
                      📍 {job.location}
                    </span>
                  )}

                  {/* Salary */}
                  {job.salary_range && (
                    <span className="rounded-none border border-[#2a2a30] px-2 py-0.5 text-[10px] text-[#10b981]">
                      💰 {job.salary_range}
                    </span>
                  )}
                </div>

                {job.description && (
                  <p className="mb-4 line-clamp-2 text-sm text-[#8c8c9c]">
                    {job.description}
                  </p>
                )}

                {/* Apply Button */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8c8c9c]">
                    {new Date(job.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span
                    className="flex items-center gap-1 text-xs transition-colors"
                    style={{ color: ACCENT }}
                  >
                    Apply Now →
                  </span>
                </div>

                {/* Hover Effect Border */}
                <div
                  className="absolute inset-0 rounded-none border-2 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ borderColor: ACCENT }}
                />
              </a>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div
          className="mt-12 rounded-none border-4 p-8 text-center"
          style={{
            backgroundColor: CARD_BG,
            borderColor: BORDER,
          }}
        >
          <h3 className="text-xl">
            Want to <span style={{ color: ACCENT }}>Post a Job?</span>
          </h3>
          <p className="mt-2 text-sm text-[#8c8c9c]">
            Reach out to our community of 172K+ developers
          </p>
          <a
            href="mailto:hello@web4city.xyz"
            className="mt-4 inline-block rounded-none px-6 py-3 text-sm transition-colors"
            style={{
              backgroundColor: ACCENT,
              color: BG,
              boxShadow: `3px 3px 0 0 #000`,
            }}
          >
            Contact Us →
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="mt-20 border-t py-8"
        style={{ borderColor: BORDER }}
      >
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-[#8c8c9c]">
          <p>
            Built with 💖 by <span style={{ color: ACCENT }}>Web4City</span>
          </p>
          <p className="mt-2 text-xs">
            Web4City. The Vibecoders City.
          </p>
        </div>
      </footer>
    </div>
  );
}
