"use client";

import React, { useEffect, useState } from "react";
import {
  Layers,
  Zap,
  ArrowLeft,
  Users,
  FolderGit2,
  ShieldCheck,
  Star,
  AlertTriangle,
} from "lucide-react";
import { getLicense } from "@/lib/api/organization";
import { useTenant } from "@/context/TenantContext";

export function LicenseCard() {
  const { isAdmin, license: contextLicense, refresh } = useTenant();
  const [license, setLicense] = useState(contextLicense);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getLicense(false);
        if (!cancelled) {
          setLicense(data);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.status === 404
              ? "No license assigned yet."
              : err.message || "Failed to load license"
          );
          setLicense(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  if (loading) {
    return (
      <div
        className="rounded-xl p-5 text-sm"
        style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
      >
        Loading license…
      </div>
    );
  }

  if (error || !license) {
    return (
      <div
        className="rounded-xl p-5 text-sm"
        style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
      >
        {error || "License unavailable"}
      </div>
    );
  }

  const users = license.usage?.users || { current: 0, max: 0 };
  const repos = license.usage?.repos || { current: 0, max: 0 };
  const scans = license.usage?.scansThisMonth || { current: 0, max: 0 };
  const overLimit =
    license.overLimit?.users || (users.max > 0 && users.current >= users.max);

  const calculatePct = (curr, max) => {
    if (!max || max <= 0) return 0;
    return Math.min(100, Math.round((curr / max) * 100));
  };

  const usersPct = calculatePct(users.current, users.max);
  const reposPct = calculatePct(repos.current, repos.max);
  const scansPct = calculatePct(scans.current, scans.max);

  const planName = license.planName || license.planId || "Pro Plan";
  const isActive = license.active !== false;

  return (
    <div className="space-y-6">
      {/* Card Header */}
      <div className="flex items-start gap-3.5">
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "rgba(var(--color-primary-rgb), 0.12)",
            border: "1px solid rgba(var(--color-primary-rgb), 0.28)",
            color: "var(--color-primary)",
          }}
        >
          <Layers size={18} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h2
              className="text-base sm:text-lg font-bold tracking-tight"
              style={{ color: "var(--text)" }}
            >
              Plan & Limits
            </h2>
            {!isAdmin && (
              <span
                className="text-xs px-2.5 py-0.5 rounded-md font-medium"
                style={{
                  background: "var(--elevated-surface)",
                  color: "var(--muted)",
                  border: "1px solid var(--border)",
                }}
              >
                Read-only
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            Monitor your current usage against plan quotas
          </p>
        </div>
      </div>
          {/* Plan Highlight Banner */}
      <div
        className="rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap transition-colors"
        style={{
          background: "var(--elevated-surface)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
            style={{
              background: "var(--color-primary)",
              color: "var(--text-on-primary)",
            }}
          >
            <Zap size={20} className="fill-current" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="text-base font-bold"
                style={{ color: "var(--text)" }}
              >
                {planName}
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                style={{
                  background: isActive
                    ? "rgba(var(--success-rgb), 0.12)"
                    : "rgba(var(--warning-rgb), 0.12)",
                  border: `1px solid ${
                    isActive
                      ? "rgba(var(--success-rgb), 0.25)"
                      : "rgba(var(--warning-rgb), 0.25)"
                  }`,
                  color: isActive ? "var(--success)" : "var(--warning)",
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: isActive ? "var(--success)" : "var(--warning)",
                  }}
                />
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted)" }}>
              Full access to all security scanning features
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0"
            style={{
              background: "rgba(var(--color-primary-rgb), 0.1)",
              border: "1px solid rgba(var(--color-primary-rgb), 0.3)",
              color: "var(--color-primary)",
            }}
          >
            <Star size={12} className="fill-current" />
            Upgrade
          </button>
        )}
      </div>

      {/* Quota Progress Bars */}
      <div className="space-y-4 pt-1">
        {/* Metric 1: Users / Team Members */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span
              className="inline-flex items-center gap-2"
              style={{ color: "var(--text)" }}
            >
              <Users size={14} style={{ color: "var(--muted)" }} />
              Active Users
            </span>
            <span style={{ color: "var(--muted)" }}>
              <span className="font-semibold" style={{ color: "var(--text)" }}>
                {users.current}
              </span>{" "}
              / {users.max || "—"} seats
            </span>
          </div>
          <div
            className="h-1.5 w-full rounded-full overflow-hidden"
            style={{ background: "rgba(var(--muted-rgb), 0.2)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(users.current > 0 ? 3 : 0, usersPct)}%`,
                background:
                  usersPct >= 90 ? "var(--danger)" : "var(--color-primary)",
              }}
            />
          </div>
          {users.max > 0 && (
            <div className="flex justify-end">
              <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                {usersPct}% used
              </span>
            </div>
          )}
        </div>

        {/* Metric 2: Repositories */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span
              className="inline-flex items-center gap-2"
              style={{ color: "var(--text)" }}
            >
              <FolderGit2 size={14} style={{ color: "var(--muted)" }} />
              Repositories Monitored
            </span>
            <span style={{ color: "var(--muted)" }}>
              <span
                className="font-semibold"
                style={{
                  color: reposPct >= 80 ? "var(--danger)" : "var(--text)",
                }}
              >
                {repos.current.toLocaleString()}
              </span>{" "}
              / {repos.max ? repos.max.toLocaleString() : "—"} repos
            </span>
          </div>
          <div
            className="h-1.5 w-full rounded-full overflow-hidden"
            style={{ background: "rgba(var(--muted-rgb), 0.2)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(repos.current > 0 ? 3 : 0, reposPct)}%`,
                background:
                  reposPct >= 80 ? "var(--danger)" : "var(--color-primary)",
              }}
            />
          </div>
          {repos.max > 0 && (
            <div className="flex justify-end">
              <span
                className="text-[11px] font-medium"
                style={{
                  color: reposPct >= 80 ? "var(--danger)" : "var(--muted)",
                }}
              >
                {reposPct}% used
              </span>
            </div>
          )}
        </div>

        {/* Metric 3: Security Scans This Month */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span
              className="inline-flex items-center gap-2"
              style={{ color: "var(--text)" }}
            >
              <ShieldCheck size={14} style={{ color: "var(--muted)" }} />
              Security Scans This Month
            </span>
            <span style={{ color: "var(--muted)" }}>
              <span
                className="font-semibold"
                style={{ color: "var(--color-primary)" }}
              >
                {scans.current.toLocaleString()}
              </span>{" "}
              / {scans.max ? scans.max.toLocaleString() : "—"} scans
            </span>
          </div>
          <div
            className="h-1.5 w-full rounded-full overflow-hidden"
            style={{ background: "rgba(var(--muted-rgb), 0.2)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(scans.current > 0 ? 2 : 0, scansPct)}%`,
                background: "var(--color-primary)",
              }}
            />
          </div>
          {scans.max > 0 && (
            <div className="flex justify-end">
              <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                {scansPct}% used
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Alert Warning if Over Limit */}
      {overLimit && (
        <div
          className="flex items-start gap-2.5 rounded-xl p-3.5 text-xs sm:text-sm"
          style={{
            background: "rgba(var(--danger-rgb), 0.1)",
            border: "1px solid rgba(var(--danger-rgb), 0.25)",
            color: "var(--danger)",
          }}
        >
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>
            Seat limit reached ({users.current}/{users.max}). Deactivate unused
            members or ask your Zyloch admin to upgrade the plan.
          </span>
        </div>
      )}

      {/* Footer Link */}
      <footer
        className="pt-3 border-t flex items-center justify-between"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:underline"
          style={{ color: "var(--muted)" }}
        >
          <ArrowLeft size={13} />
          Manage Billing & Invoices
        </button>
      </footer>
    </div>
  );
}
