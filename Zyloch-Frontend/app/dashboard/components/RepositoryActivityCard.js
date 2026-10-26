"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import ChartSwitcher from "./ChartSwitcher";

const RepositoryActivityCard = ({
  activeRepos = [],
  totalCommits = 0,
  chartType = "bar",
  setChartType,
  colors = ["#06b6d4", "#3b82f6", "#8b5cf6", "#eab308", "#22c55e", "#ef4444"],
}) => {
  const dataToUse = activeRepos.map(r => ({ name: r.name, commits: r.commits || 0 }));
  const avgCommits = dataToUse.length > 0 ? Math.round(totalCommits / dataToUse.length) : 0;
  const peakCommits = dataToUse.length > 0 ? Math.max(...dataToUse.map((d) => d.commits)) : 0;

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
            Commit History
          </h4>
          <h3
            className="text-lg font-bold mb-1"
            style={{ color: "var(--text)" }}
          >
            Repository Activity
          </h3>
          <p className="text-[13px]" style={{ color: "var(--muted)" }}>
            Sample commit counts across repositories
          </p>
        </div>
        {setChartType && (
          <ChartSwitcher type={chartType} setType={setChartType} />
        )}
      </div>

      <div className="flex-1 w-full mb-6 relative" style={{ minHeight: '260px', height: '260px' }}>
        {dataToUse.length > 0 ? (
            chartType === "pie" ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataToUse}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="commits"
                    nameKey="name"
                    fill="#8884d8"
                    label
                  >
                    {dataToUse.map((entry, index) => (
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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dataToUse}
                  margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "var(--muted)", fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "var(--muted)", fontSize: 11 }}
                  />
                  <Bar dataKey="commits" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )
        ) : (
          <div className="text-[var(--muted)] text-sm flex justify-center items-center h-full">
            No activity data available
          </div>
        )}
      </div>

      <div
        className="pt-6 grid grid-cols-4 text-center mt-auto"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="space-y-1">
          <p className="text-[11px]" style={{ color: "var(--muted)" }}>
            Active Repositories
          </p>
          <p className="font-bold text-[18px] text-[var(--text)]">
            {dataToUse.length}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[11px]" style={{ color: "var(--muted)" }}>
            Total Commits
          </p>
          <p className="font-bold text-[18px] text-[#06b6d4]">
            {totalCommits.toLocaleString()}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[11px]" style={{ color: "var(--muted)" }}>
            Avg. Commits
          </p>
          <p className="font-bold text-[18px] text-[#06b6d4]">
            {avgCommits.toLocaleString()}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[11px]" style={{ color: "var(--muted)" }}>
            Peak Repository
          </p>
          <p className="font-bold text-[18px] text-[#06b6d4]">
            {peakCommits.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RepositoryActivityCard;
