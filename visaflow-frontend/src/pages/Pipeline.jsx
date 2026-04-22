import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import Badge from "@/components/common/Badge";
import Avatar from "@/components/common/Avatar";
import AddLeadModal from "@/components/common/AddLeadModal";
import ConvertToCaseModal from "@/components/common/ConvertToCaseModal";
import { mockLeads } from "@/data/mockData";

const COLUMNS = [
  { key: "newLead",          label: "NEW LEAD",          color: "#1565c0" },
  { key: "contacted",        label: "CONTACTED",         color: "#2e7d32" },
  { key: "qualified",        label: "QUALIFIED",         color: "#00a884" },
  { key: "documentsPending", label: "DOCUMENTS PENDING", color: "#e65100" },
  { key: "applicationFiled", label: "APPLICATION FILED", color: "#4527a0" },
  { key: "decisionPending",  label: "DECISION PENDING",  color: "#880e4f" },
  { key: "closed",           label: "CLOSED",            color: "#424242" },
];

const NEXT_STATUS = {
  newLead: "contacted", contacted: "qualified", qualified: "documentsPending",
  documentsPending: "applicationFiled", applicationFiled: "decisionPending",
  decisionPending: "closed",
};

const FILTER_PILLS = [
  { label: "All Sources", key: "source", value: "" },
  { label: "Meta Ads",    key: "source", value: "metaAds" },
  { label: "WhatsApp",    key: "source", value: "whatsapp" },
  { label: "Manual",      key: "source", value: "manual" },
  { label: "High Score",  key: "score",  value: "high" },
];

