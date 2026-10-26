"use client";

import React from "react";
import RepoLoading from "./RepoLoading";
import { useTheme } from "@/context/ThemeContext";
import {
  Plus,
  RefreshCw,
  GitBranch,
  Code2,
  FolderGit2,
  Users
} from "lucide-react";

const MiniBarChart = ({ color }) => {
  return (
    <div className="flex items-end gap-[2px] h-6 opacity-80">
      {[40, 70, 45, 100, 60, 80].map((height, i) => (
        <div
          key={i}
          className="w-[3px] rounded-t-sm"
          style={{
            height: `${height}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      ))}
    </div>
  );
};

const RepoHeaderSection = ({
  summaryAnalysis = {},
  selectedInstallation = {},
  refreshSummary,
  totalRepositories = 0,
  totalBranches = 0,
  totalTeams = 0,
  totalTeamMembers = 0,
  teamsArray = [],
  languagesArray = [],
  loading = {},
  newSummaryAnalysis, // Add this prop
}) => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const status = summaryAnalysis?.status || "idle";
  const isOrganization = selectedInstallation?.account?.type === "Organization";

  // Safely parsed values
  const safeRepos = Number(totalRepositories) || 0;
  const safeBranches = Number(totalBranches) || 0;
  const safeLanguages = Array.isArray(languagesArray)
    ? languagesArray.length
    : 0;
  const safeTeams = Number(totalTeams) || 0;
  const safeTeamMembers = Number(totalTeamMembers) || 0;

  // KPI list - conditionally include teams for organizations
  const stats = [
    {
      label: "Repositories",
      value: safeRepos,
      icon: FolderGit2,
      color: "#06b6d4",
      bgColor: "rgba(6, 182, 212, 0.2)",
    },
    {
      label: "Branches",
      value: safeBranches,
      icon: GitBranch,
      color: "#8b5cf6",
      bgColor: "rgba(139, 92, 246, 0.2)",
    },
    {
      label: "Languages",
      value: safeLanguages,
      icon: Code2,
      color: "#eab308",
      bgColor: "rgba(234, 179, 8, 0.2)",
    },
  ];

  // Add teams stats only for organizations
  if (isOrganization) {
    stats.push({
      label: "Teams",
      value: safeTeams,
      icon: Users,
      color: "#3b82f6",
      bgColor: "rgba(59, 130, 246, 0.2)",
    });
  }

  const isRefreshing = status === "in_progress";

  // Handle New Analysis button click
  const handleNewAnalysis = () => {
    if (!selectedInstallation?.installationId) {
      console.error("No installation selected");
      return;
    }

    // Reset summary and start fresh analysis
    if (newSummaryAnalysis) {
      newSummaryAnalysis(selectedInstallation.installationId);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {/* HEADER */}
      <div
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[var(--surface)] px-6 py-6 rounded-[var(--radius-lg)]"
        style={{
          border: "1px solid var(--border)",
        }}
      >
        <div className="space-y-1">
          <h1 className="font-bold text-[24px] text-[var(--text)]">
            Repository Analysis
          </h1>
          <p className="text-[var(--muted)] text-[14px] p-0">
            {selectedInstallation?.account?.login || "Organization"}{" "}
            repositories
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex w-full sm:w-auto flex-wrap sm:flex-nowrap items-center gap-3">
          {/* New Analysis Button */}
          <button
            onClick={handleNewAnalysis}
            disabled={isRefreshing || !selectedInstallation}
            className="new-analysis-btn group flex-1 sm:flex-none justify-center sm:justify-start items-center gap-3 px-4 sm:px-5 py-2.5 rounded-[var(--radius-lg)] font-medium text-[var(--font-size-sm)] border transition-all duration-200 hover:shadow-[var(--shadow-soft)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            style={
              isLight
                ? {
                  background:
                    "color-mix(in srgb, var(--success) 12%, transparent)",
                  color: "var(--success)",
                  borderColor:
                    "color-mix(in srgb, var(--success) 28%, transparent)",
                }
                : undefined
            }
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Refresh Button (for incremental updates) */}
          <button
            onClick={refreshSummary}
            disabled={isRefreshing}
            className="flex justify-center items-center w-10 h-10 rounded-lg text-[var(--muted)] border border-[var(--border)] hover:text-[var(--text)] transition-colors disabled:opacity-50 bg-transparent"
          >
            <RefreshCw
              className={`w-4 h-4 transition-transform ${isRefreshing ? "animate-spin" : "group-hover:rotate-180"
                }`}
            />
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      {loading?.repositories ? (
        <RepoLoading message="Loading repositories..." variant="inline" />
      ) : (
        <div 
          className={`grid grid-cols-1 ${isOrganization ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'} divide-y md:divide-y-0 md:divide-x divide-[var(--border)] rounded-[var(--radius-lg)] bg-[var(--surface)]`}
          style={{ border: "1px solid var(--border)" }}
        >
          {stats.map(({ label, value, icon: Icon, color, bgColor }, i) => (
            <div
              key={i}
              className="p-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                {/* Icon wrapper */}
                <div
                  className="p-3.5 rounded-xl transition-transform duration-300 hover:scale-110 flex items-center justify-center"
                  style={{ backgroundColor: bgColor }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>

                {/* Content */}
                <div className="space-y-0.5">
                  <p className="text-[var(--text)] font-medium text-[14px]">
                    {label}
                  </p>
                  <p
                    className="font-bold text-[24px]"
                    style={{ color }}
                  >
                    {value.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <MiniBarChart color={color} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RepoHeaderSection;
