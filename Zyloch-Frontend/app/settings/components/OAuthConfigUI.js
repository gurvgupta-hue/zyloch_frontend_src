"use client";

import React, { useState } from "react";
import {
  Save,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import GoogleIcon from "@/public/assets/icons/google.svg";
import MicrosoftIcon from "@/public/assets/icons/microsoft.svg";
import { copyToClipboard } from "@/lib/clipboard";

export const OAuthConfigUI = ({
  loading,
  saving,
  togglingGoogle,
  togglingMicrosoft,
  isAdmin = true,
  organization,
  googleConfig,
  microsoftConfig,
  onGoogleToggle,
  onGoogleSave,
  onGoogleDelete,
  onGoogleConfigChange,
  onMicrosoftToggle,
  onMicrosoftSave,
  onMicrosoftDelete,
  onMicrosoftConfigChange,
}) => {
  const [activeConfigTab, setActiveConfigTab] = useState(null); // 'google' | 'microsoft' | null
  const [showGoogleSecret, setShowGoogleSecret] = useState(false);
  const [showMicrosoftSecret, setShowMicrosoftSecret] = useState(false);
  const [copiedUri, setCopiedUri] = useState(false);

  if (loading) {
    return (
      <div className="rounded-xl p-5 text-xs text-[var(--muted)]">
        Loading OAuth configurations...
      </div>
    );
  }

  const isGoogleConnected = googleConfig?.enabled ?? true;
  const isMicrosoftConnected = microsoftConfig?.enabled ?? false;

  const currentRedirectUri =
    activeConfigTab === "google"
      ? googleConfig?.redirectUri ||
        (typeof window !== "undefined"
          ? `${window.location.origin}/api/auth/callback/google`
          : "/api/auth/callback/google")
      : microsoftConfig?.redirectUri ||
        (typeof window !== "undefined"
          ? `${window.location.origin}/api/auth/callback/microsoft`
          : "/api/auth/callback/microsoft");

  const copyRedirectUri = async () => {
    const ok = await copyToClipboard(currentRedirectUri);
    if (ok) {
      setCopiedUri(true);
      toast.success("Redirect URI copied to clipboard");
      setTimeout(() => setCopiedUri(false), 2000);
    } else {
      toast.error("Failed to copy URI");
    }
  };

  return (
    <div className="space-y-4">
      {/* 2 Provider Cards Row (Both stay at compact, equal height) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Google OAuth Card */}
        <div
          className="w-full rounded-xl transition-all border p-5 flex flex-col justify-between gap-4"
          style={{
            backgroundColor: "var(--elevated-surface)",
            borderColor:
              activeConfigTab === "google"
                ? "var(--color-primary)"
                : "var(--border)",
            boxShadow:
              activeConfigTab === "google"
                ? "0 0 0 1px rgba(var(--color-primary-rgb), 0.4)"
                : "none",
          }}
        >
          {/* Top: Icon + Toggle */}
          <div className="flex items-center justify-between gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center p-2 shrink-0 border shadow-sm"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <GoogleIcon className="w-5 h-5" />
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={isGoogleConnected}
              aria-label="Toggle Google OAuth"
              onClick={() => onGoogleToggle && onGoogleToggle(!isGoogleConnected)}
              disabled={togglingGoogle}
              className="relative inline-flex items-center shrink-0 cursor-pointer focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                width: "46px",
                height: "24px",
                borderRadius: "9999px",
                backgroundColor: isGoogleConnected
                  ? "var(--color-primary)"
                  : "rgba(120, 120, 128, 0.35)",
                border: `1.5px solid ${
                  isGoogleConnected ? "var(--color-primary)" : "var(--border)"
                }`,
                boxShadow: isGoogleConnected
                  ? "0 0 10px rgba(var(--color-primary-rgb), 0.35)"
                  : "inset 0 1px 2px rgba(0, 0, 0, 0.15)",
              }}
              title={
                isGoogleConnected ? "Disable Google OAuth" : "Enable Google OAuth"
              }
            >
              <span
                aria-hidden="true"
                className="rounded-full pointer-events-none transition-transform duration-300"
                style={{
                  position: "absolute",
                  top: "1.5px",
                  left: "2px",
                  width: "18px",
                  height: "18px",
                  borderRadius: "9999px",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 1px 4px rgba(0, 0, 0, 0.35)",
                  transform: isGoogleConnected
                    ? "translateX(22px)"
                    : "translateX(0px)",
                }}
              />
            </button>
          </div>

          {/* Title & Description */}
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-semibold text-[var(--text)]">
              Google OAuth
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Allow team members to sign in using their Google Workspace accounts.
            </p>
          </div>

          {/* Action: Configure Button */}
          <button
            type="button"
            onClick={() =>
              setActiveConfigTab(activeConfigTab === "google" ? null : "google")
            }
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg transition-all"
            style={
              activeConfigTab === "google"
                ? {
                    background: "var(--color-primary)",
                    color: "var(--text-on-primary)",
                    fontWeight: 600,
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  }
                : {
                    border: "1px solid rgba(var(--color-primary-rgb), 0.3)",
                    background: "rgba(var(--color-primary-rgb), 0.08)",
                    color: "var(--color-primary)",
                  }
            }
          >
            {activeConfigTab === "google" ? "Close Configuration" : "Configure"}
            {activeConfigTab === "google" ? (
              <ChevronUp size={13} />
            ) : (
              <ChevronDown size={13} />
            )}
          </button>

          {/* Footer: Status Badge + Sync/Status Text */}
          <div
            className="pt-3 border-t flex items-center justify-between gap-2"
            style={{ borderColor: "var(--border)" }}
          >
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                background: isGoogleConnected
                  ? "rgba(var(--success-rgb), 0.12)"
                  : "rgba(var(--muted-rgb), 0.12)",
                border: isGoogleConnected
                  ? "1px solid rgba(var(--success-rgb), 0.25)"
                  : "1px solid var(--border)",
                color: isGoogleConnected ? "var(--success)" : "var(--muted)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: isGoogleConnected
                    ? "var(--success)"
                    : "var(--muted)",
                }}
              />
              {isGoogleConnected ? "Connected" : "Not connected"}
            </span>

            <span className="text-[11px] text-[var(--muted)]">
              {isGoogleConnected ? "Active" : "Awaiting connection"}
            </span>
          </div>
        </div>

        {/* Microsoft OAuth Card */}
        <div
          className="w-full rounded-xl transition-all border p-5 flex flex-col justify-between gap-4"
          style={{
            backgroundColor: "var(--elevated-surface)",
            borderColor:
              activeConfigTab === "microsoft"
                ? "var(--color-primary)"
                : "var(--border)",
            boxShadow:
              activeConfigTab === "microsoft"
                ? "0 0 0 1px rgba(var(--color-primary-rgb), 0.4)"
                : "none",
          }}
        >
          {/* Top: Icon + Toggle */}
          <div className="flex items-center justify-between gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center p-2 shrink-0 border shadow-sm"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <MicrosoftIcon className="w-5 h-5" />
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={isMicrosoftConnected}
              aria-label="Toggle Microsoft OAuth"
              onClick={() =>
                onMicrosoftToggle && onMicrosoftToggle(!isMicrosoftConnected)
              }
              disabled={togglingMicrosoft}
              className="relative inline-flex items-center shrink-0 cursor-pointer focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                width: "46px",
                height: "24px",
                borderRadius: "9999px",
                backgroundColor: isMicrosoftConnected
                  ? "var(--color-primary)"
                  : "rgba(120, 120, 128, 0.35)",
                border: `1.5px solid ${
                  isMicrosoftConnected ? "var(--color-primary)" : "var(--border)"
                }`,
                boxShadow: isMicrosoftConnected
                  ? "0 0 10px rgba(var(--color-primary-rgb), 0.35)"
                  : "inset 0 1px 2px rgba(0, 0, 0, 0.15)",
              }}
              title={
                isMicrosoftConnected
                  ? "Disable Microsoft OAuth"
                  : "Enable Microsoft OAuth"
              }
            >
              <span
                aria-hidden="true"
                className="rounded-full pointer-events-none transition-transform duration-300"
                style={{
                  position: "absolute",
                  top: "1.5px",
                  left: "2px",
                  width: "18px",
                  height: "18px",
                  borderRadius: "9999px",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 1px 4px rgba(0, 0, 0, 0.35)",
                  transform: isMicrosoftConnected
                    ? "translateX(22px)"
                    : "translateX(0px)",
                }}
              />
            </button>
          </div>

          {/* Title & Description */}
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-semibold text-[var(--text)]">
              Microsoft OAuth
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Allow team members to sign in using their Microsoft Entra ID accounts.
            </p>
          </div>

          {/* Action: Configure Button */}
          <button
            type="button"
            onClick={() =>
              setActiveConfigTab(
                activeConfigTab === "microsoft" ? null : "microsoft"
              )
            }
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg transition-all"
            style={
              activeConfigTab === "microsoft"
                ? {
                    background: "var(--color-primary)",
                    color: "var(--text-on-primary)",
                    fontWeight: 600,
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  }
                : {
                    border: "1px solid var(--border)",
                    background: "rgba(var(--muted-rgb), 0.08)",
                    color: "var(--muted)",
                  }
            }
          >
            {activeConfigTab === "microsoft"
              ? "Close Configuration"
              : "Configure"}
            {activeConfigTab === "microsoft" ? (
              <ChevronUp size={13} />
            ) : (
              <ChevronDown size={13} />
            )}
          </button>

          {/* Footer: Status Badge + Sync/Status Text */}
          <div
            className="pt-3 border-t flex items-center justify-between gap-2"
            style={{ borderColor: "var(--border)" }}
          >
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                background: isMicrosoftConnected
                  ? "rgba(var(--success-rgb), 0.12)"
                  : "rgba(var(--muted-rgb), 0.12)",
                border: isMicrosoftConnected
                  ? "1px solid rgba(var(--success-rgb), 0.25)"
                  : "1px solid var(--border)",
                color: isMicrosoftConnected ? "var(--success)" : "var(--muted)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: isMicrosoftConnected
                    ? "var(--success)"
                    : "var(--muted)",
                }}
              />
              {isMicrosoftConnected ? "Connected" : "Not connected"}
            </span>

            <span className="text-[11px] text-[var(--muted)]">
              {isMicrosoftConnected ? "Active" : "Awaiting connection"}
            </span>
          </div>
        </div>
      </div>

      {/* Dedicated Full-Width Configuration Panel (Opens below both cards, never distorting or stretching either card!) */}
      {activeConfigTab && (
        <div className="rounded-xl bg-[var(--elevated-surface)] border border-[var(--border)] p-5 sm:p-6 space-y-5 transition-all shadow-sm">
          {/* Panel Header */}
          <div className="flex items-center justify-between gap-3 flex-wrap border-b border-[var(--border)] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center p-2 bg-[var(--surface)] border border-[var(--border)] shadow-sm">
                {activeConfigTab === "google" ? (
                  <GoogleIcon className="w-5 h-5" />
                ) : (
                  <MicrosoftIcon className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[var(--text)] flex items-center gap-2">
                  Configure{" "}
                  {activeConfigTab === "google"
                    ? "Google OAuth"
                    : "Microsoft OAuth"}
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                    style={{
                      background: (
                        activeConfigTab === "google"
                          ? isGoogleConnected
                          : isMicrosoftConnected
                      )
                        ? "rgba(var(--success-rgb), 0.12)"
                        : "rgba(var(--muted-rgb), 0.12)",
                      color: (
                        activeConfigTab === "google"
                          ? isGoogleConnected
                          : isMicrosoftConnected
                      )
                        ? "var(--success)"
                        : "var(--muted)",
                    }}
                  >
                    {(activeConfigTab === "google"
                      ? isGoogleConnected
                      : isMicrosoftConnected)
                      ? "Enabled"
                      : "Disabled"}
                  </span>
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  {activeConfigTab === "google"
                    ? "Configure client credentials from your Google Cloud Console."
                    : "Configure client credentials from your Microsoft Entra ID / Azure Portal."}
                </p>
              </div>
            </div>

            {/* Quick Provider Switcher & Close */}
            <div className="flex items-center gap-2">
              <div
                className="flex items-center p-1 rounded-lg border text-xs"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveConfigTab("google")}
                  className="px-3 py-1 rounded-md font-medium transition-all"
                  style={
                    activeConfigTab === "google"
                      ? {
                          background: "rgba(var(--color-primary-rgb), 0.15)",
                          color: "var(--color-primary)",
                          fontWeight: 600,
                        }
                      : {
                          color: "var(--muted)",
                        }
                  }
                >
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => setActiveConfigTab("microsoft")}
                  className="px-3 py-1 rounded-md font-medium transition-all"
                  style={
                    activeConfigTab === "microsoft"
                      ? {
                          background: "rgba(var(--color-primary-rgb), 0.15)",
                          color: "var(--color-primary)",
                          fontWeight: 600,
                        }
                      : {
                          color: "var(--muted)",
                        }
                  }
                >
                  Microsoft
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActiveConfigTab(null)}
                className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                style={{
                  backgroundColor: "transparent",
                }}
                title="Close configuration"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Form Fields: 2 Columns for Client ID & Secret */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client ID */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--muted)]">
                Client ID <span className="text-[var(--danger)]">*</span>
              </label>
              <div
                className="h-11 px-3.5 rounded-xl border flex items-center transition-colors focus-within:border-[var(--color-primary)]"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <input
                  type="text"
                  value={
                    activeConfigTab === "google"
                      ? googleConfig?.clientId || ""
                      : microsoftConfig?.clientId || ""
                  }
                  onChange={(e) =>
                    activeConfigTab === "google"
                      ? onGoogleConfigChange("clientId", e.target.value)
                      : onMicrosoftConfigChange("clientId", e.target.value)
                  }
                  placeholder={
                    activeConfigTab === "google"
                      ? "e.g. 123456789-abc.apps.googleusercontent.com"
                      : "e.g. 00000000-0000-0000-0000-000000000000"
                  }
                  className="w-full bg-transparent text-xs sm:text-sm font-mono text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none"
                />
              </div>
            </div>

            {/* Client Secret */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium text-[var(--muted)]">
                <span>
                  Client Secret <span className="text-[var(--danger)]">*</span>
                </span>
                {((activeConfigTab === "google"
                  ? organization?.oauthConfigurations?.google?.hasClientSecret
                  : organization?.oauthConfigurations?.microsoft
                      ?.hasClientSecret) ||
                  (activeConfigTab === "google"
                    ? googleConfig?.clientSecret === "••••••••••••••••"
                    : microsoftConfig?.clientSecret === "••••••••••••••••")) && (
                  <span
                    className="text-[11px] px-1.5 py-0.5 rounded font-medium"
                    style={{
                      background: "rgba(var(--success-rgb), 0.12)",
                      color: "var(--success)",
                    }}
                  >
                    ✓ Configured
                  </span>
                )}
              </div>
              <div
                className="h-11 px-3.5 rounded-xl border flex items-center justify-between transition-colors focus-within:border-[var(--color-primary)]"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <input
                  type={
                    (activeConfigTab === "google"
                      ? showGoogleSecret
                      : showMicrosoftSecret)
                      ? "text"
                      : "password"
                  }
                  value={
                    activeConfigTab === "google"
                      ? googleConfig?.clientSecret || ""
                      : microsoftConfig?.clientSecret || ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (activeConfigTab === "google") {
                      onGoogleConfigChange("clientSecret", val);
                    } else {
                      onMicrosoftConfigChange("clientSecret", val);
                    }
                  }}
                  placeholder="Enter client secret"
                  className="w-full bg-transparent text-xs sm:text-sm font-mono text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (activeConfigTab === "google") {
                      setShowGoogleSecret(!showGoogleSecret);
                    } else {
                      setShowMicrosoftSecret(!showMicrosoftSecret);
                    }
                  }}
                  className="p-1 text-[var(--muted)] hover:text-[var(--text)] transition-colors shrink-0 ml-2"
                >
                  {(activeConfigTab === "google"
                    ? showGoogleSecret
                    : showMicrosoftSecret) ? (
                    <EyeOff size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                </button>
              </div>
            </div>

            {/* Authorized Redirect URI (Full Width) */}
            <div className="col-span-full space-y-1.5">
              <label className="block text-xs font-medium text-[var(--muted)]">
                Authorized Redirect URI
              </label>
              <div
                className="flex items-center gap-2 p-2.5 rounded-xl border"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <code className="text-xs font-mono text-[var(--color-primary)] flex-1 min-w-0 truncate">
                  {currentRedirectUri}
                </code>
                <button
                  type="button"
                  onClick={copyRedirectUri}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors shrink-0"
                  style={{
                    borderColor: "rgba(var(--color-primary-rgb), 0.3)",
                    background: "rgba(var(--color-primary-rgb), 0.1)",
                    color: "var(--color-primary)",
                  }}
                >
                  {copiedUri ? (
                    <Check size={13} className="text-[var(--success)]" />
                  ) : (
                    <Copy size={13} />
                  )}
                  {copiedUri ? "Copied" : "Copy URI"}
                </button>
              </div>
              <p className="text-[11px] text-[var(--muted)]">
                {activeConfigTab === "google"
                  ? "Add this URI to the Authorized Redirect URIs in your Google Cloud Console OAuth 2.0 Client credentials."
                  : "Add this URI to the Redirect URIs in your Azure Portal App Registration Authentication settings."}
              </p>
            </div>
          </div>

          {/* Action Buttons Bar */}
          <div
            className="flex items-center justify-between gap-3 pt-3 border-t flex-wrap"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={
                  activeConfigTab === "google" ? onGoogleSave : onMicrosoftSave
                }
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--text-on-primary)",
                }}
              >
                <Save size={14} />
                {saving ? "Saving..." : "Save Configuration"}
              </button>

              <button
                type="button"
                onClick={() => setActiveConfigTab(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--muted)",
                  backgroundColor: "transparent",
                }}
              >
                Cancel
              </button>
            </div>

            {((activeConfigTab === "google"
              ? organization?.oauthConfigurations?.google?.enabled
              : organization?.oauthConfigurations?.microsoft?.enabled) ||
              (activeConfigTab === "google"
                ? googleConfig?.clientId
                : microsoftConfig?.clientId)) && (
              <button
                type="button"
                onClick={
                  activeConfigTab === "google"
                    ? onGoogleDelete
                    : onMicrosoftDelete
                }
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors disabled:opacity-50"
                style={{
                  borderColor: "rgba(var(--danger-rgb), 0.3)",
                  background: "rgba(var(--danger-rgb), 0.08)",
                  color: "var(--danger)",
                }}
              >
                <Trash2 size={13} />
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
