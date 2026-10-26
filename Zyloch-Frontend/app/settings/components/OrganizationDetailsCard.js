"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Building2,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  Users,
  Shield,
} from "lucide-react";
import { copyToClipboard as universalCopy } from "@/lib/clipboard";
import { getLicense } from "@/lib/api/organization";
import { useTenant } from "@/context/TenantContext";

export const OrganizationDetailsCard = ({ isAdmin }) => {
  const { license: contextLicense, refresh: tenantRefresh } = useTenant();
  const [organization, setOrganization] = useState(null);
  const [license, setLicense] = useState(contextLicense);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    fetchOrganization();
    fetchLicense();
  }, [tenantRefresh]);

  const fetchLicense = async () => {
    try {
      const data = await getLicense(false);
      if (data) {
        setLicense(data);
      }
    } catch (err) {
      console.error("Error fetching license in organization details:", err);
    }
  };

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organization`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrganization(data.organization);
      }
    } catch (error) {
      console.error("Error fetching organization:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, field) => {
    const ok = await universalCopy(text);
    if (ok) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } else {
      console.error("Failed to copy:", field);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div
        className="rounded-xl p-5 text-sm"
        style={{ color: "var(--muted)", border: "1px solid var(--border)" }}
      >
        Loading organization details...
      </div>
    );
  }

  if (!organization) {
    return (
      <div
        className="rounded-xl p-5 text-sm"
        style={{ color: "var(--muted)", border: "1px solid var(--border)" }}
      >
        No organization found.
      </div>
    );
  }

  const admin = organization.adminUserId;
  const membersCount =
    organization.membersCount || organization.members?.length || 1;
  const planName =
    license?.planName ||
    license?.planId ||
    organization.license?.planName ||
    organization.license?.planId ||
    organization.plan ||
    organization.planName ||
    "Pro Plan";
  const regionName =
    organization.region || organization.userRole || (isAdmin ? "admin" : "member");

  return (
    <div className="space-y-5">
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
          <Building2 size={18} />
        </span>
        <div className="min-w-0">
          <h2
            className="text-base sm:text-lg font-bold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            Organization Management
          </h2>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            View and manage your organization details and team access
          </p>
        </div>
      </div>
          {/* Organization Title Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              {organization.logoUrl ? (
                <div
                  className="w-11 h-11 rounded-xl overflow-hidden shrink-0"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <Image
                    src={organization.logoUrl}
                    alt={organization.name || "Organization Logo"}
                    width={44}
                    height={44}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
              <div className="space-y-0.5 min-w-0">
                <h3
                  className="text-base sm:text-lg font-semibold truncate"
                  style={{ color: "var(--text)" }}
                >
                  {organization.name || "Organization"}
                </h3>
                <p className="text-xs truncate" style={{ color: "var(--muted)" }}>
                  {organization.website ? (
                    <a
                      href={organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:underline"
                      style={{ color: "var(--color-primary)" }}
                    >
                      <ExternalLink size={12} />
                      {organization.website.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    "Team workspace and access controls"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Info Boxes Grid */}
          <div className="space-y-3">
            {/* Row 1: Org ID & Created */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                className="p-3.5 rounded-xl transition-colors"
                style={{
                  background: "var(--elevated-surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <p
                  className="text-[10px] uppercase font-mono tracking-wider font-semibold mb-1"
                  style={{ color: "var(--muted)" }}
                >
                  ORGANIZATION ID
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-xs sm:text-sm font-mono font-medium truncate"
                    style={{ color: "var(--text)" }}
                  >
                    {organization._id}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(organization._id, "id")}
                    className="p-1 rounded transition-colors"
                    style={{
                      color:
                        copiedField === "id" ? "var(--success)" : "var(--muted)",
                    }}
                    title="Copy organization ID"
                  >
                    {copiedField === "id" ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div
                className="p-3.5 rounded-xl transition-colors"
                style={{
                  background: "var(--elevated-surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <p
                  className="text-[10px] uppercase font-mono tracking-wider font-semibold mb-1"
                  style={{ color: "var(--muted)" }}
                >
                  CREATED
                </p>
                <div className="flex items-center gap-2">
                  <Calendar size={14} style={{ color: "var(--muted)" }} />
                  <p
                    className="text-xs sm:text-sm font-medium"
                    style={{ color: "var(--text)" }}
                  >
                    {formatDate(organization.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Row 2: Members, Plan, Region */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                className="p-3.5 rounded-xl transition-colors"
                style={{
                  background: "var(--elevated-surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <p
                  className="text-[10px] uppercase font-mono tracking-wider font-semibold mb-1"
                  style={{ color: "var(--muted)" }}
                >
                  MEMBERS
                </p>
                <div className="flex items-center gap-2">
                  <Users size={14} style={{ color: "var(--muted)" }} />
                  <p
                    className="text-xs sm:text-sm font-medium"
                    style={{ color: "var(--text)" }}
                  >
                    {membersCount} member{membersCount > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div
                className="p-3.5 rounded-xl transition-colors"
                style={{
                  background: "var(--elevated-surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <p
                  className="text-[10px] uppercase font-mono tracking-wider font-semibold mb-1"
                  style={{ color: "var(--muted)" }}
                >
                  PLAN
                </p>
                <p
                  className="text-xs sm:text-sm font-medium capitalize"
                  style={{ color: "var(--text)" }}
                >
                  {planName}
                </p>
              </div>

              <div
                className="p-3.5 rounded-xl transition-colors"
                style={{
                  background: "var(--elevated-surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <p
                  className="text-[10px] uppercase font-mono tracking-wider font-semibold mb-1"
                  style={{ color: "var(--muted)" }}
                >
                  REGION / ROLE
                </p>
                <div className="flex items-center gap-2">
                  <Shield size={14} style={{ color: "var(--muted)" }} />
                  <p
                    className="text-xs sm:text-sm font-medium capitalize"
                    style={{ color: "var(--text)" }}
                  >
                    {regionName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Org Owner / Administrator Row */}
          <div
            className="p-3.5 rounded-xl flex items-center justify-between gap-3 flex-wrap transition-colors"
            style={{
              background: "var(--elevated-surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs"
                style={{
                  background: "var(--color-primary)",
                  color: "var(--text-on-primary)",
                }}
              >
                {admin?.avatar_url ? (
                  <Image
                    src={admin.avatar_url}
                    alt="Admin Avatar"
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{(admin?.name || "A").slice(0, 2).toUpperCase()}</span>
                )}
              </div>

              <div className="min-w-0">
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: "var(--text)" }}
                >
                  {admin?.name || "Administrator"}
                </p>
                <p
                  className="text-xs truncate font-mono"
                  style={{ color: "var(--muted)" }}
                >
                  {admin?.email || "No email available"}
                </p>
              </div>
            </div>

            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                background: "rgba(var(--success-rgb), 0.12)",
                border: "1px solid rgba(var(--success-rgb), 0.25)",
                color: "var(--success)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--success)" }}
              />
              Org Owner
            </span>
          </div>

          {/* Card Footer Bar */}
          <footer
            className="pt-4 border-t flex flex-wrap items-center justify-between gap-3"
            style={{ borderColor: "var(--border)" }}
          >
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
              style={{
                background: organization.isActive
                  ? "rgba(var(--success-rgb), 0.12)"
                  : "rgba(var(--warning-rgb), 0.12)",
                border: `1px solid ${
                  organization.isActive
                    ? "rgba(var(--success-rgb), 0.25)"
                    : "rgba(var(--warning-rgb), 0.25)"
                }`,
                color: organization.isActive ? "var(--success)" : "var(--warning)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: organization.isActive
                    ? "var(--success)"
                    : "var(--warning)",
                }}
              />
              {organization.isActive ? "Organization Active" : "Organization Inactive"}
            </span>

            <div className="flex items-center gap-3 ml-auto flex-wrap">
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                {organization.billingRenewalDate
                  ? `Billing renews ${formatDate(organization.billingRenewalDate)}`
                  : `Created ${formatDate(organization.createdAt)}`}
              </span>
            </div>
          </footer>
    </div>
  );
};
