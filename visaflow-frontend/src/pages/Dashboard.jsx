import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { mockMonthlyData } from "@/data/mockData";

const REGIONS = [
  { name: "North America",   pct: 98, barColor: "bg-primary" },
  { name: "European Union",  pct: 92, barColor: "bg-primary" },
  { name: "South East Asia", pct: 84, barColor: "bg-secondary" },
  { name: "Middle East",     pct: 76, barColor: "bg-secondary" },
];

const AGENTS = [
  {
    rank: "01", name: "Sarah Jenkins", role: "Tier 1 Specialist", cases: 42, pct: "100%",
    photo: "https://lh3.googleusercontent.com/aida-public/AB6AXuA-a8M4Pf0DvgUvEpp20ZQgMWx4PhZp1lefHry74mX8UreGaBNDlDp_p5JZOX0UUIwTvwyVb3B5j9H_DLMizpxuIepDBHBnO8NMpITVPWyAP1LdUAYNU1_ypj-a_Rz2skKV5syLRVGrkYTM036s957BvyxInLqOVXAycVo1CZn16PpL2raulWfY4pMjTbURXVdaLUUlcY46udaJiKcayMzcI6zgrt-c2psdGyLcoU9VxTE36Lf7KmpSyAkl_Qp29x4Q4c0sIxODE2I",
    initials: "SJ", bg: "#325f9c",
  },
  {
    rank: "02", name: "David Miller", role: "EB-5 Senior Consultant", cases: 38, pct: "97%",
    photo: "https://lh3.googleusercontent.com/aida-public/AB6AXuDW7cjGK4sc0N0W5QZCnCSZ3uFkE42z6Avyt1UKbwj6i6jv78zcBVxKDJ2EGCrOKMMwz7eElPn9iA5lwI1Npwy0Zrf6s2fV9U_NrwTfRgQ-UXGwb1ukgUzt1zgiXIBPp5_1321Zbd96AglxAd8psI5uucLDo7MwFFsY-QZ0Eccnayb_-gK-MKyzGdI4fzjErbH-d_SXoJeG65mSEnsYzEy6fYyn4YK8fX_8vzzaykvZVXVjZgywlPdO2gTIv6sVAGiwasRHJ5v2_js",
    initials: "DM", bg: "#001b44",
  },
  {
    rank: "03", name: "Elena Rodriguez", role: "H-1B Liaison", cases: 35, pct: "95%",
    photo: "https://lh3.googleusercontent.com/aida-public/AB6AXuC49UDLcCEkKdpA8XoGVcHrVq9yPU4SV9z7sbzjis7SxCaz8xRh_NixE2ZHSYGekJfET8125KxAyg6Hwzfw09oxQ45ZO54hESQW156AGODS-GE4U3deb97dVhXoebqBKIwW_6DdyHFjRN-oHWL7x7ajAfJNP5xKQTHPSxiQ74aGJBYyNQ6uYm4r8R_iL8Z6niUWsk9-x14ZUqhhKwU_XfrCn4yqxplwqC5iot6pzvNdm-SXP_QukytKAu2JfcVXEwBoeM4YraX2wCc",
    initials: "ER", bg: "#004f58",
  },
];

