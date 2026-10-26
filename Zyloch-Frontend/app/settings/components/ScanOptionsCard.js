"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Save,
  RefreshCw,
  Lock,
} from "lucide-react";
import { getScannerIconComponent } from "@/app/scanops/components/scan/shared/scannerIcons";
import { updatePolicyConfigurations } from "@/lib/api/organization";
import { useTenant } from "@/context/TenantContext";

// Maps each scan-options category → the individual GHAPP scanner keys
// whose policy-configurations should be enabled/disabled together.
const SCAN_ID_TO_SCANNER_KEYS = {
  iac: ['docker', 'kubernetes', 'terraform_aws', 'terraform_azure', 'terraform_gcp', 'bicep', 'ansible', 'cloudformation'],
  workflow: ['workflow'],
  'secret-scanner': ['secret_scanner'],
  sbom: ['sbom'],
  'ai-vs-human': ['ai_vs_human'],
  'skill-scanner': ['skill-scanner'],
};

// Same grouping, but spelled with the canonical scanner keys that license
// entitlements (`entitlements.scanners`) use — kept separate from the map
// above because `useTenant().hasScanner` does a raw key match with no alias
// normalization, unlike the backend write path. Mirrors
// SCAN_ID_TO_LICENSE_SCANNER_KEYS in Zyloch-Backend/controllers/organization.js.
const SCAN_ID_TO_LICENSE_SCANNER_KEYS = {
  workflow: ['workflow'],
  iac: ['docker', 'kubernetes', 'terraform_aws', 'terraform_azure', 'terraform_gcp', 'bicep', 'ansible', 'cloudformation'],
  sbom: ['sbom'],
  'secret-scanner': ['secret_scanner'],
  'ai-vs-human': ['ai_vs_human'],
  // Paid-tier scanners. An unmapped id is treated as "not gated", which showed a
  // Free tenant a toggle for a scan the backend refuses to run.
  'skill-scanner': ['skill-scanner'],
  'cis-agent': ['cis-agent'],
};

