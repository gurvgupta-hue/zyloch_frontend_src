"use client";

import React, { useMemo, useState } from "react";
import { useNavbar } from "@/hooks/useNavbar";
import { useScanStore } from "@/store/useScanStore";
import { FileCode2, FolderGit2, Clock3, CheckCircle2 } from "lucide-react";
import { formatDuration } from "../overview/utils";
import { LoadingState, ErrorState, EmptyState, FilterBar, FindingsTable } from "../skill-scanner";
import { processCisScanData } from "./utils/dataProcessor";
import SeverityFunnel from "./SeverityFunnel";
import ControlBreakdown from "./ControlBreakdown";
import ScanMetadataOverview from "../shared/ScanMetadataOverview";
import styles from "../workflow/Workflow.module.css";

const getScoreColor = (score) => {
  const num = Number(score) || 0;
  if (num >= 80) return "var(--success)";
  if (num >= 50) return "var(--warning)";
  return "var(--danger)";
};

const SummaryCard = ({ label, value, icon: Icon, color }) => (
  <div
    style={{
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      padding: "16px",
      gap: "12px",
      width: "100%",
      minHeight: "90px",
      background: `color-mix(in srgb, ${color} 4%, var(--surface))`,
      border: `1px solid color-mix(in srgb, ${color} 15%, var(--border))`,
      borderRadius: "16px",
      boxShadow: "var(--shadow-2)",
      transition: "transform 0.15s ease, box-shadow 0.15s ease",
    }}
    className="hover:translate-y-[-2px] hover:shadow-xl"
  >
    <div
      style={{
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "10px",
        background: `color-mix(in srgb, ${color} 12%, var(--surface))`,
        border: `1px solid color-mix(in srgb, ${color} 22%, var(--border))`,
        flexShrink: 0,
      }}
    >
      <Icon style={{ width: "18px", height: "18px", color }} />
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-ui)",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--muted)",
        }}
      >
        {label}
      </p>
      <strong
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: "26px",
          fontWeight: 800,
          lineHeight: 1,
          color,
        }}
      >
        {value}
      </strong>
    </div>
  </div>
);