export default function Dashboard() {
  const leads = useQuery(api.leads.getAll);
  const totalLeads = leads?.length ?? 2842;
  const chartData = mockMonthlyData;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-blue-950 tracking-tight">Executive Command</h2>
          <p className="text-on-surface-variant font-medium mt-1">Real-time oversight across all regional branches.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-surface-container-low px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold text-slate-600 cursor-pointer hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-sm">calendar_today</span>
            <span>Last 30 Days</span>
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </div>
          <div className="bg-surface-container-low px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold text-slate-600 cursor-pointer hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-sm">location_on</span>
            <span>Global Branches</span>
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </div>
          <button className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 hover:bg-primary-container transition-colors">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            Filters
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-primary shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-outline uppercase tracking-wider">Total Leads</p>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">+12.4%</span>
          </div>
          <h3 className="text-3xl font-extrabold text-blue-950">{totalLeads.toLocaleString()}</h3>
          <p className="text-xs text-on-surface-variant mt-2">v.s. 2,528 last month</p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-secondary shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-outline uppercase tracking-wider">Conversion Rate</p>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">+3.2%</span>
          </div>
          <h3 className="text-3xl font-extrabold text-blue-950">24.8%</h3>
          <div className="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
            <div className="bg-secondary h-full rounded-full" style={{ width: "24.8%" }} />
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-tertiary-fixed-dim shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-outline uppercase tracking-wider">Revenue Forecast</p>
            <span className="material-symbols-outlined text-tertiary-fixed-dim">trending_up</span>
          </div>
          <h3 className="text-3xl font-extrabold text-blue-950">$1.2M</h3>
          <p className="text-xs text-on-surface-variant mt-2 font-medium">Projected Q4 Closure</p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border-l-4 border-blue-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-outline uppercase tracking-wider">Active Cases</p>
            <span className="text-blue-600 material-symbols-outlined">folder_open</span>
          </div>
          <h3 className="text-3xl font-extrabold text-blue-950">842</h3>
          <p className="text-xs text-on-surface-variant mt-2">156 requiring immediate attention</p>
        </div>
      </div>

      {/* Chart + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-lg font-bold text-blue-950">Monthly Lead Volume</h4>
              <p className="text-sm text-outline">Lead acquisition across all channels</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs font-semibold text-slate-600">Organic</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary-container" />
                <span className="text-xs font-semibold text-slate-600">Referral</span>
              </div>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 px-2">
            {(() => {
              const maxTotal = Math.max(...chartData.map(d => d.organic + d.ads));
              const MAX_H = 240;
              return chartData.map((d) => {
                const total = d.organic + d.ads;
                const barH = Math.round((total / maxTotal) * MAX_H);
                const organicPct = Math.round((d.organic / total) * 100);
                return (
                  <div key={d.month} className="flex flex-col items-center gap-2 w-full">
                    <div className="w-full relative group" style={{ height: MAX_H, display: "flex", alignItems: "flex-end" }}>
                      <div
                        className="w-full bg-slate-50 rounded-t-lg relative hover:bg-slate-100 transition-colors"
                        style={{ height: barH }}
                      >
                        <div className="absolute bottom-0 w-full bg-primary/20 rounded-t-lg" style={{ height: "100%" }} />
                        <div className="absolute bottom-0 w-full bg-primary rounded-t-lg" style={{ height: `${organicPct}%` }} />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-outline uppercase">{d.month}</span>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="glass-panel p-8 rounded-xl border border-white/40 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined" style={{ fontSize: "9rem" }}>psychology</span>
          </div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2 text-tertiary-fixed-dim">
              <span className="material-symbols-outlined icon-fill">colors_spark</span>
              <h4 className="font-headline font-extrabold uppercase tracking-widest text-xs">AI Insights</h4>
            </div>
            <div className="space-y-4">
              <div className="bg-white/80 p-4 rounded-lg shadow-sm border-l-4 border-tertiary-fixed-dim">
                <h5 className="text-sm font-bold text-blue-950">High-priority Lead Identified</h5>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  System flagged &ldquo;TechCorp Visa Project&rdquo; for potential $200k ARR based on profile match.
                </p>
                <button className="mt-3 text-[10px] font-black text-tertiary-container uppercase tracking-tighter hover:underline">View Case</button>
              </div>
              <div className="bg-white/80 p-4 rounded-lg shadow-sm border-l-4 border-error">
                <h5 className="text-sm font-bold text-blue-950">Workflow Bottleneck</h5>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Document verification at Toronto Branch is 40% slower than avg. 12 cases pending.
                </p>
                <button className="mt-3 text-[10px] font-black text-error uppercase tracking-tighter hover:underline">Resolve Now</button>
              </div>
              <div className="bg-white/80 p-4 rounded-lg shadow-sm border-l-4 border-secondary">
                <h5 className="text-sm font-bold text-blue-950">Success Rate Prediction</h5>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  O-1 Visa success probability increased to 94% following latest policy automation update.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regions + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface-container-low p-8 rounded-xl">
          <h4 className="text-lg font-bold text-blue-950 mb-6">Success Rates by Region</h4>
          <div className="space-y-6">
            {REGIONS.map((r) => (
              <div key={r.name} className="space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-slate-700">{r.name}</span>
                  <span className="text-blue-950">{r.pct}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full">
                  <div className={`h-full ${r.barColor} rounded-full transition-all duration-500`} style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-bold text-blue-950">Agent Performance</h4>
            <a href="#" className="text-xs font-bold text-secondary hover:underline">Full Report</a>
          </div>
          <div className="space-y-4">
            {AGENTS.map((agent) => (
              <div key={agent.rank} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                <div className="w-8 text-center font-headline font-bold text-slate-400">{agent.rank}</div>
                <img
                  alt={agent.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  src={agent.photo}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextSibling.style.display = "flex";
                  }}
                />
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 select-none" style={{ backgroundColor: agent.bg, display: "none" }}>
                  {agent.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-blue-950">{agent.name}</p>
                  <p className="text-xs text-outline truncate">{agent.role}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-blue-950">{agent.cases} Cases</p>
                  <p className="text-[10px] text-green-600 font-bold">{agent.pct} Success</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
