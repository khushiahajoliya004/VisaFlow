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

const card = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: "20px 24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  borderLeft: "4px solid",
};

export default function Dashboard() {
  const leads = useQuery(api.leads.getAll);
  const totalLeads = leads?.length ?? 2842;
  const chartData = mockMonthlyData;

  return (
    <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 24, overflowX: "hidden" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "#001b44", fontFamily: "Manrope, sans-serif", margin: 0 }}>Executive Command</h2>
          <p style={{ fontSize: 14, color: "#747781", marginTop: 4 }}>Real-time oversight across all regional branches.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div className="bg-surface-container-low" style={{ padding: "8px 14px", borderRadius: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_today</span>
            <span>Last 30 Days</span>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>expand_more</span>
          </div>
          <div className="bg-surface-container-low" style={{ padding: "8px 14px", borderRadius: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>location_on</span>
            <span>Global Branches</span>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>expand_more</span>
          </div>
          <button style={{ background: "#001b44", color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>filter_list</span>
            Filters
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
        <div style={{ ...card, borderLeftColor: "#001b44" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#747781", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>Total Leads</p>
            <span style={{ background: "#dcfce7", color: "#16a34a", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>+12.4%</span>
          </div>
          <h3 style={{ fontSize: 32, fontWeight: 900, color: "#001b44", margin: 0 }}>{totalLeads.toLocaleString()}</h3>
          <p style={{ fontSize: 12, color: "#747781", marginTop: 6 }}>v.s. 2,528 last month</p>
        </div>

        <div style={{ ...card, borderLeftColor: "#325f9c" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#747781", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>Conversion Rate</p>
            <span style={{ background: "#dcfce7", color: "#16a34a", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>+3.2%</span>
          </div>
          <h3 style={{ fontSize: 32, fontWeight: 900, color: "#001b44", margin: 0 }}>24.8%</h3>
          <div style={{ width: "100%", background: "#f1f5f9", height: 6, borderRadius: 99, marginTop: 14, overflow: "hidden" }}>
            <div style={{ width: "24.8%", height: "100%", background: "#325f9c", borderRadius: 99 }} />
          </div>
        </div>

        <div style={{ ...card, borderLeftColor: "#00daf3" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#747781", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>Revenue Forecast</p>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#00daf3" }}>trending_up</span>
          </div>
          <h3 style={{ fontSize: 32, fontWeight: 900, color: "#001b44", margin: 0 }}>$1.2M</h3>
          <p style={{ fontSize: 12, color: "#747781", marginTop: 6, fontWeight: 500 }}>Projected Q4 Closure</p>
        </div>

        <div style={{ ...card, borderLeftColor: "#93c5fd" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#747781", textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>Active Cases</p>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#2563eb" }}>folder_open</span>
          </div>
          <h3 style={{ fontSize: 32, fontWeight: 900, color: "#001b44", margin: 0 }}>842</h3>
          <p style={{ fontSize: 12, color: "#747781", marginTop: 6 }}>156 requiring immediate attention</p>
        </div>
      </div>

      {/* Chart + AI Insights */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>

        {/* Chart */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: "#001b44", margin: 0 }}>Monthly Lead Volume</h4>
              <p style={{ fontSize: 13, color: "#747781", marginTop: 2 }}>Lead acquisition across all channels</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#001b44" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Organic</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#90bafd" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Referral</span>
              </div>
            </div>
          </div>
          <div style={{ height: 200, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8, padding: "0 4px" }}>
            {(() => {
              const maxTotal = Math.max(...chartData.map(d => d.organic + d.ads));
              const MAX_H = 180;
              return chartData.map((d) => {
                const total = d.organic + d.ads;
                const barH = Math.round((total / maxTotal) * MAX_H);
                const organicPct = Math.round((d.organic / total) * 100);
                return (
                  <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ width: "100%", height: MAX_H, display: "flex", alignItems: "flex-end" }}>
                      <div style={{ width: "100%", height: barH, position: "relative", borderRadius: "6px 6px 0 0", overflow: "hidden" }}>
                        <div style={{ position: "absolute", bottom: 0, width: "100%", height: "100%", background: "rgba(0,27,68,0.12)" }} />
                        <div style={{ position: "absolute", bottom: 0, width: "100%", height: `${organicPct}%`, background: "#001b44", borderRadius: "6px 6px 0 0" }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#747781", textTransform: "uppercase", letterSpacing: "0.05em" }}>{d.month}</span>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="glass-panel" style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.4)", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, right: 0, padding: 16, opacity: 0.08, pointerEvents: "none" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "8rem" }}>psychology</span>
          </div>
          <div style={{ position: "relative", zIndex: 10, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#00daf3" }}>
              <span className="material-symbols-outlined icon-fill" style={{ fontSize: 18 }}>colors_spark</span>
              <h4 style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", margin: 0 }}>AI Insights</h4>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "rgba(255,255,255,0.8)", padding: 14, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", borderLeft: "4px solid #00daf3" }}>
                <h5 style={{ fontSize: 13, fontWeight: 700, color: "#001b44", margin: 0 }}>High-priority Lead Identified</h5>
                <p style={{ fontSize: 11, color: "#434750", marginTop: 4, lineHeight: 1.5 }}>
                  System flagged "TechCorp Visa Project" for potential $200k ARR based on profile match.
                </p>
                <button style={{ marginTop: 8, fontSize: 10, fontWeight: 800, color: "#004f58", textTransform: "uppercase", letterSpacing: "0.05em", background: "none", border: "none", cursor: "pointer", padding: 0 }}>View Case</button>
              </div>
              <div style={{ background: "rgba(255,255,255,0.8)", padding: 14, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", borderLeft: "4px solid #ba1a1a" }}>
                <h5 style={{ fontSize: 13, fontWeight: 700, color: "#001b44", margin: 0 }}>Workflow Bottleneck</h5>
                <p style={{ fontSize: 11, color: "#434750", marginTop: 4, lineHeight: 1.5 }}>
                  Document verification at Toronto Branch is 40% slower than avg. 12 cases pending.
                </p>
                <button style={{ marginTop: 8, fontSize: 10, fontWeight: 800, color: "#ba1a1a", textTransform: "uppercase", letterSpacing: "0.05em", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Resolve Now</button>
              </div>
              <div style={{ background: "rgba(255,255,255,0.8)", padding: 14, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", borderLeft: "4px solid #325f9c" }}>
                <h5 style={{ fontSize: 13, fontWeight: 700, color: "#001b44", margin: 0 }}>Success Rate Prediction</h5>
                <p style={{ fontSize: 11, color: "#434750", marginTop: 4, lineHeight: 1.5 }}>
                  O-1 Visa success probability increased to 94% following latest policy automation update.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regions + Leaderboard */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, paddingBottom: 24 }}>

        {/* Regions */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: "#001b44", margin: "0 0 20px 0" }}>Success Rates by Region</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {REGIONS.map((r) => (
              <div key={r.name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  <span style={{ color: "#334155" }}>{r.name}</span>
                  <span style={{ color: "#001b44" }}>{r.pct}%</span>
                </div>
                <div style={{ height: 7, width: "100%", background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                  <div className={r.barColor} style={{ height: "100%", width: `${r.pct}%`, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: "#001b44", margin: 0 }}>Agent Performance</h4>
            <a href="#" style={{ fontSize: 12, fontWeight: 700, color: "#325f9c", textDecoration: "none" }}>Full Report</a>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {AGENTS.map((agent) => (
              <div key={agent.rank} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 10px", borderRadius: 8, cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ width: 28, textAlign: "center", fontWeight: 700, fontSize: 13, color: "#94a3b8", fontFamily: "Manrope, sans-serif", flexShrink: 0 }}>{agent.rank}</div>
                <img
                  alt={agent.name}
                  style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                  src={agent.photo}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextSibling.style.display = "flex";
                  }}
                />
                <div style={{ width: 38, height: 38, borderRadius: "50%", backgroundColor: agent.bg, display: "none", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                  {agent.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#001b44", margin: 0 }}>{agent.name}</p>
                  <p style={{ fontSize: 11, color: "#747781", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{agent.role}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#001b44", margin: 0 }}>{agent.cases} Cases</p>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", margin: 0 }}>{agent.pct} Success</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