export const ScanOptionsCard = ({ isAdmin, orgName }) => {
  const { hasScanner } = useTenant();

  const isScanLicensed = (scanId) => {
    const keys = SCAN_ID_TO_LICENSE_SCANNER_KEYS[scanId];
    return !keys || keys.length === 0 || keys.some((key) => hasScanner(key));
  };

  const [scanConfigurations, setScanConfigurations] = useState({
    workflow: true,
    iac: true,
    sbom: true,
    "secret-scanner": true,
    "ai-vs-human": true,
    "skill-scanner": true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Sync enabled/disabled state to the policy-configurations API so that
  // the overview page immediately reflects the scan-options toggle.
  const syncPolicyConfig = async (scanId, enabled) => {
    const scannerKeys = SCAN_ID_TO_SCANNER_KEYS[scanId];
    if (!scannerKeys) return;
    const scanners = {};
    for (const key of scannerKeys) {
      scanners[key] = { enabled };
    }
    // Tenant-scoped backend rather than a direct browser call to the scanner
    // service, which carried no tenant context or credentials (MT-08).
    try {
      await updatePolicyConfigurations(scanners, false);
    } catch (e) {
      console.error('Failed to sync policy-configurations:', e);
    }
  };

  useEffect(() => {
    fetchScanConfigurations();
  }, []);

  const fetchScanConfigurations = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organization/scans`,
        {
          credentials: "include",
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.scanConfigurations) {
          setScanConfigurations({
            workflow: data.scanConfigurations.workflow ?? true,
            iac: data.scanConfigurations.iac ?? true,
            sbom: data.scanConfigurations.sbom ?? true,
            "secret-scanner": data.scanConfigurations["secret-scanner"] ?? true,
            "ai-vs-human": data.scanConfigurations["ai-vs-human"] ?? true,
            "skill-scanner": data.scanConfigurations["skill-scanner"] ?? true,
          });
        }
      } else {
        const errorData = await response.json();
        setMessage({
          text: errorData.message || "Failed to load scan configurations",
          type: "error",
        });
      }
    } catch (error) {
      setMessage({
        text: "Failed to load scan configurations",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (scanId) => {
    if (!isScanLicensed(scanId)) {
      setMessage({
        text: "This scan isn't included in your plan. Upgrade your license to access it.",
        type: "error",
      });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return;
    }

    if (!isAdmin) {
      setMessage({
        text: "Only administrators can modify scan configurations",
        type: "error",
      });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return;
    }

    const newValue = !scanConfigurations[scanId];

    // Optimistic update
    setScanConfigurations((prev) => ({
      ...prev,
      [scanId]: newValue,
    }));

    const updatedConfig = { ...scanConfigurations, [scanId]: newValue };

    // Prepare backend config (maintain backward compatibility)
    const backendConfig = {
      workflow: updatedConfig.workflow,
      iac: updatedConfig.iac,
      sbom: updatedConfig.sbom,
      "secret-scanner": updatedConfig["secret-scanner"],
      "ai-vs-human": updatedConfig["ai-vs-human"],
      "skill-scanner": updatedConfig["skill-scanner"],
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organization/scans`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ scanConfigurations: backendConfig }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setMessage({
          text: `${scanId.replace(/-/g, " ")} scan ${newValue ? "enabled" : "disabled"} successfully!`,
          type: "success",
        });
        setTimeout(() => setMessage({ text: "", type: "" }), 2000);
        // Mirror the toggle into the per-scanner policy-configurations so the
        // overview page honours the setting without requiring a new scan.
        syncPolicyConfig(scanId, newValue);
      } else {
        // Revert on error
        setScanConfigurations((prev) => ({
          ...prev,
          [scanId]: !newValue,
        }));
        setMessage({
          text: data.message || "Failed to save configuration",
          type: "error",
        });
      }
    } catch (error) {
      // Revert on error
      setScanConfigurations((prev) => ({
        ...prev,
        [scanId]: !newValue,
      }));
      setMessage({
        text: "Network error. Please try again.",
        type: "error",
      });
    }
  };

  const handleSave = async () => {
    if (!isAdmin) return;

    setSaving(true);
    setMessage({ text: "", type: "" });

    const backendConfig = {
      workflow: scanConfigurations.workflow,
      iac: scanConfigurations.iac,
      sbom: scanConfigurations.sbom,
      "secret-scanner": scanConfigurations["secret-scanner"],
      "ai-vs-human": scanConfigurations["ai-vs-human"],
      "skill-scanner": scanConfigurations["skill-scanner"],
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organization/scans`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ scanConfigurations: backendConfig }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setMessage({
          text: "Scan configurations saved successfully!",
          type: "success",
        });
        await fetchScanConfigurations();
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      } else {
        setMessage({
          text: data.message || "Failed to save configurations",
          type: "error",
        });
      }
    } catch (error) {
      setMessage({
        text: "Failed to save scan configurations",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const scanItems = [
    {
      label: "Workflow Scanner",
      id: "workflow",
      icon: getScannerIconComponent("workflow"),
      description: "Analyze CI/CD workflows for security issues",
    },
    {
      label: "IaC Scanner",
      id: "iac",
      icon: getScannerIconComponent("iac"),
      description: "Scan Infrastructure as Code configurations for security vulnerabilities",
      category: "iac"
    },
    {
      label: "SBOM Generator",
      id: "sbom",
      icon: getScannerIconComponent("sbom"),
      description: "Generate Software Bill of Materials for dependencies",
    },
    {
      label: "Secret Scanner",
      id: "secret-scanner",
      icon: getScannerIconComponent("secret-scanner"),
      description: "Detect exposed secrets, API keys, and credentials",
    },
    {
      label: "AI vs Human",
      id: "ai-vs-human",
      icon: getScannerIconComponent("ai-vs-human"),
      description: "Compare AI-generated vs human-written code for anomalies",
    },
    {
      label: "AI Security Scanner",
      id: "skill-scanner",
      icon: getScannerIconComponent("skill-scanner"),
      description: "Detect unsafe instructions, exfiltration, impersonation, and supply-chain risks in agent skills",
    },
  ];


  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <div className="text-center">
          <RefreshCw
            className="animate-spin text-[var(--color-primary)] mx-auto mb-4"
            size={32}
          />
          <p className="text-[var(--muted)]">Loading scan configurations...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ color: "var(--text)" }}
      className="flex flex-col flex-1 w-full min-h-0 h-full"
    >
      <div className="flex flex-col flex-1 w-full min-h-0 h-full">
        <div className="flex-1 w-full overflow-y-auto min-h-0 flex flex-col">
          <div className="flex-1 flex flex-col justify-start">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5 px-3.5 sm:px-6 py-3.5 sm:py-5 flex-1 xl:auto-rows-fr">
              {scanItems.map(({ label, id, icon: Icon, description }, index) => {
                const enabled = scanConfigurations[id];
                const licensed = isScanLicensed(id);
                const canToggle = isAdmin && licensed;
                const lockReason = !licensed
                  ? "Upgrade your license to access this scan"
                  : !isAdmin
                    ? "Only administrators can modify scan configurations"
                    : undefined;

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    title={!licensed ? lockReason : undefined}
                    className={`relative rounded-xl border border-[var(--border)] bg-[var(--surface)] min-h-[200px] sm:min-h-[220px] h-full flex flex-col shadow-sm sm:shadow-md transition-shadow hover:shadow-md ${!licensed ? "opacity-70" : ""
                      }`}
                  >
                    {!licensed && (
                      <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-[var(--elevated-surface)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)]">
                        <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      </div>
                    )}
                    <div className="px-3.5 pt-4 sm:pt-5 md:px-5 flex-1 flex flex-col">
                      <div className="flex items-center justify-between gap-3 mb-3 sm:mb-3.5">
                        <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-[var(--badge-cyan-bg)] flex items-center justify-center text-[var(--color-primary)] shrink-0">
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggle(id)}
                          disabled={!canToggle}
                          aria-pressed={enabled}
                          aria-label={`Toggle ${label}`}
                          title={lockReason}
                          className={`relative h-6 w-[52px] sm:h-7 sm:w-[60px] rounded-full transition-all duration-300 border overflow-hidden shrink-0 ${canToggle ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                            }`}
                          style={{
                            borderColor: "var(--border)",
                            backgroundColor: enabled
                              ? "var(--color-primary)"
                              : "var(--elevated-surface)",
                          }}
                        >
                          <span
                            className={`absolute top-[2px] sm:top-[3px] h-4 w-4 sm:h-5 sm:w-5 rounded-full transition-all duration-300 shadow-[0_1px_6px_rgba(0,0,0,0.25)] ${enabled ? "left-[30px] sm:left-[34px]" : "left-1"
                              }`}
                            style={{
                              backgroundColor: "var(--surface)",
                              border: "1px solid var(--border)",
                            }}
                          />
                        </button>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2 pb-3 sm:pb-4 flex-1 flex flex-col justify-start">
                        <h3 className="text-sm sm:text-base font-semibold leading-snug text-[var(--text)]">
                          {label}
                        </h3>
                        <p className="text-xs sm:text-[13px] leading-relaxed text-[var(--muted)]">
                          {description}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-[var(--border)] px-3.5 md:px-5 py-2.5 sm:py-3 flex items-center justify-between gap-3 min-h-[46px] sm:min-h-[50px] mt-auto">
                      <div
                        className={`inline-flex items-center gap-1.5 rounded-md sm:rounded-lg px-2 sm:px-2.5 py-1 border text-[11px] sm:text-xs shrink-0 ${!licensed
                          ? "bg-[var(--elevated-surface)] border-[var(--border)] text-[var(--muted)]"
                          : enabled
                            ? "bg-[var(--badge-green-bg)] border-[var(--badge-green-border)] text-[var(--badge-green-text)]"
                            : "bg-[var(--badge-cyan-bg)] border-[var(--badge-cyan-border)] text-[var(--muted)]"
                          }`}
                      >
                        {!licensed ? (
                          <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        ) : (
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${enabled ? "bg-[var(--success)]" : "bg-[var(--muted)]"
                              }`}
                          />
                        )}
                        <span>{!licensed ? "Upgrade required" : enabled ? "Enabled" : "Disabled"}</span>
                      </div>
                      <p className="text-[11px] sm:text-xs leading-none text-[var(--muted)] whitespace-nowrap">
                        Last Scanned: Just now
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {message.text && (
              <div
                className={`mx-3.5 sm:mx-6 mb-3 mt-1 rounded-lg border px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm flex items-center gap-2 ${message.type === "success"
                  ? "bg-[rgba(var(--success-rgb),0.1)] border-[rgba(var(--success-rgb),0.3)] text-[var(--success)]"
                  : "bg-[rgba(var(--danger-rgb),0.1)] border-[rgba(var(--danger-rgb),0.3)] text-[var(--danger)]"
                  }`}
              >
                {message.type === "success" ? (
                  <CheckCircle className="h-4 w-4 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="border-t border-dashed border-[var(--border)] rounded-b-xl bg-[var(--surface)]/95 z-30 sticky bottom-0 left-0 w-full backdrop-blur-md shrink-0 mt-auto">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 px-3.5 sm:px-6 md:px-8 py-3 sm:py-4">
            <div>
              <p className="text-xs text-[var(--text)]">
                Scans Enabled:{" "}
                {Object.values(scanConfigurations).filter(Boolean).length}/
                {Object.keys(scanConfigurations).length}
              </p>
              <div className="mt-1.5 flex items-center gap-2 text-xs text-[var(--text)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
                Auto-save on each toggle
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={!isAdmin || saving}
              className={`h-9 sm:h-10 px-5 sm:px-6 rounded-lg text-sm sm:text-base font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm sm:shadow-md border-2 w-full sm:w-auto shrink-0 ${!isAdmin || saving
                ? "bg-[var(--color-primary)] border-[var(--border)] cursor-not-allowed opacity-60"
                : "bg-[var(--color-primary)] text-[var(--text-on-primary)] border-[var(--color-primary)] hover:opacity-90 cursor-pointer"
                }`}
              style={{ minWidth: 150 }}
            >
              <Save className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{saving ? "Saving..." : "Save Configuration"}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};