// Reads the shared scan store: scanops/layout.js fetches (and starts/refreshes)
// the `cis-agent` scan while ?tab=cis is active, so latestScan is the CIS scan.
export default function CisScannerDashboard() {
  const { latestScan, loading, error, startingScan, pollingScan } = useScanStore();
  const { selectedInstallation } = useNavbar();
  const [selectedSeverities, setSelectedSeverities] = useState(["critical", "high", "medium", "low"]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const processedData = useMemo(() => processCisScanData(latestScan), [latestScan]);

  if (startingScan || pollingScan) return <EmptyState title="Scan in Progress" message="Please wait while the CIS scan completes." />;
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!processedData) return <EmptyState title="Scan Not Initiated" message="Start a new CIS scan using the New Scan button above." />;
  if (processedData.scannerSummary.findingsCount === 0 && processedData.cisFindings.length === 0) {
    return <EmptyState title="No CIS Violations Found" message="No CIS AI Agents Companion Guide violations were detected in this scan." />;
  }

  const { scannerSummary, severityData, controlData, totalControlFindings, cisFindings, typeOptions, scanMetadata } = processedData;

  const filteredFindings = cisFindings.filter((finding) => (
    selectedSeverities.includes(finding.severity) &&
    (selectedTypes.length === 0 || selectedTypes.includes(finding.type))
  ));

  const toggleSeverity = (severity) => setSelectedSeverities((current) => current.includes(severity) ? current.filter((item) => item !== severity) : [...current, severity]);
  const selectAllSeverities = () => setSelectedSeverities(["critical", "high", "medium", "low"]);
  const clearAllSeverities = () => setSelectedSeverities([]);
  const toggleType = (type) => setSelectedTypes((current) => current.includes(type) ? current.filter((item) => item !== type) : [...current, type]);
  const selectAllTypes = () => setSelectedTypes(typeOptions.map((type) => type.id));
  const clearAllTypes = () => setSelectedTypes([]);

  const findingsBySeverityTotal = severityData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={styles.pageRoot}>
      <main className={styles.contentWrap}>
        {/* Repository Overview */}
        <ScanMetadataOverview
          scanMetadata={scanMetadata}
          scanType="CIS"
          duration={scannerSummary.duration}
        />

        {/* KPI row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full" aria-label="CIS Scanner summary">
          <SummaryCard
            label="Compliance score"
            value={`${Number(scannerSummary.overallScore || 0).toFixed(1)}%`}
            icon={CheckCircle2}
            color={getScoreColor(scannerSummary.overallScore)}
          />
          <SummaryCard
            label="Total findings"
            value={scannerSummary.findingsCount}
            icon={FileCode2}
            color="var(--high)"
          />
          <SummaryCard
            label="Files scanned"
            value={scannerSummary.filesScanned}
            icon={FolderGit2}
            color="var(--color-primary)"
          />
          <SummaryCard
            label="Scan duration"
            value={formatDuration(scannerSummary.duration)}
            icon={Clock3}
            color="var(--success)"
          />
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2 flex flex-col justify-between items-stretch hover:translate-y-[-2px] hover:shadow-xl transition-all duration-300"
            style={{ minHeight: "280px" }}
          >
            <div className="flex flex-col gap-1 mb-2">
              <h4
                style={{
                  fontFamily: "var(--font-ui)",
                  fontWeight: 700,
                  fontSize: "11px",
                  lineHeight: "16px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  margin: 0,
                }}
              >
                Findings by Severity
              </h4>
              <span className="text-xs text-[var(--muted)]">Understand where your risk is concentrated.</span>
            </div>
            <SeverityFunnel severityData={severityData} />
            <p className="pt-2 text-[11px] text-[var(--muted)]">
              Sized by finding volume, not risk level · {findingsBySeverityTotal} total findings
            </p>
          </div>

          <div
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2 flex flex-col justify-between items-stretch hover:translate-y-[-2px] hover:shadow-xl transition-all duration-300"
            style={{ minHeight: "280px" }}
          >
            <div className="flex flex-col gap-1 mb-2">
              <h4
                style={{
                  fontFamily: "var(--font-ui)",
                  fontWeight: 700,
                  fontSize: "11px",
                  lineHeight: "16px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  margin: 0,
                }}
              >
                Findings by Control
              </h4>
              <span className="text-xs text-[var(--muted)]">Map violations to your CIS security baseline.</span>
            </div>
            <ControlBreakdown controlData={controlData} total={totalControlFindings} />
          </div>
        </section>

        {/* Findings table */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-2">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
            <div>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "var(--font-ui)",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                }}
              >
                CIS findings
              </h2>
              <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                {filteredFindings.length} of {cisFindings.length} findings shown
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-[var(--border)] overflow-visible">
            <FilterBar
              selectedSeverities={selectedSeverities}
              selectedTypes={selectedTypes}
              typeOptions={typeOptions}
              selectedCategories={[]}
              categoryOptions={[]}
              toggleSeverity={toggleSeverity}
              toggleType={toggleType}
              toggleCategory={() => {}}
              selectAllSeverities={selectAllSeverities}
              clearAllSeverities={clearAllSeverities}
              selectAllTypes={selectAllTypes}
              clearAllTypes={clearAllTypes}
              selectAllCategories={() => {}}
              clearAllCategories={() => {}}
              selectedProviders={[]}
              providerOptions={[]}
              totalIssues={filteredFindings.length}
            />
          </div>
          <FindingsTable
            findings={filteredFindings}
            totalFindings={cisFindings.length}
            hideTypeColumn
            repositoryContext={{
              installationId: selectedInstallation?.installationId || latestScan?.installation_id,
              repository: `${scanMetadata.organization || scanMetadata.org_name || ""}/${scanMetadata.repository || scanMetadata.repo_name || ""}`,
              branch: scanMetadata.branch || "main",
            }}
          />
        </section>
      </main>
    </div>
  );
}