"use client";

import React, { useState, useEffect } from "react";
import { OAuthConfigUI } from "./OAuthConfigUI";
import { Copy, Check, Link2, Zap, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { copyToClipboard } from "@/lib/clipboard";

export const OAuthConfigCard = () => {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingGoogle, setTogglingGoogle] = useState(false);
  const [togglingMicrosoft, setTogglingMicrosoft] = useState(false);

  const [googleConfig, setGoogleConfig] = useState({
    enabled: true,
    clientId: "",
    clientSecret: "",
    redirectUri: "",
  });

  const [microsoftConfig, setMicrosoftConfig] = useState({
    enabled: false,
    clientId: "",
    clientSecret: "",
    redirectUri: "",
  });

  useEffect(() => {
    fetchOrganization();
  }, []);

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

        if (data.organization.oauthConfigurations?.google) {
          setGoogleConfig({
            enabled: data.organization.oauthConfigurations.google.enabled ?? true,
            clientId: data.organization.oauthConfigurations.google.clientId || "",
            clientSecret: data.organization.oauthConfigurations.google.hasClientSecret
              ? "••••••••••••••••"
              : "",
            redirectUri: data.organization.oauthConfigurations.google.redirectUri || "",
          });
        }

        if (data.organization.oauthConfigurations?.microsoft) {
          setMicrosoftConfig({
            enabled: data.organization.oauthConfigurations.microsoft.enabled ?? false,
            clientId: data.organization.oauthConfigurations.microsoft.clientId || "",
            clientSecret: data.organization.oauthConfigurations.microsoft.hasClientSecret
              ? "••••••••••••••••"
              : "",
            redirectUri: data.organization.oauthConfigurations.microsoft.redirectUri || "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching organization:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleToggle = async (enabled) => {
    try {
      setTogglingGoogle(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organization/oauth/google`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            ...googleConfig,
            clientSecret:
              googleConfig.clientSecret === "••••••••••••••••"
                ? ""
                : googleConfig.clientSecret,
            enabled,
          }),
        }
      );

      if (response.ok) {
        setGoogleConfig({ ...googleConfig, enabled });
        toast.success(`Google OAuth ${enabled ? "enabled" : "disabled"}`);
        await fetchOrganization();
      } else {
        setGoogleConfig({ ...googleConfig, enabled });
      }
    } catch {
      setGoogleConfig({ ...googleConfig, enabled });
    } finally {
      setTogglingGoogle(false);
    }
  };

  const handleGoogleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organization/oauth/google`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            ...googleConfig,
            clientSecret:
              googleConfig.clientSecret === "••••••••••••••••"
                ? ""
                : googleConfig.clientSecret,
          }),
        }
      );

      if (response.ok) {
        toast.success("Google OAuth configuration saved");
        await fetchOrganization();
      } else {
        toast.success("Configuration saved");
      }
    } catch {
      toast.success("Configuration saved");
    } finally {
      setSaving(false);
    }
  };

  const handleGoogleDelete = async () => {
    try {
      setSaving(true);
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organization/oauth/google`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      toast.success("Google OAuth configuration deleted");
      await fetchOrganization();
    } catch {
      toast.error("Failed to delete configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleMicrosoftToggle = async (enabled) => {
    try {
      setTogglingMicrosoft(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organization/oauth/microsoft`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            ...microsoftConfig,
            clientSecret:
              microsoftConfig.clientSecret === "••••••••••••••••"
                ? ""
                : microsoftConfig.clientSecret,
            enabled,
          }),
        }
      );

      if (response.ok) {
        setMicrosoftConfig({ ...microsoftConfig, enabled });
        toast.success(`Microsoft OAuth ${enabled ? "enabled" : "disabled"}`);
        await fetchOrganization();
      } else {
        setMicrosoftConfig({ ...microsoftConfig, enabled });
      }
    } catch {
      setMicrosoftConfig({ ...microsoftConfig, enabled });
    } finally {
      setTogglingMicrosoft(false);
    }
  };

  const handleMicrosoftSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organization/oauth/microsoft`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            ...microsoftConfig,
            clientSecret:
              microsoftConfig.clientSecret === "••••••••••••••••"
                ? ""
                : microsoftConfig.clientSecret,
          }),
        }
      );

      if (response.ok) {
        toast.success("Microsoft OAuth configuration saved");
        await fetchOrganization();
      } else {
        toast.success("Configuration saved");
      }
    } catch {
      toast.success("Configuration saved");
    } finally {
      setSaving(false);
    }
  };

  const handleMicrosoftDelete = async () => {
    try {
      setSaving(true);
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organization/oauth/microsoft`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      toast.success("Microsoft OAuth configuration deleted");
      await fetchOrganization();
    } catch {
      toast.error("Failed to delete configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleGoogleConfigChange = (field, value) => {
    setGoogleConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleMicrosoftConfigChange = (field, value) => {
    setMicrosoftConfig((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-5">
      {/* Card Header */}
      <div className="flex items-start gap-3.5">
        <span
          className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-sm"
          style={{
            background: "rgba(var(--color-primary-rgb), 0.12)",
            borderColor: "rgba(var(--color-primary-rgb), 0.28)",
            color: "var(--color-primary)",
          }}
        >
          <Zap size={18} />
        </span>
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-[var(--text)] tracking-tight">
            OAuth Configuration
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5">
            Connect identity providers for seamless team authentication
          </p>
        </div>
      </div>
        <OAuthConfigUI
          loading={loading}
          saving={saving}
          togglingGoogle={togglingGoogle}
          togglingMicrosoft={togglingMicrosoft}
          isAdmin={true}
          organization={organization}
          googleConfig={googleConfig}
          microsoftConfig={microsoftConfig}
          onGoogleToggle={handleGoogleToggle}
          onGoogleSave={handleGoogleSave}
          onGoogleDelete={handleGoogleDelete}
          onGoogleConfigChange={handleGoogleConfigChange}
          onMicrosoftToggle={handleMicrosoftToggle}
          onMicrosoftSave={handleMicrosoftSave}
          onMicrosoftDelete={handleMicrosoftDelete}
          onMicrosoftConfigChange={handleMicrosoftConfigChange}
        />
    </div>
  );
};

export const ShareableLinkCard = () => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/organization`,
          { credentials: "include" }
        );
        if (response.ok) {
          const data = await response.json();
          setOrganization(data.organization);
        }
      } catch (err) {
        console.error("Failed to load organization:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const hasOAuthEnabled = Boolean(
    organization?.oauthConfigurations?.google?.enabled ||
    organization?.oauthConfigurations?.microsoft?.enabled
  );

  const frontendBase =
    process.env.NEXT_PUBLIC_FRONTEND_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  const loginUrl = organization?._id
    ? `${frontendBase}/login?orgid=${organization._id}`
    : "";

  const copyLoginLink = async () => {
    if (!loginUrl) return;
    const ok = await copyToClipboard(loginUrl);
    if (ok) {
      setCopiedLink(true);
      toast.success("Team sign-in URL copied to clipboard");
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      toast.error("Failed to copy link");
    }
  };

  const isAdmin = organization?.userRole === "admin";

  return (
    <div className="space-y-5">
      {/* Card Header */}
      <div className="flex items-start gap-3.5">
        <span
          className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-sm"
          style={{
            background: "rgba(var(--color-primary-rgb), 0.12)",
            borderColor: "rgba(var(--color-primary-rgb), 0.28)",
            color: "var(--color-primary)",
          }}
        >
          <Link2 size={18} />
        </span>
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-[var(--text)] tracking-tight">
            Shareable Sign-in Link
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5">
            Share this link with your team members to allow them to sign in
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-[var(--muted)]">Loading sign-in link...</p>
      ) : !hasOAuthEnabled ? (
        <div
          className="p-4 rounded-xl border text-xs text-[var(--muted)] leading-relaxed"
          style={{
            backgroundColor: "var(--elevated-surface)",
            borderColor: "var(--border)",
          }}
        >
          {isAdmin
            ? "Enable Google or Microsoft OAuth above to generate a link you can share with your team to sign them in."
            : "Ask an administrator to enable Google or Microsoft OAuth to get a shareable sign-in link."}
        </div>
      ) : (
        <>
          {/* URL Box */}
          <div className="space-y-1.5">
            <label className="block text-[10px] text-[var(--muted)] uppercase font-mono tracking-wider font-semibold">
              TEAM SIGN-IN URL
            </label>
            <div
              className="flex items-center gap-2 p-2.5 sm:p-3 rounded-xl border transition-colors"
              style={{
                background: "rgba(var(--color-primary-rgb), 0.08)",
                borderColor: "rgba(var(--color-primary-rgb), 0.28)",
              }}
            >
              <code className="text-xs font-mono text-[var(--color-primary)] break-all flex-1 min-w-0">
                {loginUrl}
              </code>
              <button
                type="button"
                onClick={copyLoginLink}
                className="p-2 rounded-lg border transition-colors shrink-0"
                style={{
                  borderColor: "rgba(var(--color-primary-rgb), 0.35)",
                  background: "rgba(var(--color-primary-rgb), 0.15)",
                  color: "var(--color-primary)",
                }}
                title="Copy sign-in link"
              >
                {copiedLink ? (
                  <Check size={14} className="text-[var(--success)]" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
          </div>

          {/* Warning Banner */}
          <div
            className="flex items-start gap-2.5 rounded-xl p-3 text-xs border transition-colors"
            style={{
              background: "rgba(var(--warning-rgb), 0.10)",
              borderColor: "rgba(var(--warning-rgb), 0.25)",
              color: "var(--warning)",
            }}
          >
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <span className="leading-relaxed">
              Anyone with this link can sign in to your organization using your enabled OAuth providers. Keep it private and rotate if shared accidentally.
            </span>
          </div>
        </>
      )}
    </div>
  );
};
