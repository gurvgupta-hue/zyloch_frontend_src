"use client";

import React, { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { ProfileCard } from "./components/ProfileCard";
import { OrganizationDetailsCard } from "./components/OrganizationDetailsCard";
import { LicenseCard } from "./components/LicenseCard";
import { MembersCard } from "./components/MembersCard";
import {
  OAuthConfigCard,
  ShareableLinkCard,
} from "./components/OAuthConfigCard";
import { useTenant } from "@/context/TenantContext";
import { logout } from "@/lib/api/user";
import { toast } from "react-toastify";

const SettingsPage = () => {
  const {
    isAdmin: tenantIsAdmin,
    organizations,
    switchOrg,
    clearTenant,
  } = useTenant();
  const [isAdmin, setIsAdmin] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (tenantIsAdmin) setIsAdmin(true);
  }, [tenantIsAdmin]);

  const fetchUserRole = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organization`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.organization?.userRole === "admin");
      }
    } catch {
      setIsAdmin(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const toastId = toast.loading("Signing out...");
      await logout(false);
      clearTenant?.();
      toast.update(toastId, {
        render: "Signed out successfully",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    } catch (error) {
      toast.error("Failed to sign out: " + error.message);
    }
  };

  const cardClass =
    "w-full rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-5 sm:p-6 shadow-sm transition-colors scroll-mt-6";

  return (
    <div className="w-full flex flex-col gap-5 pb-12">
      {/* Card 1: Profile Settings */}
      <section id="profile" className={cardClass}>
        <ProfileCard />
      </section>

      {/* Card 2: Organization Management */}
      <section id="organization" className={cardClass}>
        <OrganizationDetailsCard isAdmin={isAdmin} />
      </section>

      {/* Card 3: Plan & Limits */}
      <section id="plan-limits" className={cardClass}>
        <LicenseCard />
      </section>

      {/* Card 4: Team Members */}
      <section id="team-members" className={cardClass}>
        <MembersCard isAdmin={isAdmin} />
      </section>

      {/* Card 5: OAuth Configuration */}
      <section id="oauth-connections" className={cardClass}>
        <OAuthConfigCard />
      </section>

      {/* Card 6: Shareable Sign-in Link */}
      <section id="signin-links" className={cardClass}>
        <ShareableLinkCard />
      </section>

      {/* Switch organization (if multiple orgs) */}
      {organizations?.length > 1 && (
        <section id="switch-org" className={cardClass}>
          <div className="mb-4">
            <h2 className="text-base font-semibold tracking-tight text-[var(--text)] mb-1">
              Switch Organization
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Switching re-issues your session cookie for the selected tenant.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {organizations.map((org) => (
              <button
                key={org.tenantId}
                type="button"
                disabled={org.current}
                onClick={() => switchOrg(org.tenantId)}
                className={`rounded-lg px-3.5 py-2 text-xs sm:text-sm font-medium transition-all ${
                  org.current
                    ? "bg-[rgba(var(--color-primary-rgb),0.15)] border border-[var(--color-primary)] text-[var(--color-primary)]"
                    : "bg-[var(--elevated-surface)] border border-[var(--border)] text-[var(--text)] hover:border-[var(--color-primary)]"
                }`}
              >
                {org.name || org.domain || org.tenantId}
                {org.current ? " (current)" : ""}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Role & Sign Out Footer */}
      <section className="w-full rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4 sm:p-5 shadow-sm transition-colors">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{
                background: isAdmin ? "var(--color-primary)" : "var(--muted)",
              }}
            />
            <p className="text-xs sm:text-sm text-[var(--muted)]">
              Current role:{" "}
              <span className="font-medium text-[var(--text)]">
                {isAdmin ? "Organization Admin" : "Organization Member"}
              </span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all border border-[rgba(var(--danger-rgb),0.3)] bg-[rgba(var(--danger-rgb),0.1)] text-[var(--danger)] hover:bg-[rgba(var(--danger-rgb),0.2)]"
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
