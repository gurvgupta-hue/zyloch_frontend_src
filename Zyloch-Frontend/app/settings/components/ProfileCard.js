"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Mail,
  Calendar,
  AtSign,
  User,
  Palette,
  ChevronDown,
  Check,
} from "lucide-react";
import { FaGithub as Github } from "react-icons/fa";
import { useTheme, TIME_ZONE_OPTIONS } from "@/context/ThemeContext";

export const ProfileCard = () => {
  const { user, theme, setTheme, timeZone, setTimeZone } = useTheme();
  const [showEmail, setShowEmail] = useState(false);
  const [isTzOpen, setIsTzOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const timezoneRef = useRef(null);
  const themeRef = useRef(null);

  const activeTimeZone = timeZone || "UTC";
  const selectedZone = useMemo(
    () => TIME_ZONE_OPTIONS.find((zone) => zone.value === activeTimeZone),
    [activeTimeZone]
  );

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (timezoneRef.current && !timezoneRef.current.contains(event.target)) {
        setIsTzOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target)) {
        setIsThemeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  if (!user) {
    return (
      <div
        className="rounded-xl p-5 text-sm"
        style={{ color: "var(--muted)", border: "1px solid var(--border)" }}
      >
        Loading profile...
      </div>
    );
  }

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const profileUrl = user.html_url || `https://github.com/${user.login}`;
  const organizationName =
    user?.organizationId && typeof user.organizationId === "object"
      ? user.organizationId.name
      : null;

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3.5">
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "rgba(var(--color-primary-rgb), 0.12)",
            border: "1px solid rgba(var(--color-primary-rgb), 0.28)",
            color: "var(--color-primary)",
          }}
        >
          <User size={18} />
        </span>
        <div className="min-w-0">
          <h2
            className="text-base sm:text-lg font-bold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            Profile Settings
          </h2>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            Manage your personal information and preferences
          </p>
        </div>
      </div>
          {/* User Avatar Row */}
          <div
            className="rounded-xl p-4 flex items-center justify-between gap-4 transition-colors"
            style={{
              background: "var(--elevated-surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className="w-12 h-12 rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold text-sm shadow-sm"
                style={{
                  background: "var(--color-primary)",
                  color: "var(--text-on-primary)",
                }}
              >
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt="User Avatar"
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{getInitials(user.name || user.login)}</span>
                )}
              </div>

              <div className="min-w-0">
                <h3
                  className="text-sm sm:text-base font-semibold truncate"
                  style={{ color: "var(--text)" }}
                >
                  {user.name || user.login || "Unknown User"}
                </h3>
                <p
                  className="text-xs truncate font-mono mt-0.5"
                  style={{ color: "var(--muted)" }}
                >
                  @{user.login || "unknown"}
                </p>
                {organizationName && (
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted)" }}>
                    Organization: <span style={{ color: "var(--text)" }}>{organizationName}</span>
                  </p>
                )}
              </div>
            </div>

            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0"
              style={{
                background: "rgba(var(--color-primary-rgb), 0.1)",
                border: "1px solid rgba(var(--color-primary-rgb), 0.3)",
                color: "var(--color-primary)",
              }}
            >
              <Github size={13} />
              <span>Visit Github</span>
            </a>
          </div>

          {/* Form Fields Grid */}
          <div className="space-y-4">
            {/* Row 1: Full Name & Email Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "var(--muted)" }}
                >
                  Full Name
                </label>
                <div
                  className="h-11 px-3.5 rounded-xl flex items-center gap-2.5 transition-colors"
                  style={{
                    background: "var(--elevated-surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <User size={15} style={{ color: "var(--muted)" }} className="shrink-0" />
                  <span
                    className="text-xs sm:text-sm font-medium truncate"
                    style={{ color: "var(--text)" }}
                  >
                    {user.name || "Not set"}
                  </span>
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "var(--muted)" }}
                >
                  Email Address
                </label>
                <div
                  className="h-11 px-3.5 rounded-xl flex items-center justify-between gap-2.5 transition-colors"
                  style={{
                    background: "var(--elevated-surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Mail size={15} style={{ color: "var(--muted)" }} className="shrink-0" />
                    <span
                      className="text-xs sm:text-sm font-medium truncate"
                      style={{ color: "var(--text)" }}
                    >
                      {showEmail ? user.email || "Not available" : "••••••••@•••••.com"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {user.email && (
                      <span
                        className="h-4 w-4 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background: "rgba(var(--success-rgb), 0.15)",
                          color: "var(--success)",
                        }}
                        title="Verified"
                      >
                        <Check size={11} strokeWidth={3} />
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowEmail((prev) => !prev)}
                      className="text-xs font-medium px-2 py-0.5 rounded-md transition-colors"
                      style={{
                        background: "rgba(var(--color-primary-rgb), 0.12)",
                        color: "var(--color-primary)",
                      }}
                    >
                      {showEmail ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: GitHub Username (Full Width) */}
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--muted)" }}
              >
                GitHub Username
              </label>
              <div
                className="h-11 px-3.5 rounded-xl flex items-center gap-2.5 transition-colors"
                style={{
                  background: "var(--elevated-surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <AtSign size={15} style={{ color: "var(--muted)" }} className="shrink-0" />
                <span
                  className="text-xs sm:text-sm font-mono font-medium truncate"
                  style={{ color: "var(--text)" }}
                >
                  {user.login ? `@${user.login}` : "Not available"}
                </span>
              </div>
            </div>

            {/* Row 3: Interface Theme & Timezone (2 columns as shown in Figma) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "var(--muted)" }}
                >
                  Interface Theme
                </label>
                <div className="relative" ref={themeRef}>
                  <button
                    type="button"
                    onClick={() => setIsThemeOpen((prev) => !prev)}
                    className="h-11 w-full px-3.5 rounded-xl flex items-center justify-between text-xs sm:text-sm font-medium transition-colors"
                    style={{
                      background: "var(--elevated-surface)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                    }}
                  >
                    <span className="inline-flex items-center gap-2.5 min-w-0 capitalize">
                      <Palette size={15} style={{ color: "var(--muted)" }} />
                      <span>{theme || "Dark"}</span>
                    </span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 shrink-0 ml-2 ${
                        isThemeOpen ? "rotate-180" : ""
                      }`}
                      style={{ color: "var(--muted)" }}
                    />
                  </button>

                  {isThemeOpen && (
                    <div
                      className="absolute z-30 mt-2 w-full rounded-xl p-1.5 shadow-xl backdrop-blur-xl"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {["dark", "light"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setTheme(t);
                            setIsThemeOpen(false);
                          }}
                          className="w-full text-left rounded-lg px-3 py-2 text-xs flex items-center justify-between capitalize transition-colors"
                          style={{
                            color:
                              theme === t ? "var(--color-primary)" : "var(--text)",
                            background:
                              theme === t
                                ? "rgba(var(--color-primary-rgb), 0.12)"
                                : "transparent",
                          }}
                        >
                          <span>{t}</span>
                          {theme === t && <Check size={13} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "var(--muted)" }}
                >
                  Timezone
                </label>
                <div className="relative" ref={timezoneRef}>
                  <button
                    type="button"
                    onClick={() => setIsTzOpen((prev) => !prev)}
                    className="h-11 w-full px-3.5 rounded-xl flex items-center justify-between text-xs sm:text-sm font-medium transition-colors"
                    style={{
                      background: "var(--elevated-surface)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                    }}
                  >
                    <span className="inline-flex items-center gap-2.5 min-w-0">
                      <span className="truncate">
                        {selectedZone?.label || activeTimeZone}
                      </span>
                    </span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 shrink-0 ml-2 ${
                        isTzOpen ? "rotate-180" : ""
                      }`}
                      style={{ color: "var(--muted)" }}
                    />
                  </button>

                  {isTzOpen && (
                    <div
                      className="absolute z-30 mt-2 w-full max-h-56 overflow-auto rounded-xl p-1.5 shadow-xl backdrop-blur-xl"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {TIME_ZONE_OPTIONS.map((zone) => (
                        <button
                          key={zone.value}
                          type="button"
                          onClick={() => {
                            setTimeZone(zone.value);
                            setIsTzOpen(false);
                          }}
                          className="w-full text-left rounded-lg px-3 py-2 text-xs flex items-center justify-between transition-colors"
                          style={{
                            color:
                              zone.value === activeTimeZone
                                ? "var(--color-primary)"
                                : "var(--text)",
                            background:
                              zone.value === activeTimeZone
                                ? "rgba(var(--color-primary-rgb), 0.12)"
                                : "transparent",
                          }}
                        >
                          <span>
                            {zone.label} (UTC{zone.offset >= 0 ? "+" : ""}
                            {zone.offset})
                          </span>
                          {zone.value === activeTimeZone && <Check size={13} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <footer
            className="pt-4 border-t flex flex-wrap items-center justify-between gap-3"
            style={{ borderColor: "var(--border)" }}
          >
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
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
              Profile active
            </span>

            <span
              className="inline-flex items-center gap-1.5 text-xs ml-auto"
              style={{ color: "var(--muted)" }}
            >
              Last updated: {formatDate(user.updatedAt || user.createdAt || new Date())}
            </span>
          </footer>

          <div className="px-1">
            <p className="text-[11px]" style={{ color: "var(--muted)" }}>
              Email visibility only affects this screen and does not modify account privacy settings.
            </p>
          </div>
    </div>
  );
};
