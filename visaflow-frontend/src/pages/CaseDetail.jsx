import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { mockCases, mockDocuments, mockActivities, mockPayments } from "@/data/mockData";

const TYPE_ICON = {
  stageChange:     { icon: "sync",          color: "#325f9c" },
  whatsappMessage: { icon: "chat",          color: "#00a884" },
  documentUpload:  { icon: "attach_file",   color: "#e65100" },
  payment:         { icon: "payments",      color: "#2e7d32" },
  voiceCall:       { icon: "call",          color: "#4527a0" },
  note:            { icon: "sticky_note_2", color: "#747781" },
};

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("timeline");
  const [reminders, setReminders] = useState({ docReminder: true, payReminder: true, followup: false });
  const [noteInput, setNoteInput] = useState("");

  // Only call useQuery when id looks like a real Convex ID (not a mock string like "c1")
  const isConvexId = id && id.length > 10;
  const liveCase = useQuery(api.cases.getById, isConvexId ? { id } : "skip");

  const caseDoc = liveCase ?? (mockCases.find((c) => c._id === id) || mockCases[0]);
  const activities = mockActivities.filter((a) => a.caseId === caseDoc._id);
  const documents = mockDocuments.filter((d) => d.caseId === caseDoc._id);
  const payment = mockPayments.find((p) => p.caseId === caseDoc._id);

  const paidPct = payment ? Math.round((payment.paidAmount / payment.totalAmount) * 100) : 0;
  const pendingDocs = documents.filter((d) => d.status === "pending").length;
  const initials = caseDoc.applicantName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="p-6 space-y-4 max-w-[1400px] mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-on-surface-variant">
        <button onClick={() => navigate("/cases")} className="hover:text-primary transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">folder_shared</span>Cases
        </button>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="font-mono text-xs font-semibold">{caseDoc.caseNumber}</span>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="font-semibold text-on-background">{caseDoc.applicantName}</span>
      </nav>

      {/* Status bar */}
      <div className="flex items-center gap-3 bg-white rounded-xl border border-outline-variant/30 px-5 py-3 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-secondary flex-shrink-0" />
        <span className="text-sm font-semibold text-on-background">{caseDoc.status}</span>
        <span className="text-on-surface-variant">·</span>
        <span className="text-sm text-on-surface-variant">{caseDoc.visaType}</span>
        <span className="text-on-surface-variant">·</span>
        <span className="text-sm text-on-surface-variant">{caseDoc.branch} Branch</span>
        <div className="ml-auto flex gap-2">
          <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#e6faf7", color: "#00a884" }}>
            <span className="material-symbols-outlined text-sm">chat</span>WhatsApp
          </button>
          <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#001b44", color: "#fff" }}>
            <span className="material-symbols-outlined text-sm">call</span>Call
          </button>
        </div>
      </div>

      {/* 3-column bento grid */}
      <div className="grid grid-cols-12 gap-4">

        {/* LEFT */}
        <div className="col-span-3 space-y-4">
          {/* Applicant card */}
          <div className="bg-white rounded-xl border border-outline-variant/30 p-5 shadow-sm">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl mb-3 shadow-md" style={{ background: "linear-gradient(135deg, #001b44 0%, #325f9c 100%)" }}>
                {initials}
              </div>
              <h2 className="font-bold text-on-background text-base">{caseDoc.applicantName}</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">{caseDoc.nationality}</p>
              <span className="mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#e6faf7", color: "#00a884" }}>{caseDoc.visaType}</span>
            </div>
            <div className="space-y-0 divide-y divide-outline-variant/20">
              {[
                { label: "Email",  value: caseDoc.email,      icon: "mail" },
                { label: "Phone",  value: caseDoc.phone,      icon: "call" },
                { label: "Case #", value: caseDoc.caseNumber, icon: "tag" },
                { label: "Branch", value: caseDoc.branch,     icon: "location_on" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2 py-2.5">
                  <span className="material-symbols-outlined text-sm text-on-surface-variant flex-shrink-0">{f.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-on-surface-variant">{f.label}</p>
                    <p className="text-xs font-semibold text-on-background truncate">{f.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment card */}
          {payment && (
            <div className="bg-white rounded-xl border border-outline-variant/30 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-on-background">Payment Status</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize" style={payment.status === "paid" ? { backgroundColor: "#e8f5e9", color: "#2e7d32" } : payment.status === "partial" ? { backgroundColor: "#fff3e0", color: "#e65100" } : { backgroundColor: "#ffebee", color: "#c62828" }}>
                  {payment.status}
                </span>
              </div>
              <div className="mb-1 flex justify-between text-xs text-on-surface-variant">
                <span>Progress</span>
                <span className="font-bold text-on-background">{paidPct}%</span>
              </div>
              <div className="h-2.5 bg-surface-container rounded-full overflow-hidden mb-4">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${paidPct}%`, backgroundColor: paidPct === 100 ? "#2e7d32" : "#00daf3" }} />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-surface-container-low rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-on-surface-variant">Paid</p>
                  <p className="text-sm font-bold text-green-700">₹{(payment.paidAmount / 1000).toFixed(1)}k</p>
                </div>
                <div className="bg-surface-container-low rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-on-surface-variant">Pending</p>
                  <p className="text-sm font-bold text-orange-600">₹{(payment.pendingAmount / 1000).toFixed(1)}k</p>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant mb-3">Total: <strong className="text-on-background">₹{(payment.totalAmount / 1000).toFixed(1)}k</strong></p>
              <button className="w-full text-xs font-semibold py-2.5 rounded-lg" style={{ backgroundColor: "#001b44", color: "#fff" }}>Send Payment Link</button>
            </div>
          )}

          {/* Checklist */}
          <div className="bg-white rounded-xl border border-outline-variant/30 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-on-background mb-3">Document Checklist</h3>
            <div className="space-y-2">
              {documents.slice(0, 5).map((d) => (
                <div key={d._id} className="flex items-center gap-2.5 text-xs">
                  <span className="material-symbols-outlined text-sm flex-shrink-0" style={{ color: d.status === "verified" ? "#2e7d32" : d.status === "uploaded" ? "#1565c0" : d.status === "rejected" ? "#c62828" : "#c4c6d2" }}>
                    {d.status === "verified" ? "check_circle" : d.status === "uploaded" ? "upload_file" : d.status === "rejected" ? "cancel" : "radio_button_unchecked"}
                  </span>
                  <span className={d.status === "verified" ? "line-through text-on-surface-variant" : "text-on-background"}>{d.name}</span>
                </div>
              ))}
            </div>
            {pendingDocs > 0 && (
              <button className="w-full mt-3 text-xs font-semibold py-2 rounded-lg" style={{ backgroundColor: "#fff3e0", color: "#e65100" }}>
                Remind About {pendingDocs} Pending Docs
              </button>
            )}
          </div>

          {/* Automation Toggles */}
          <div className="bg-white rounded-xl border border-outline-variant/30 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-on-background mb-3">Local Automations</h3>
            <div className="space-y-3">
              {[
                { key: "docReminder", label: "Document Reminder", icon: "description" },
                { key: "payReminder", label: "Payment Alert",      icon: "payments" },
                { key: "followup",    label: "Follow-up Sequence", icon: "repeat" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">{item.icon}</span>
                    <span className="text-xs text-on-background">{item.label}</span>
                  </div>
                  <button
                    onClick={() => setReminders((p) => ({ ...p, [item.key]: !p[item.key] }))}
                    className="relative w-9 h-5 rounded-full transition-all flex-shrink-0"
                    style={{ backgroundColor: reminders[item.key] ? "#00daf3" : "#c4c6d2" }}
                  >
                    <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: reminders[item.key] ? "18px" : "2px" }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER */}
        <div className="col-span-6">
          <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col" style={{ minHeight: "480px" }}>
            <div className="flex border-b border-outline-variant/30">
              {[{ key: "timeline", label: "Timeline", icon: "timeline" }, { key: "documents", label: "Documents", icon: "attach_file" }, { key: "tasks", label: "Tasks", icon: "task_alt" }].map((t) => (
                <button key={t.key} onClick={() => setActiveTab(t.key)} className="flex items-center gap-1.5 px-5 py-3 text-xs font-semibold transition-all border-b-2" style={activeTab === t.key ? { borderColor: "#001b44", color: "#001b44" } : { borderColor: "transparent", color: "#747781" }}>
                  <span className="material-symbols-outlined text-sm">{t.icon}</span>{t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {activeTab === "timeline" && (
                <div className="relative timeline-line space-y-4 pl-10">
                  {activities.map((a) => {
                    const meta = TYPE_ICON[a.type] || { icon: "push_pin", color: "#747781" };
                    return (
                      <div key={a._id} className="relative">
                        <div className="absolute left-[-30px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm" style={{ backgroundColor: meta.color + "20" }}>
                          <span className="material-symbols-outlined text-sm" style={{ color: meta.color }}>{meta.icon}</span>
                        </div>
                        <div className="bg-surface-container-low rounded-xl p-3.5">
                          <p className="text-xs font-medium text-on-background leading-relaxed">{a.description}</p>
                          <p className="text-[10px] text-on-surface-variant mt-1.5">
                            {new Date(a.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {activities.length === 0 && <p className="text-sm text-on-surface-variant text-center py-8">No activity yet.</p>}
                </div>
              )}

              {activeTab === "documents" && (
                <div className="space-y-2">
                  {documents.map((d) => (
                    <div key={d._id} className="flex items-center gap-3 p-3.5 rounded-xl border border-outline-variant/30 hover:bg-surface-container-low transition-all">
                      <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-sm text-on-surface-variant">description</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-on-background truncate">{d.name}</p>
                        <p className="text-xs text-on-surface-variant">{d.type}{d.notes && ` · ${d.notes}`}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize flex-shrink-0" style={d.status === "verified" ? { backgroundColor: "#e8f5e9", color: "#2e7d32" } : d.status === "rejected" ? { backgroundColor: "#ffebee", color: "#c62828" } : d.status === "uploaded" ? { backgroundColor: "#e3f2fd", color: "#1565c0" } : { backgroundColor: "#f5f5f5", color: "#757575" }}>
                        {d.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "tasks" && (
                <div className="text-center py-12 text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl text-outline-variant">task_alt</span>
                  <p className="text-sm mt-3">No open tasks for this case.</p>
                  <button className="mt-4 text-xs font-semibold px-4 py-2 rounded-lg" style={{ backgroundColor: "#001b44", color: "#fff" }}>Create Task</button>
                </div>
              )}
            </div>

            <div className="border-t border-outline-variant/30 p-4 flex gap-2">
              <input value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder="Add a note or update…" className="flex-1 text-sm px-4 py-2 rounded-lg border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-secondary/20 bg-surface-container-low" />
              <button onClick={() => setNoteInput("")} className="text-sm font-semibold px-4 py-2 rounded-lg" style={{ backgroundColor: "#001b44", color: "#fff" }}>Add</button>
            </div>
          </div>
        </div>

        {/* RIGHT: AI Copilot */}
        <div className="col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant/30" style={{ background: "linear-gradient(135deg, #001b44 0%, #002f6c 100%)" }}>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined icon-fill text-sm" style={{ color: "#00daf3" }}>colors_spark</span>
                <h3 className="text-sm font-bold text-white">AI Copilot</h3>
              </div>
              <p className="text-xs mt-0.5" style={{ color: "#90bafd" }}>Next best actions for this case</p>
            </div>
            <div className="p-4 space-y-3">
              {[
                { priority: "high",   action: "Send employment letter reminder to Infosys HR",     icon: "mail" },
                { priority: "high",   action: "Follow up on IELTS scorecard — deadline in 5 days", icon: "warning" },
                { priority: "medium", action: "Request 6-month bank statement",                     icon: "account_balance" },
                { priority: "low",    action: "Schedule pre-interview preparation call",             icon: "call" },
              ].map((item, i) => (
                <div key={i} className="flex gap-2.5 p-3 rounded-xl border border-outline-variant/30 hover:bg-surface-container-low transition-all">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: item.priority === "high" ? "#ffebee" : item.priority === "medium" ? "#fff3e0" : "#e8f5e9" }}>
                    <span className="material-symbols-outlined text-sm" style={{ color: item.priority === "high" ? "#c62828" : item.priority === "medium" ? "#e65100" : "#2e7d32" }}>{item.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-on-background leading-snug">{item.action}</p>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block" style={item.priority === "high" ? { backgroundColor: "#ffebee", color: "#c62828" } : item.priority === "medium" ? { backgroundColor: "#fff3e0", color: "#e65100" } : { backgroundColor: "#e8f5e9", color: "#2e7d32" }}>
                      {item.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mx-4 mb-4 p-4 rounded-xl" style={{ background: "linear-gradient(135deg, #001b44 0%, #002f6c 100%)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined icon-fill text-sm" style={{ color: "#00daf3" }}>psychology</span>
                <p className="text-xs font-bold text-white">AI Prediction</p>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "#90bafd" }}>
                Based on the profile, this case has a <strong className="text-white">87% close probability</strong> if employment letter is submitted within 48 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