export default function Pipeline() {
  const liveLeads = useQuery(api.leads.getAll);
  const updateStatus = useMutation(api.leads.updateStatus);

  const [localLeads, setLocalLeads] = useState(mockLeads);
  const [view, setView] = useState("kanban");
  const [activeFilters, setActiveFilters] = useState({ source: "", score: "" });
  const [aiBarOpen, setAiBarOpen] = useState(true);
  const [dragId, setDragId] = useState(null);
  const [showAddLead, setShowAddLead] = useState(false);
  const [convertLead, setConvertLead] = useState(null);

  // Use live data when available, otherwise local state (mock)
  const isLive = liveLeads !== undefined;
  const leads = isLive ? liveLeads : localLeads;

  const filtered = leads.filter((l) => {
    if (activeFilters.source && l.source !== activeFilters.source) return false;
    if (activeFilters.score === "high" && (l.aiScore || 0) < 75) return false;
    return true;
  });

  function togglePill(pill) {
    setActiveFilters((p) => ({ ...p, [pill.key]: p[pill.key] === pill.value ? "" : pill.value }));
  }

  async function moveStage(leadId) {
    const lead = leads.find((l) => l._id === leadId);
    if (!lead) return;
    const next = NEXT_STATUS[lead.status];
    if (!next) return;
    if (isLive) {
      await updateStatus({ id: leadId, status: next });
    } else {
      setLocalLeads((prev) => prev.map((l) => l._id === leadId ? { ...l, status: next } : l));
    }
  }

  function onDragStart(e, leadId) {
    setDragId(leadId);
    e.dataTransfer.effectAllowed = "move";
  }

  function onDragOver(e) { e.preventDefault(); }

  async function onDrop(e, colKey) {
    e.preventDefault();
    if (!dragId) return;
    const lead = leads.find((l) => l._id === dragId);
    if (!lead || lead.status === colKey) { setDragId(null); return; }
    if (isLive) {
      await updateStatus({ id: dragId, status: colKey });
    } else {
      setLocalLeads((prev) => prev.map((l) => l._id === dragId ? { ...l, status: colKey } : l));
    }
    setDragId(null);
  }

  return (
    <div className="flex flex-col h-full p-6 gap-4 overflow-hidden">

      {showAddLead && <AddLeadModal onClose={() => setShowAddLead(false)} />}
      {convertLead && (
        <ConvertToCaseModal
          lead={convertLead}
          onClose={() => setConvertLead(null)}
          onSuccess={() => setConvertLead(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-950 tracking-tight">Lead Pipeline</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{filtered.length} leads across all stages</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddLead(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg text-white"
            style={{ backgroundColor: "#001b44" }}
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            Add Lead
          </button>
          {[{ v: "kanban", icon: "view_kanban", label: "Kanban" }, { v: "list", icon: "view_list", label: "List" }].map((btn) => (
            <button
              key={btn.v}
              onClick={() => setView(btn.v)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
              style={view === btn.v ? { backgroundColor: "#001b44", color: "#fff" } : { backgroundColor: "#fff", color: "#434750", border: "1px solid #c4c6d2" }}
            >
              <span className="material-symbols-outlined text-sm">{btn.icon}</span>
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-xs font-semibold text-on-surface-variant">Filter:</span>
        {FILTER_PILLS.map((pill) => {
          const isActive = activeFilters[pill.key] === pill.value && pill.value !== "";
          return (
            <button
              key={pill.label}
              onClick={() => togglePill(pill)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
              style={isActive ? { backgroundColor: "#001b44", color: "#fff", borderColor: "#001b44" } : { backgroundColor: "#fff", color: "#434750", borderColor: "#c4c6d2" }}
            >
              {pill.label}
            </button>
          );
        })}
        <button className="px-3 py-1.5 rounded-full text-xs font-semibold border border-outline-variant bg-white text-on-surface-variant">
          <span className="material-symbols-outlined text-sm align-middle mr-1">person</span>Counsellor
        </button>
        <button className="px-3 py-1.5 rounded-full text-xs font-semibold border border-outline-variant bg-white text-on-surface-variant">
          <span className="material-symbols-outlined text-sm align-middle mr-1">public</span>Region
        </button>
      </div>

      {/* Kanban */}
      {view === "kanban" && (
        <div className="kanban-scroll flex gap-3 flex-1 min-h-0 pb-2 overflow-x-auto overflow-y-hidden">
          {COLUMNS.map((col) => {
            const colLeads = filtered.filter((l) => l.status === col.key);
            return (
              <div key={col.key} className="flex-shrink-0 w-56 flex flex-col overflow-hidden" onDragOver={onDragOver} onDrop={(e) => onDrop(e, col.key)}>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: col.color }} />
                  <span className="text-[10px] font-bold tracking-wider" style={{ color: col.color }}>{col.label}</span>
                  <span className="ml-auto text-[10px] font-bold text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded-full">{colLeads.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 min-h-16 pr-0.5 no-scrollbar">
                  {colLeads.map((lead) => (
                    <LeadCard key={lead._id} lead={lead} colKey={col.key} onMove={moveStage} onDragStart={onDragStart} isDragging={dragId === lead._id} onConvert={setConvertLead} />
                  ))}
                  {colLeads.length === 0 && (
                    <div className="rounded-xl border-2 border-dashed border-outline-variant/40 text-center py-6 text-xs text-on-surface-variant">Drop here</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <div className="bg-white rounded-xl border border-outline-variant/30 overflow-auto shadow-sm flex-1 min-h-0">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low border-b border-outline-variant/30">
              <tr>
                {["Name", "Visa Type", "Country", "Source", "Status", "AI Score", "Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l._id} className="border-b border-outline-variant/20 hover:bg-surface-container-low/50 last:border-0">
                  <td className="px-4 py-3 font-medium text-on-background">{l.name}</td>
                  <td className="px-4 py-3 text-on-surface-variant text-xs">{l.visaType}</td>
                  <td className="px-4 py-3 text-on-surface-variant text-xs">{l.country}</td>
                  <td className="px-4 py-3"><Badge label={l.source} variant={l.source} /></td>
                  <td className="px-4 py-3"><Badge label={l.status} variant={l.status} /></td>
                  <td className="px-4 py-3">
                    {l.aiScore !== undefined && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#e6faf7", color: "#00a884" }}>{l.aiScore}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {NEXT_STATUS[l.status] && (
                        <button onClick={() => moveStage(l._id)} className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: "#f2f4f6", color: "#001b44", border: "1px solid #c4c6d2" }}>
                          Move →
                        </button>
                      )}
                      {CONVERT_STAGES.includes(l.status) && (
                        <button onClick={() => setConvertLead(l)} className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: "#001b44", color: "#fff" }}>
                          To Case
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Assistant Bar */}
      {aiBarOpen && (
        <div className="rounded-xl p-4 flex items-center gap-4 flex-shrink-0" style={{ backgroundColor: "#001b44" }}>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="material-symbols-outlined icon-fill text-sm" style={{ color: "#00daf3" }}>colors_spark</span>
            <span className="text-xs font-bold" style={{ color: "#00daf3" }}>AI ASSISTANT</span>
          </div>
          <p className="text-xs text-slate-300 flex-1">
            <strong className="text-white">Suggestion:</strong> 6 leads have an AI score above 80 but haven&apos;t been contacted in 3+ days. Send a WhatsApp follow-up now to boost conversions.
          </p>
          <button className="text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0" style={{ backgroundColor: "#00daf3", color: "#001b44" }}>
            Send WhatsApp Blast
          </button>
          <button onClick={() => setAiBarOpen(false)} className="text-slate-400 hover:text-white text-lg leading-none flex-shrink-0">×</button>
        </div>
      )}
    </div>
  );
}

const CONVERT_STAGES = ["qualified", "documentsPending", "applicationFiled", "decisionPending", "closed"];

function LeadCard({ lead, colKey, onMove, onDragStart, isDragging, onConvert }) {
  const isQualified  = colKey === "qualified";
  const canConvert   = CONVERT_STAGES.includes(colKey);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead._id)}
      className="bg-white rounded-xl border border-outline-variant/30 p-3 hover:shadow-sm transition-all cursor-grab active:cursor-grabbing"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Avatar name={lead.name} size="sm" />
          <div>
            <p className="text-xs font-bold text-on-background leading-tight">{lead.name}</p>
            <p className="text-[10px] text-on-surface-variant">{lead.visaType} · {lead.country}</p>
          </div>
        </div>
        {lead.aiScore !== undefined && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#e6faf7", color: "#00a884" }}>
            {lead.aiScore}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        <Badge label={lead.source} variant={lead.source} />
        {lead.budget && (
          <span className="text-[10px] bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded-full font-medium">
            ₹{(lead.budget / 1000).toFixed(0)}k
          </span>
        )}
      </div>

      {isQualified && (
        <div className="mb-2 p-2 rounded-lg text-[10px]" style={{ backgroundColor: "#e6faf7", color: "#065f46" }}>
          <span className="font-bold" style={{ color: "#00a884" }}>✦ AI REC: </span>
          Request IELTS &amp; Employment docs now — high close probability.
        </div>
      )}

      {/* Move Stage button */}
      {NEXT_STATUS[lead.status] && (
        <button
          onClick={(e) => { e.stopPropagation(); onMove(lead._id); }}
          className="w-full text-[10px] font-semibold py-1.5 rounded-lg transition-all border border-outline-variant/30 hover:bg-surface-container mb-1.5"
          style={{ backgroundColor: "#f2f4f6", color: "#001b44" }}
        >
          Move Stage →
        </button>
      )}

      {/* Convert to Case button — shown from Qualified onwards */}
      {canConvert && (
        <button
          onClick={(e) => { e.stopPropagation(); onConvert(lead); }}
          className="w-full text-[10px] font-bold py-1.5 rounded-lg transition-all flex items-center justify-center gap-1"
          style={{ backgroundColor: "#001b44", color: "#fff" }}
        >
          <span className="material-symbols-outlined text-sm">folder_shared</span>
          Convert to Case
        </button>
      )}
    </div>
  );
}
