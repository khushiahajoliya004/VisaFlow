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
        <div className="relative flex-1 min-w-48">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or case number…"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-secondary/20 bg-surface-container-low"
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
        <table className="w-full text-sm">
          <thead className="bg-surface-container-low border-b border-outline-variant/30">
            <tr>
              {["Case #", "Applicant", "Visa Type", "Branch", "Status", "Counsellor", "Created", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const st = STATUS_STYLE[c.status] || { bg: "#f5f5f5", color: "#757575", dot: "#757575" };
              return (
                <tr key={c._id} className="border-b border-outline-variant/20 hover:bg-surface-container-low/60 cursor-pointer transition-all last:border-0" onClick={() => navigate(`/cases/${c._id}`)}>
                  <td className="px-4 py-3"><span className="text-xs font-mono font-bold text-on-surface-variant">{c.caseNumber}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ background: "linear-gradient(135deg, #001b44 0%, #325f9c 100%)" }}>
                        {initials(c.applicantName)}
                      </div>
                      <div>
                        <p className="font-semibold text-on-background text-sm">{c.applicantName}</p>
                        <p className="text-[10px] text-on-surface-variant">{c.nationality}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">{c.visaType}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-on-surface-variant">location_on</span>
                      <span className="text-xs text-on-surface-variant">{c.branch}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full w-fit" style={{ backgroundColor: st.bg, color: st.color }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: st.dot }} />
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">{c.counsellorId || "—"}</td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">
                    {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all"
                      style={{ backgroundColor: "#f2f4f6", color: "#001b44" }}
                      onClick={(e) => { e.stopPropagation(); navigate(`/cases/${c._id}`); }}
                    >
                      View <span className="material-symbols-outlined text-sm">arrow_forward</span>
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
