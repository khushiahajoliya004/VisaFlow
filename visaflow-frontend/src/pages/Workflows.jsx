import { useState } from "react";
import { mockWorkflows } from "@/data/mockData";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const BLUEPRINTS = [
  { id: "h1b",    name: "H-1B Filing",         icon: "flag",          steps: 6, successRate: 84 },
  { id: "family", name: "Family Sponsorship",   icon: "family_restroom", steps: 5, successRate: 79 },
  { id: "f1",     name: "F-1 Student",          icon: "school",        steps: 4, successRate: 91 },
  { id: "custom", name: "Custom Build",         icon: "build",         steps: 0, successRate: null },
];

const FLOW_NODES = [
  { id: "trigger",  label: "TRIGGER",   sublabel: "New Lead Created",   type: "trigger" },
  { id: "wait1",    label: "WAIT",      sublabel: "2 minutes",          type: "wait" },
  { id: "ai",       label: "AI ACTION", sublabel: "Score & Route Lead", type: "ai" },
  { id: "decision", label: "DECISION",  sublabel: "Score ≥ 70?",        type: "diamond" },
];

export default function Workflows() {
  const liveWorkflows = useQuery(api.workflows.getAll);
  const [localWorkflows, setLocalWorkflows] = useState(mockWorkflows);
  const [selectedBlueprint, setSelectedBlueprint] = useState("h1b");

  const workflows = liveWorkflows ?? localWorkflows;

  function toggleWorkflow(id) {
    setLocalWorkflows((prev) => prev.map((w) => w._id === id ? { ...w, isActive: !w.isActive } : w));
  }

  return (
    <div className="p-6 grid grid-cols-12 gap-4 h-full overflow-hidden">

      {/* ── LEFT: Active automations ── */}
      <div className="col-span-3 space-y-4 overflow-y-auto no-scrollbar">
        <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-outline-variant/30">
            <h2 className="text-sm font-bold text-on-background">Active Automations</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {workflows.filter((w) => w.isActive).length} of {workflows.length} running
            </p>
          </div>

          <div className="divide-y divide-outline-variant/20">
            {workflows.map((w) => (
              <div key={w._id} className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-semibold text-on-background leading-tight flex-1 pr-2">{w.name}</p>
                  <button
                    onClick={() => toggleWorkflow(w._id)}
                    className="relative w-9 h-5 rounded-full transition-all flex-shrink-0"
                    style={{ backgroundColor: w.isActive ? "#00daf3" : "#c4c6d2" }}
                  >
                    <span
                      className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                      style={{ left: w.isActive ? "18px" : "2px" }}
                    />
                  </button>
                </div>
                <p className="text-[10px] text-on-surface-variant font-mono">{w.trigger}</p>
                {w.successRate && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 rounded-full bg-surface-container overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${w.successRate}%`, backgroundColor: "#00daf3" }} />
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: "#00a884" }}>{w.successRate}%</span>
                  </div>
                )}
                {w.lastRun && (
                  <p className="text-[10px] text-on-surface-variant mt-1">
                    Last run: {new Date(w.lastRun).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="p-4">
            <button className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-lg" style={{ backgroundColor: "#001b44", color: "#fff" }}>
              <span className="material-symbols-outlined text-sm">add</span>
              New Workflow
            </button>
          </div>
        </div>
      </div>

      {/* ── CENTER: Visual Canvas ── */}
      <div className="col-span-6 space-y-4 overflow-y-auto no-scrollbar">
        <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-outline-variant/30 flex items-center justify-between">
            <h2 className="text-sm font-bold text-on-background">Workflow Canvas</h2>
            <div className="flex gap-2">
              <button className="text-xs border border-outline-variant/30 rounded-lg px-3 py-1.5 text-on-surface-variant hover:bg-surface-container-low transition-colors">
                Preview
              </button>
              <button className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#001b44", color: "#fff" }}>
                Save
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="p-8 flex flex-col items-center min-h-96">
            {FLOW_NODES.map((node, i) => (
              <div key={node.id} className="flex flex-col items-center w-full">
                {node.type === "diamond" ? (
                  <div className="relative my-2">
                    <div
                      className="w-28 h-28 flex items-center justify-center text-center"
                      style={{ transform: "rotate(45deg)", backgroundColor: "#fff", border: "2px solid #001b44", borderRadius: 8 }}
                    >
                      <div style={{ transform: "rotate(-45deg)" }}>
                        <p className="text-[9px] font-bold text-on-background uppercase tracking-wider">{node.label}</p>
                        <p className="text-[9px] text-on-surface-variant mt-0.5">{node.sublabel}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center px-6 py-3 rounded-xl text-center shadow-sm w-48"
                    style={{
                      backgroundColor: node.type === "trigger" ? "#001b44" : node.type === "ai" ? "#e6faf7" : "#fff",
                      border: node.type === "ai" ? "1.5px solid #00daf3" : node.type === "trigger" ? "none" : "1.5px solid #c4c6d2",
                    }}
                  >
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: node.type === "trigger" ? "#fff" : node.type === "ai" ? "#00a884" : "#747781" }}
                    >
                      {node.label}
                    </p>
                    <p
                      className="text-xs font-medium mt-0.5"
                      style={{ color: node.type === "trigger" ? "#90bafd" : "#191c1e" }}
                    >
                      {node.sublabel}
                    </p>
                  </div>
                )}

                {i < FLOW_NODES.length - 1 && <div className="flow-connector my-1" />}
              </div>
            ))}

            {/* Decision branches */}
            <div className="flex gap-8 mt-1">
              <div className="flex flex-col items-center">
                <div className="flow-connector" />
                <div className="flex flex-col items-center px-4 py-2.5 rounded-xl shadow-sm" style={{ backgroundColor: "#e8f5e9", border: "1.5px solid #a5d6a7", minWidth: 120 }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#2e7d32" }}>QUALIFIED</p>
                  <p className="text-xs mt-0.5" style={{ color: "#2e7d32" }}>Send WhatsApp</p>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="flow-connector" />
                <div className="flex flex-col items-center px-4 py-2.5 rounded-xl shadow-sm" style={{ backgroundColor: "#ffebee", border: "1.5px solid #ef9a9a", minWidth: 120 }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#c62828" }}>NOT QUALIFIED</p>
                  <p className="text-xs mt-0.5" style={{ color: "#c62828" }}>Tag &amp; Nurture</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blueprint templates */}
        <div>
          <h3 className="text-sm font-bold text-on-background mb-3">Blueprint Templates</h3>
          <div className="grid grid-cols-4 gap-3">
            {BLUEPRINTS.map((bp) => (
              <button
                key={bp.id}
                onClick={() => setSelectedBlueprint(bp.id)}
                className="bg-white rounded-xl border p-4 text-left transition-all hover:shadow-md"
                style={{ borderColor: selectedBlueprint === bp.id ? "#001b44" : "#c4c6d2" + "50" }}
              >
                <span className="material-symbols-outlined text-2xl text-on-surface-variant">{bp.icon}</span>
                <p className="text-xs font-bold text-on-background mt-2">{bp.name}</p>
                {bp.steps > 0 ? (
                  <p className="text-[10px] text-on-surface-variant mt-1">{bp.steps} steps</p>
                ) : (
                  <p className="text-[10px] text-on-surface-variant mt-1">Build from scratch</p>
                )}
                {bp.successRate && (
                  <p className="text-[10px] font-bold mt-1" style={{ color: "#00a884" }}>{bp.successRate}% success</p>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: AI Insight Pane ── */}
      <div className="col-span-3 space-y-4 overflow-y-auto no-scrollbar">

        {/* AI Insight card */}
        <div className="rounded-xl p-5 shadow-lg" style={{ background: "linear-gradient(135deg, #001b44 0%, #002f6c 100%)" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined icon-fill text-sm" style={{ color: "#00daf3" }}>colors_spark</span>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">AI Workflow Insight</h4>
          </div>
          <p className="text-xs leading-relaxed mb-3" style={{ color: "#90bafd" }}>
            Adding a <strong className="text-white">48-hour WhatsApp follow-up</strong> after the QUALIFIED stage increases conversion by{" "}
            <strong className="text-white">23%</strong> based on your last 90 days data.
          </p>
          <p className="text-xs leading-relaxed mb-4" style={{ color: "#90bafd" }}>
            Click <strong className="text-white">Apply</strong> to auto-insert this step into the current workflow.
          </p>
          <button className="w-full text-xs font-bold py-2 rounded-lg" style={{ backgroundColor: "#00daf3", color: "#001b44" }}>
            Apply Suggestion
          </button>
        </div>

        {/* Performance Overview */}
        <div className="bg-white rounded-xl border border-outline-variant/30 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-on-background mb-3">Performance Overview</h3>
          <div className="space-y-3">
            {[
              { label: "Leads auto-routed",     value: "214",   icon: "sync" },
              { label: "WhatsApp sent",          value: "1,847", icon: "chat" },
              { label: "Documents requested",    value: "392",   icon: "attach_file" },
              { label: "Payments triggered",     value: "78",    icon: "payments" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">{s.icon}</span>
                  <span className="text-xs text-on-surface-variant">{s.label}</span>
                </div>
                <span className="text-sm font-bold text-on-background">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottleneck Alert */}
        <div className="bg-white rounded-xl border border-outline-variant/30 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-on-background mb-3">Bottleneck Alert</h3>
          <div className="space-y-2">
            <div className="p-2.5 rounded-lg" style={{ backgroundColor: "#fff3e0" }}>
              <p className="text-xs font-semibold" style={{ color: "#e65100" }}>Documents Pending</p>
              <p className="text-xs text-on-surface-variant mt-0.5">14 leads stuck for 5+ days</p>
            </div>
            <div className="p-2.5 rounded-lg" style={{ backgroundColor: "#ffebee" }}>
              <p className="text-xs font-semibold" style={{ color: "#c62828" }}>Payment Overdue</p>
              <p className="text-xs text-on-surface-variant mt-0.5">6 cases with overdue payments</p>
            </div>
          </div>
          <button className="w-full mt-3 text-xs font-semibold py-2 rounded-lg" style={{ backgroundColor: "#001b44", color: "#fff" }}>
            Auto-Resolve All
          </button>
        </div>
      </div>
    </div>
  );
}
