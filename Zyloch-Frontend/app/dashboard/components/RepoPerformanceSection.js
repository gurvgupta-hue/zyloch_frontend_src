"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  Lock,
  GitBranch,
  Star,
  GitCommit,
  Archive,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function RepoPerformanceSection({ summary = {} }) {
  const router = useRouter();

  const totals = summary?.totals || summary || {};
  const {
    totalCommits = 0,
    totalForks = 0,
    totalStars = 0,
    totalPrivate = 0,
    totalPublic = 0,
    totalInternal = 0,
    totalArchivedRepos = 0,
    totalStaleBranches = 0,
  } = totals;

  const stats = [
    {
      label: "Public Repos",
      value: totalPublic,
      icon: Globe,
      color: "text-[#06b6d4]",
      bg: "bg-[#06b6d4]/10",
      type: "public",
    },
    {
      label: "Private Repos",
      value: totalPrivate,
      icon: Lock,
      color: "text-[#a1a1aa]",
      bg: "bg-[#a1a1aa]/10",
      type: "private",
    },
    ...(totalInternal > 0 ? [{
      label: "Internal Repos",
      value: totalInternal,
      icon: Lock,
      color: "text-[#8b5cf6]",
      bg: "bg-[#8b5cf6]/10",
      type: "internal",
    }] : []),
    {
      label: "Total Forks",
      value: totalForks,
      icon: GitBranch,
      color: "text-[#eab308]",
      bg: "bg-[#eab308]/10",
      type: "forks",
    },
    {
      label: "Total Stars",
      value: totalStars,
      icon: Star,
      color: "text-[#eab308]",
      bg: "bg-[#eab308]/10",
      type: "stars",
    },
    {
      label: "Total Commits",
      value: totalCommits,
      icon: GitCommit,
      color: "text-[#22c55e]",
      bg: "bg-[#22c55e]/10",
      type: "commits",
    },
    {
      label: "Archived Repos",
      value: totalArchivedRepos,
      icon: Archive,
      color: "text-[#8b5cf6]",
      bg: "bg-[#8b5cf6]/10",
      type: "archived",
    },
    {
      label: "Stale Branches",
      value: totalStaleBranches,
      icon: Clock,
      color: "text-[#eab308]",
      bg: "bg-[#eab308]/10",
      type: "stale-branches",
    },
  ];

  return (
    <div
      className="rounded-[var(--radius-lg)] p-6 w-full"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h4 className="text-[#06b6d4] text-[11px] font-bold tracking-[0.1em] uppercase mb-2">
            Repository Record
          </h4>
          <h3
            className="text-lg font-bold mb-1"
            style={{ color: "var(--text)" }}
          >
            Repository Metadata
          </h3>
          <p className="text-[13px]" style={{ color: "var(--muted)" }}>
            Overview of repository metrics
          </p>
        </div>
        
        <button
          onClick={() => router.push(`/dashboard/repo-details`)}
          className="bg-[#06b6d4] text-[#121212] dark:text-white font-semibold text-[13px] px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-[#0891b2] transition-colors"
        >
          Explore more <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid container */}
      <div 
        className="flex overflow-x-auto border-t border-[var(--border)] mt-6 scrollbar-hide"
      >
        {stats.map(({ label, value, icon: Icon, color, bg, type }, idx) => (
          <div
            key={idx}
            className="flex-1 min-w-[140px] p-5 border-r border-[var(--border)] last:border-r-0 flex flex-col justify-center transition-colors group"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-1.5 rounded-md ${bg}`}>
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </div>
              <p className="text-[12px] font-medium" style={{ color: "var(--muted)" }}>
                {label}
              </p>
            </div>
            <p className={`font-bold text-[22px] group-hover:scale-[1.02] transition-transform origin-left ${color}`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
