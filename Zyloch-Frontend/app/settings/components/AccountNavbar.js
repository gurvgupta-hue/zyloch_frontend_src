"use client";

import React from "react";
import { User, Menu, ExternalLink } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/context/ThemeContext";

export const AccountNavbar = ({ onToggleSidebar }) => {
  const { user } = useTheme();

  return (
    <nav className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 relative min-h-[64px]">
      {/* Left: Mobile Menu + User Icon + Title & Description */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="sm:hidden p-2 rounded-lg hover:bg-[var(--elevated-surface)] active:bg-[var(--border)] transition-all duration-150 active:scale-95 text-[var(--text)]"
            aria-label="Toggle settings sidebar"
          >
            <Menu size={20} />
          </button>
        )}

        <div
          className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-sm"
          style={{
            background: "rgba(var(--color-primary-rgb), 0.12)",
            borderColor: "rgba(var(--color-primary-rgb), 0.28)",
            color: "var(--color-primary)",
          }}
        >
          <User size={18} />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text)] leading-tight truncate">
              Account
            </h1>
            <span
              className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium"
              style={{
                background: "rgba(var(--color-primary-rgb), 0.1)",
                border: "1px solid rgba(var(--color-primary-rgb), 0.25)",
                color: "var(--color-primary)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--color-primary)" }}
              />
              Settings
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] truncate mt-0.5">
            Manage your profile, organization, and integrations
          </p>
        </div>
      </div>

      {/* Right: GitHub Profile Link + Theme Toggle */}
      <div className="flex items-center gap-2.5 sm:gap-3 ml-auto shrink-0">
        {user?.login && (
          <a
            href={`https://github.com/${user.login}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xs:inline-flex min-h-9 items-center justify-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all border hover:opacity-90 shadow-sm"
            style={{
              borderColor: "rgba(var(--color-primary-rgb), 0.3)",
              background: "rgba(var(--color-primary-rgb), 0.1)",
              color: "var(--color-primary)",
            }}
          >
            <ExternalLink size={13} />
            <span>GitHub Profile</span>
          </a>
        )}
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default AccountNavbar;
