"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  User,
  Shield,
  Users,
  Zap,
  Link2,
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import Logo from "@/public/logo.png";
import BlackLogo from "@/public/zyloch-black-logo.png";

// Building Icon component matching the organization icon in the design
const BuildingIcon = ({ className = "h-4 w-4", ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M3 9.5L12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 9h.01" />
    <path d="M12 9h.01" />
    <path d="M16 9h.01" />
    <path d="M8 13h.01" />
    <path d="M12 13h.01" />
    <path d="M16 13h.01" />
  </svg>
);

// CreditCard Icon component matching the Plan & Limits icon
const CreditCardIcon = ({ className = "h-4 w-4", ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
    <line x1="6" x2="10" y1="14" y2="14" />
  </svg>
);

// Collapse/close sidebar icon matching user's exact design: [<-
const CloseSidebarIcon = ({ className = "h-5 w-5", ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
    <polyline points="12 8 8 12 12 16" />
    <line x1="20" x2="8" y1="12" y2="12" />
  </svg>
);

// Expand/open sidebar icon: [->
const ExpandSidebarIcon = ({ className = "h-5 w-5", ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
    <polyline points="16 8 20 12 16 16" />
    <line x1="8" x2="20" y1="12" y2="12" />
  </svg>
);

const OpenSidebarIcon = ExpandSidebarIcon;
export { OpenSidebarIcon, ExpandSidebarIcon, CloseSidebarIcon };

const ACCOUNT_SECTIONS = [
  { id: "profile", label: "Profile Settings", Icon: User },
  { id: "organization", label: "Organization", Icon: BuildingIcon },
  { id: "plan-limits", label: "Plan & Limits", Icon: CreditCardIcon },
  { id: "team-members", label: "Team Members", Icon: Users },
  { id: "oauth-connections", label: "OAuth Connections", Icon: Zap },
  { id: "signin-links", label: "Sign-in Links", Icon: Link2 },
];

export default function Sidebar({ isOpen = true, showToggle = false, onToggle = null }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const sidebarLogo = theme === "light" ? BlackLogo : Logo;
  const isAccountPage = pathname === "/settings" || pathname === "/settings/";
  const isPolicyPage = pathname.startsWith("/settings/policymanagement");

  const [accountExpanded, setAccountExpanded] = useState(isAccountPage);
  const [activeSection, setActiveSection] = useState("profile");
  const [tip, setTip] = useState(null);

  // Sync active section from URL hash or scroll position on account page
  useEffect(() => {
    if (!isAccountPage) return;

    const sectionIds = ACCOUNT_SECTIONS.map((s) => s.id);
    const hash = window.location.hash.replace("#", "");
    if (hash && sectionIds.includes(hash)) {
      setActiveSection(hash);
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
    }

    const scrollContainer = document.getElementById("main-content");
    if (!scrollContainer) return;

    const handleScroll = () => {
      const containerRect = scrollContainer.getBoundingClientRect();
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top - containerRect.top <= 160) {
            setActiveSection(sectionIds[i]);
            return;
          }
        }
      }
      setActiveSection("profile");
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [isAccountPage]);

  // Open Account sub-sidebar when on account page, collapse when on other settings pages
  useEffect(() => {
    if (isAccountPage) {
      setAccountExpanded(true);
    } else {
      setAccountExpanded(false);
    }
  }, [isAccountPage]);

  const handleAccountClick = () => {
    if (!isAccountPage) {
      router.push("/settings");
      setAccountExpanded(true);
    } else {
      setAccountExpanded((prev) => !prev);
    }
  };

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);

    if (!isAccountPage) {
      router.push(`/settings#${sectionId}`);
      return;
    }

    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `#${sectionId}`);
    }

    // Close mobile drawer when an item is clicked
    window.dispatchEvent(new CustomEvent("settings:close-mobile-sidebar"));
  };

  const showTip = useCallback((e, label) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTip({ label, x: r.right + 12, y: r.top + r.height / 2 });
  }, []);
  const hideTip = useCallback(() => setTip(null), []);

  /* ── Collapsed rail (desktop) ───────────────────────────────── */
  if (!isOpen) {
    return (
      <>
        <aside className="flex h-full w-full flex-col justify-between rounded-2xl bg-[var(--surface)] border border-[var(--border)] py-3 px-2 shadow-sm">
          {/* Header */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-10 w-full shrink-0 items-center justify-center">
              {showToggle && (
                <button
                  type="button"
                  onClick={onToggle}
                  aria-label="Expand settings sidebar"
                  className="inline-flex items-center justify-center p-1.5 rounded-lg text-[var(--color-primary)] transition-all hover:scale-110 hover:opacity-80 active:scale-95 focus-visible:outline-none"
                >
                  <ExpandSidebarIcon className="h-5 w-5 text-[var(--color-primary)]" />
                </button>
              )}
            </div>

            <div className="w-8 h-px bg-[var(--border)]" />

            {/* Nav icons */}
            <nav className="flex flex-col items-center gap-2">
              {/* Account icon */}
              <button
                type="button"
                onClick={() => {
                  onToggle?.();
                  if (!isAccountPage) router.push("/settings");
                  setAccountExpanded(true);
                }}
                onMouseEnter={(e) => showTip(e, "Account")}
                onMouseLeave={hideTip}
                aria-label="Account"
                style={{
                  color: isAccountPage ? "var(--color-primary)" : "var(--text-secondary)",
                  backgroundColor: isAccountPage ? "rgba(var(--color-primary-rgb), 0.18)" : "transparent",
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all border-none outline-none ${
                  isAccountPage
                    ? "shadow-sm"
                    : "hover:bg-[rgba(var(--color-primary-rgb),0.1)] hover:text-[var(--text)]"
                }`}
              >
                <User className="h-5 w-5" strokeWidth={2} />
              </button>

              {/* Policy Management icon */}
              <Link
                href="/settings/policymanagement"
                onMouseEnter={(e) => showTip(e, "Policy Management")}
                onMouseLeave={hideTip}
                aria-label="Policy Management"
                style={{
                  color: isPolicyPage ? "var(--color-primary)" : "var(--text-secondary)",
                  backgroundColor: isPolicyPage ? "rgba(var(--color-primary-rgb), 0.18)" : "transparent",
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all border-none outline-none ${
                  isPolicyPage
                    ? "shadow-sm"
                    : "hover:bg-[rgba(var(--color-primary-rgb),0.1)] hover:text-[var(--text)]"
                }`}
              >
                <Shield className="h-5 w-5" strokeWidth={2} />
              </Link>
            </nav>
          </div>

          {/* Dashboard link */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-px bg-[var(--border)]" />
            <Link
              href="/dashboard"
              onMouseEnter={(e) => showTip(e, "Dashboard")}
              onMouseLeave={hideTip}
              aria-label="Dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--color-primary)] transition-all hover:bg-[rgba(var(--color-primary-rgb),0.1)]"
            >
              <LayoutDashboard className="h-5 w-5" strokeWidth={2} />
            </Link>
          </div>
        </aside>

        {tip && (
          <div
            className="pointer-events-none fixed z-[9999] whitespace-nowrap rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--text)] shadow-[var(--shadow-2)]"
            style={{ left: tip.x, top: tip.y, transform: "translateY(-50%)" }}
          >
            {tip.label}
          </div>
        )}
      </>
    );
  }

  /* ── Expanded sidebar (matches user design exactly) ────────── */
  return (
    <aside className="flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-3.5 shadow-sm">
      {/* Top section: Header + Nav */}
      <div className="flex flex-col min-w-0">
        {/* Header: Brand Logo + Toggle */}
        <div className="flex h-10 shrink-0 items-center justify-between gap-2 px-1">
          <Link
            href="/dashboard"
            className="flex items-center min-w-0"
            aria-label="Zyloch"
          >
            <Image
              src={sidebarLogo}
              alt="Zyloch"
              className={`w-[110px] h-auto shrink-0 object-contain origin-left transition-transform duration-200 ${
                theme === "dark" ? "scale-[1.35]" : "scale-100"
              }`}
              priority
            />
          </Link>

          {showToggle && (
            <button
              type="button"
              onClick={onToggle}
              aria-label="Collapse settings sidebar"
              className="inline-flex items-center justify-center p-1 rounded-lg text-[var(--color-primary)] transition-opacity hover:opacity-80 active:scale-95 focus-visible:outline-none"
            >
              <CloseSidebarIcon className="h-5 w-5 text-[var(--color-primary)]" />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="my-3.5 h-px bg-[var(--border)]" />

        {/* Nav List */}
        <nav className="flex flex-col overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-hide-lg pr-0.5">
          {/* Account Item */}
          <button
            type="button"
            onClick={handleAccountClick}
            style={{
              color: isAccountPage ? "var(--color-primary)" : "var(--text-secondary)",
              backgroundColor: isAccountPage ? "rgba(var(--color-primary-rgb), 0.18)" : "transparent",
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer border-none outline-none ${
              isAccountPage
                ? "font-semibold shadow-sm"
                : "hover:bg-[rgba(var(--color-primary-rgb),0.08)] hover:text-[var(--text)] font-medium"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <User
                className="h-4 w-4 shrink-0 transition-colors"
                style={{
                  color: isAccountPage ? "var(--color-primary)" : "var(--text-secondary)",
                }}
                strokeWidth={2}
              />
              <span className="text-sm truncate">
                Account
              </span>
            </div>

            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                accountExpanded ? "rotate-0" : "-rotate-90"
              }`}
              style={{
                color: isAccountPage ? "var(--color-primary)" : "var(--text-secondary)",
              }}
              strokeWidth={2}
            />
          </button>

          {/* Sub sidebar (under Account) */}
          {accountExpanded && (
            <div className="flex flex-col gap-1 mt-1 pl-3.5">
              {ACCOUNT_SECTIONS.map((section) => {
                const isSelected = isAccountPage && activeSection === section.id;
                const IconComponent = section.Icon;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => handleSectionClick(section.id)}
                    className={`group w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-all text-left cursor-pointer border-none outline-none ${
                      isSelected
                        ? "text-[var(--text)] font-medium"
                        : "text-[var(--text-secondary)] hover:bg-[rgba(var(--color-primary-rgb),0.06)] hover:text-[var(--text)] font-normal"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <IconComponent
                        className={`h-3.5 w-3.5 shrink-0 transition-colors ${
                          isSelected
                            ? "text-[var(--text)]"
                            : "text-[var(--text-secondary)] group-hover:text-[var(--text)]"
                        }`}
                      />
                      <span className="text-xs truncate">
                        {section.label}
                      </span>
                    </div>

                    {isSelected && (
                      <ChevronRight className="h-3.5 w-3.5 text-[var(--text-secondary)] shrink-0 ml-1.5 opacity-75" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Policy Management Item */}
          <Link
            href="/settings/policymanagement"
            style={{
              color: isPolicyPage ? "var(--color-primary)" : "var(--text-secondary)",
              backgroundColor: isPolicyPage ? "rgba(var(--color-primary-rgb), 0.18)" : "transparent",
            }}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all mt-1.5 border-none outline-none ${
              isPolicyPage
                ? "font-semibold shadow-sm"
                : "hover:bg-[rgba(var(--color-primary-rgb),0.08)] hover:text-[var(--text)] font-medium"
            }`}
          >
            <Shield
              className="h-4 w-4 shrink-0 transition-colors"
              style={{
                color: isPolicyPage ? "var(--color-primary)" : "var(--text-secondary)",
              }}
              strokeWidth={1.8}
            />
            <span className="text-sm truncate">Policy Management</span>
          </Link>
        </nav>
      </div>

      {/* Bottom section: Dashboard link */}
      <div className="shrink-0 pt-2">
        <div className="my-3.5 h-px bg-[var(--border)]" />
        <Link
          href="/dashboard"
          className="w-full flex items-center justify-start gap-2.5 px-3.5 py-2.5 rounded-xl transition-all hover:bg-[rgba(var(--color-primary-rgb),0.1)] text-[var(--color-primary)] group"
        >
          <LayoutDashboard
            className="h-4 w-4 shrink-0 text-[var(--color-primary)] transition-transform duration-200 group-hover:scale-110"
            strokeWidth={2}
          />
          <span className="text-sm font-semibold text-[var(--color-primary)]">
            Dashboard
          </span>
        </Link>
      </div>
    </aside>
  );
}
