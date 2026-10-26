"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import ChartSwitcher from "./ChartSwitcher";

const LanguageDistributionCard = ({
  languageData = [],
  chartType = "bar",
  setChartType,
  colors = ["#06b6d4", "#3b82f6", "#8b5cf6", "#eab308", "#22c55e", "#ef4444"],
}) => {
  const totalLanguages = languageData.length;
  const primaryLanguagePct = totalLanguages > 0 ? languageData[0].percentage : 0;
  const secondaryCount = totalLanguages > 1 ? totalLanguages - 1 : 0;

  return (
    <div
      className="rounded-[var(--radius-lg)] p-6 w-full flex flex-col h-full"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h4 className="text-[#06b6d4] text-[11px] font-bold tracking-[0.1em] uppercase mb-2">
            Language Insights
          </h4>
          <h3
            className="text-lg font-bold mb-1"
            style={{ color: "var(--text)" }}
          >
            Language Distribution
          </h3>
          <p className="text-[13px]" style={{ color: "var(--muted)" }}>
            Top programming languages across repositories
          </p>
        </div>
        {setChartType && (
          <ChartSwitcher type={chartType} setType={setChartType} />
        )}
      </div>

      <div className="flex-1 w-full mb-6 relative" style={{ minHeight: '260px', height: '260px' }}>
        {languageData.length > 0 ? (
          chartType === "pie" ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={languageData.map(d => ({ ...d, numericPercentage: parseFloat(d.percentage) || 0 }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="numericPercentage"
                  nameKey="name"
                  fill="#8884d8"
                  label
                >
                  {languageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={["#06b6d4", "#3b82f6", "#8b5cf6", "#eab308", "#22c55e", "#ef4444"][index % 6]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="space-y-4">
              {languageData.map((lang, index) => (
                <div key={index} className="space-y-1.5">
                  <div className="flex justify-between items-center text-[13px] font-medium">
                    <span className="text-[var(--text)]">{lang.name}</span>
                    <span className="text-[#06b6d4]">{lang.percentage}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-[#1e293b] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${lang.percentage}%`, backgroundColor: colors[index % colors.length] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="text-[var(--muted)] text-sm flex justify-center items-center h-full">
            No language data available
          </div>
        )}
      </div>

      <div
        className="pt-6 grid grid-cols-3 text-center mt-auto"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="space-y-1">
          <p className="text-[11px]" style={{ color: "var(--muted)" }}>
            Languages detected
          </p>
          <p className="font-bold text-[18px] text-[var(--text)]">
            {totalLanguages}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[11px]" style={{ color: "var(--muted)" }}>
            Primary language
          </p>
          <p className="font-bold text-[18px] text-[#06b6d4]">
            {primaryLanguagePct}%
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[11px]" style={{ color: "var(--muted)" }}>
            Secondary languages
          </p>
          <p className="font-bold text-[18px] text-[var(--text)]">
            {secondaryCount}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LanguageDistributionCard;
