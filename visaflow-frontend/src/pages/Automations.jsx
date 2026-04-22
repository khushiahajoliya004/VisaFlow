import { useState } from "react";
import { mockAutomations } from "@/data/mockData";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const TEMPLATES = [
  {
    id: "ielts", name: "IELTS Reminder Flow", icon: "menu_book",
    description: "Remind qualified leads about IELTS exam prep over 7 days",
    trigger: "lead:qualified", channel: "whatsapp", steps: 3,
    stats: { sent: 214, opened: 187, converted: 48 },
  },
  {
    id: "docs", name: "Doc Follow-up", icon: "attach_file",
    description: "Chase pending documents over a 14-day escalation window",
    trigger: "case:documentsPending", channel: "both", steps: 4,
    stats: { sent: 392, opened: 341, converted: 127 },
  },
  {
    id: "payment", name: "Payment Due Alert", icon: "payments",
    description: "Notify applicants about overdue payments and send link",
    trigger: "payment:pending", channel: "whatsapp", steps: 4,
    stats: { sent: 156, opened: 143, converted: 89 },
  },
];

const ACTION_ICONS  = { send_whatsapp: "chat", create_task: "task_alt", log_note: "sticky_note_2", send_email: "mail", update_lead_status: "sync" };
const ACTION_LABELS = { send_whatsapp: "WhatsApp Message", create_task: "Create Task", log_note: "Log Note", send_email: "Email", update_lead_status: "Update Status" };

function delayLabel(ms) {
  if (!ms) return "Immediately";
  const days = ms / 86400000;
  return days >= 1 ? `After ${days} day${days > 1 ? "s" : ""}` : `After ${ms / 3600000}h`;
}

const CHANNEL_STYLE = {
  whatsapp: { bg: "#e8f5e9", color: "#2e7d32", label: "💬 WhatsApp" },
  email:    { bg: "#fce4ec", color: "#880e4f", label: "✉️ Email" },
  both:     { bg: "#e6faf7", color: "#00a884", label: "📱 Multi-channel" },
};

