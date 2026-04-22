import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { mockCases } from "@/data/mockData";

const STATUS_STYLE = {
  "In Progress":       { bg: "#e3f2fd", color: "#1565c0", dot: "#1565c0" },
  "Documents Pending": { bg: "#fff3e0", color: "#e65100", dot: "#e65100" },
  "Application Filed": { bg: "#f3e5f5", color: "#6a1b9a", dot: "#6a1b9a" },
  "Decision Pending":  { bg: "#fce4ec", color: "#880e4f", dot: "#880e4f" },
  "Closed":            { bg: "#e8f5e9", color: "#2e7d32", dot: "#2e7d32" },
  "Escalated":         { bg: "#ffebee", color: "#c62828", dot: "#c62828" },
};

export default function Cases() {
  const navigate = useNavigate();
  const liveCases = useQuery(api.cases.getAll);
  const allCases = liveCases ?? mockCases;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");

  const filtered = allCases.filter((c) => {
    const q = search.toLowerCase();
    if (q && !c.applicantName.toLowerCase().includes(q) && !c.caseNumber.toLowerCase().includes(q)) return false;
    if (statusFilter && c.status !== statusFilter) return false;
    if (branchFilter && c.branch !== branchFilter) return false;
    return true;
  });

  function initials(name) {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-950 tracking-tight">Cases</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{allCases.length} total cases</p>
        </div>
        <button
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm"
          style={{ backgroundColor: "#001b44" }}
          onClick={() => navigate("/cases/new")}
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Case
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-outline-variant/30 p-4 shadow-sm flex items-center gap-3 flex-wrap">
        <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 8, background: "#f2f4f6", border: "1px solid #e2e8f0", borderRadius: 8, padding: "0 12px", height: 36 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#94a3b8", flexShrink: 0 }}>search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or case number…"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: "#1e293b" }}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-xs border border-outline-variant/30 rounded-lg px-3 py-2 bg-white text-on-background focus:outline-none">
          <option value="">All Statuses</option>
          {Object.keys(STATUS_STYLE).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="text-xs border border-outline-variant/30 rounded-lg px-3 py-2 bg-white text-on-background focus:outline-none">
          <option value="">All Branches</option>
          {["Mumbai", "Delhi", "Bangalore"].map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <select className="text-xs border border-outline-variant/30 rounded-lg px-3 py-2 bg-white text-on-background focus:outline-none">
          <option>All Visa Types</option>
          {["H-1B", "PR", "Student", "Business", "Family Visa"].map((v) => <option key={v}>{v}</option>)}
        </select>
        {(search || statusFilter || branchFilter) && (
          <button onClick={() => { setSearch(""); setStatusFilter(""); setBranchFilter(""); }} className="text-xs font-semibold text-error hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm">
        <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse", fontSize: 13 }}>
          <colgroup>
            <col style={{ width: "13%" }} />  {/* Case # */}
            <col style={{ width: "20%" }} />  {/* Applicant */}
            <col style={{ width: "10%" }} />  {/* Visa Type */}
            <col style={{ width: "10%" }} />  {/* Branch */}
            <col style={{ width: "16%" }} />  {/* Status */}
            <col style={{ width: "14%" }} />  {/* Counsellor */}
            <col style={{ width: "12%" }} />  {/* Created */}
            <col style={{ width: "8%"  }} />  {/* Action */}
          </colgroup>
          <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <tr>
              {["Case #", "Applicant", "Visa Type", "Branch", "Status", "Counsellor", "Created", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const st = STATUS_STYLE[c.status] || { bg: "#f5f5f5", color: "#757575", dot: "#757575" };
              return (
                <tr key={c._id}
                  style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}
                  onClick={() => navigate(`/cases/${c._id}`)}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: "#64748b" }}>{c.caseNumber}</span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #001b44 0%, #325f9c 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                        {initials(c.applicantName)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 600, color: "#0f172a", fontSize: 13, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.applicantName}</p>
                        <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{c.nationality}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: "#64748b" }}>{c.visaType}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#94a3b8" }}>location_on</span>
                      <span style={{ fontSize: 12, color: "#64748b" }}>{c.branch}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, backgroundColor: st.bg, color: st.color, whiteSpace: "nowrap" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: st.dot, flexShrink: 0 }} />
                      {c.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: "#64748b" }}>
                    {c.counsellorId && c.counsellorId.includes(" ") ? c.counsellorId : "—"}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 12, color: "#64748b" }}>
                    {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <button
                      style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 8, backgroundColor: "#f1f5f9", color: "#001b44", border: "1px solid #e2e8f0", cursor: "pointer", whiteSpace: "nowrap" }}
                      onClick={(e) => { e.stopPropagation(); navigate(`/cases/${c._id}`); }}
                    >
                      View <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl text-outline-variant">folder_open</span>
            <p className="text-sm mt-2 font-medium">No cases found</p>
          </div>
        )}
      </div>
    </div>
  );
}