export default function Automations() {
  const liveAutomations = useQuery(api.automations.getAll);
  const toggleMutation = useMutation(api.automations.toggle);

  const [localAutomations, setLocalAutomations] = useState(mockAutomations);
  const [selected, setSelected] = useState(mockAutomations[0]);

  const automations = liveAutomations ?? localAutomations;

  async function toggle(id) {
    if (toggleMutation) {
      await toggleMutation({ id });
    } else {
      setLocalAutomations((prev) => prev.map((a) => a._id === id ? { ...a, isActive: !a.isActive } : a));
    }
    if (selected?._id === id) setSelected((p) => ({ ...p, isActive: !p.isActive }));
  }

  return (
    <div className="p-6 flex flex-col gap-4 h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-950 tracking-tight">Automations</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {automations.filter((a) => a.isActive).length} active reminders running
          </p>
        </div>
        <button
          className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg text-white"
          style={{ backgroundColor: "#001b44" }}
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Automation
        </button>
      </div>

      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">

        {/* ── LEFT: Active reminders list ── */}
        <div className="col-span-4 space-y-3 overflow-y-auto no-scrollbar">
          <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Active Reminders</h2>

          {automations.map((a) => {
            const ch = CHANNEL_STYLE[a.channel] || CHANNEL_STYLE.whatsapp;
            return (
              <div
                key={a._id}
                onClick={() => setSelected(a)}
                className="bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm"
                style={{ borderColor: selected?._id === a._id ? "#001b44" : "#c4c6d2" + "50" }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 pr-2">
                    <p className="text-sm font-bold text-on-background">{a.name}</p>
                    <p className="text-[10px] font-mono text-on-surface-variant mt-0.5">{a.trigger}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggle(a._id); }}
                    className="relative w-9 h-5 rounded-full transition-all flex-shrink-0"
                    style={{ backgroundColor: a.isActive ? "#00daf3" : "#c4c6d2" }}
                  >
                    <span
                      className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                      style={{ left: a.isActive ? "18px" : "2px" }}
                    />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: ch.bg, color: ch.color }}>
                    {ch.label}
                  </span>
                  <span className="text-[10px] text-on-surface-variant">{a.steps.length} steps</span>
                  <span
                    className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={a.isActive ? { backgroundColor: "#e8f5e9", color: "#2e7d32" } : { backgroundColor: "#f5f5f5", color: "#757575" }}
                  >
                    {a.isActive ? "● Live" : "○ Paused"}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Tip card */}
          <div className="p-4 rounded-xl" style={{ backgroundColor: "#e6faf7", border: "1px solid #b2efe4" }}>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined text-sm" style={{ color: "#00a884" }}>lightbulb</span>
              <p className="text-xs font-bold" style={{ color: "#00a884" }}>TIP</p>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "#065f46" }}>
              Automations with 3-step WhatsApp sequences show <strong>2.4× higher</strong> document submission rates than single reminders.
            </p>
          </div>
        </div>

        {/* ── CENTER: Flow Builder ── */}
        <div className="col-span-5 overflow-y-auto no-scrollbar">
          {selected && (
            <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-outline-variant/30 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-on-background">{selected.name}</h2>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Flow Builder · {selected.steps.length} steps</p>
                </div>
                <button className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#001b44", color: "#fff" }}>
                  Edit Flow
                </button>
              </div>

              <div className="p-5 flex flex-col items-center space-y-0">
                {/* STEP 1: TRIGGER */}
                <FlowNode type="trigger" icon="bolt" label="STEP 1 · TRIGGER" sublabel={selected.trigger} />
                <Connector />

                {selected.steps.map((step, i) => (
                  <div key={i} className="flex flex-col items-center w-full">
                    {step.delay > 0 && (
                      <>
                        <WaitNode delay={step.delay} stepNum={i + 1} />
                        <Connector />
                      </>
                    )}
                    <FlowNode
                      type={step.action === "send_whatsapp" ? "whatsapp" : step.action === "create_task" ? "task" : "action"}
                      icon={ACTION_ICONS[step.action] || "settings"}
                      label={`STEP ${i + (step.delay > 0 ? 2 : 1)} · ${ACTION_LABELS[step.action] || step.action}`}
                      sublabel={step.config ? step.config.substring(0, 50) + "…" : ""}
                    />
                    {i < selected.steps.length - 1 && <Connector />}
                  </div>
                ))}

                <Connector />
                <FlowNode type="end" icon="flag" label="END" sublabel="Sequence complete" />

                <button className="mt-4 text-xs font-semibold px-4 py-2 rounded-lg border border-dashed border-outline-variant text-on-surface-variant hover:text-on-background hover:border-secondary transition-all">
                  + Add Step
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Templates ── */}
        <div className="col-span-3 space-y-3 overflow-y-auto no-scrollbar">
          <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Templates</h2>
          {TEMPLATES.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border border-outline-variant/30 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">{t.icon}</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-background">{t.name}</p>
                  <p className="text-[10px] text-on-surface-variant">{t.steps} steps</p>
                </div>
              </div>
              <p className="text-[10px] text-on-surface-variant mb-3 leading-relaxed">{t.description}</p>
              <div className="grid grid-cols-3 gap-1 mb-3">
                {[
                  { label: "Sent",      value: t.stats.sent },
                  { label: "Opened",    value: t.stats.opened },
                  { label: "Converted", value: t.stats.converted },
                ].map((s) => (
                  <div key={s.label} className="text-center p-1.5 rounded-lg bg-surface-container-low">
                    <p className="text-xs font-bold text-on-background">{s.value}</p>
                    <p className="text-[9px] text-on-surface-variant">{s.label}</p>
                  </div>
                ))}
              </div>
              <button
                className="w-full text-[10px] font-semibold py-2 rounded-lg"
                style={{ backgroundColor: "#e6faf7", color: "#00a884" }}
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FlowNode({ type, icon, label, sublabel }) {
  const styles = {
    trigger:  { bg: "#001b44", border: "#001b44",  labelColor: "#90bafd", subColor: "#fff" },
    whatsapp: { bg: "#e8f5e9", border: "#a5d6a7",  labelColor: "#2e7d32", subColor: "#191c1e" },
    task:     { bg: "#e3f2fd", border: "#90caf9",  labelColor: "#1565c0", subColor: "#191c1e" },
    action:   { bg: "#fff",    border: "#c4c6d2",  labelColor: "#747781", subColor: "#191c1e" },
    end:      { bg: "#f2f4f6", border: "#c4c6d2",  labelColor: "#747781", subColor: "#191c1e" },
  };
  const s = styles[type] || styles.action;

  return (
    <div
      className="w-full max-w-xs rounded-xl px-4 py-3 text-center shadow-sm"
      style={{ backgroundColor: s.bg, border: `1.5px solid ${s.border}` }}
    >
      <div className="flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-sm" style={{ color: s.labelColor }}>{icon}</span>
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: s.labelColor }}>{label}</p>
      </div>
      {sublabel && <p className="text-[10px] mt-0.5 truncate" style={{ color: s.subColor }}>{sublabel}</p>}
    </div>
  );
}

function WaitNode({ delay }) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 rounded-lg"
      style={{ backgroundColor: "#fff3e0", border: "1.5px dashed #ffcc80" }}
    >
      <span className="material-symbols-outlined text-sm" style={{ color: "#e65100" }}>hourglass_empty</span>
      <p className="text-[10px] font-bold" style={{ color: "#e65100" }}>WAIT · {delayLabel(delay)}</p>
    </div>
  );
}

function Connector() {
  return <div className="flow-connector my-1" />;
}
