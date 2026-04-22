import { useState } from "react";
import { mockDocuments } from "@/data/mockData";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const STATUS_TABS = ["all", "pending", "uploaded", "verified", "rejected"];

const STATUS_STYLE = {
  verified: { bg: "#e8f5e9", color: "#2e7d32", icon: "verified" },
  uploaded: { bg: "#e3f2fd", color: "#1565c0", icon: "upload_file" },
  pending:  { bg: "#f5f5f5", color: "#757575", icon: "hourglass_empty" },
  rejected: { bg: "#ffebee", color: "#c62828", icon: "cancel" },
};

export default function Documents() {
  const liveDocuments = useQuery(api.documents.getAll);
  const updateStatusMutation = useMutation(api.documents.updateStatus);

  const allDocs = liveDocuments ?? mockDocuments;

  const [activeTab, setActiveTab] = useState("all");
  const [selected, setSelected] = useState(allDocs[0]);
  const [search, setSearch] = useState("");

  const docs = allDocs.filter((d) => {
    if (activeTab !== "all" && d.status !== activeTab) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = STATUS_TABS.reduce((acc, s) => {
    acc[s] = s === "all" ? allDocs.length : allDocs.filter((d) => d.status === s).length;
    return acc;
  }, {});

  async function updateStatus(docId, status) {
    if (updateStatusMutation) {
      await updateStatusMutation({ id: docId, status });
    }
    // Update selected state optimistically
    if (selected?._id === docId) {
      setSelected((p) => ({ ...p, status }));
    }
  }

  return (
    <div className="p-6 flex flex-col gap-4 h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-950 tracking-tight">Document Queue</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            <span className="font-semibold text-orange-600">{counts.pending} pending</span>
            {" · "}
            <span className="font-semibold text-green-700">{counts.verified} verified</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-outline-variant/30 bg-white text-on-surface-variant hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-sm">upload</span>
            Export
          </button>
          <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-white" style={{ backgroundColor: "#00daf3", color: "#001b44" }}>
            <span className="material-symbols-outlined text-sm">notifications</span>
            Batch Remind
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-outline-variant/30 p-1 shadow-sm">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all"
            style={activeTab === tab
              ? { backgroundColor: "#001b44", color: "#fff" }
              : { color: "#747781" }}
          >
            {tab}
            <span
              className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
              style={activeTab === tab
                ? { backgroundColor: "rgba(255,255,255,0.2)", color: "#fff" }
                : { backgroundColor: "#f2f4f6", color: "#747781" }}
            >
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documents…"
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-outline-variant/30 bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20"
        />
      </div>

      {/* Split layout — fills remaining height */}
      <div className="grid grid-cols-5 gap-4 flex-1 min-h-0">

        {/* Document list — scrollable */}
        <div className="col-span-3 overflow-y-auto space-y-2 pr-1 no-scrollbar">
          {docs.map((doc) => {
            const st = STATUS_STYLE[doc.status] || STATUS_STYLE.pending;
            return (
              <div
                key={doc._id}
                onClick={() => setSelected(doc)}
                className="flex items-center gap-4 bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm"
                style={{ borderColor: selected?._id === doc._id ? "#00daf3" : "#c4c6d2" + "50" }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: st.bg }}>
                  <span className="material-symbols-outlined text-sm" style={{ color: st.color }}>{st.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-background truncate">{doc.name}</p>
                  <p className="text-xs text-on-surface-variant">{doc.type}</p>
                  {doc.uploadedAt && (
                    <p className="text-[10px] text-on-surface-variant mt-0.5">
                      Uploaded {new Date(doc.uploadedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </p>
                  )}
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize flex-shrink-0"
                  style={{ backgroundColor: st.bg, color: st.color }}
                >
                  {doc.status}
                </span>
                {doc.status === "pending" && (
                  <button
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: "#fff3e0", color: "#e65100" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Remind
                  </button>
                )}
              </div>
            );
          })}

          {docs.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-outline-variant/30 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl text-outline-variant">folder_open</span>
              <p className="text-sm mt-2">No documents found</p>
            </div>
          )}
        </div>

        {/* Right panel — scrollable */}
        <div className="col-span-2 overflow-y-auto space-y-4 no-scrollbar">
          {selected ? (
            <>
              <div className="bg-white rounded-xl border border-outline-variant/30 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-on-background text-sm">{selected.name}</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">{selected.type} Document</p>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                    style={{ backgroundColor: STATUS_STYLE[selected.status]?.bg, color: STATUS_STYLE[selected.status]?.color }}
                  >
                    {selected.status}
                  </span>
                </div>

                {/* Preview placeholder */}
                <div
                  className="w-full h-44 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: "#f2f4f6", border: "2px dashed #c4c6d2" }}
                >
                  {selected.fileUrl ? (
                    <img src={selected.fileUrl} alt={selected.name} className="h-full object-contain rounded" />
                  ) : (
                    <div className="text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-5xl text-outline-variant">description</span>
                      <p className="text-xs mt-1">{selected.status === "pending" ? "Not yet uploaded" : "Preview unavailable"}</p>
                    </div>
                  )}
                </div>

                {selected.notes && (
                  <div className="p-3 rounded-xl mb-4" style={{ backgroundColor: "#ffebee" }}>
                    <p className="text-xs font-semibold" style={{ color: "#c62828" }}>Rejection Note:</p>
                    <p className="text-xs mt-1" style={{ color: "#b71c1c" }}>{selected.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {(selected.status === "uploaded" || selected.status === "rejected") && (
                    <button
                      onClick={() => updateStatus(selected._id, "verified")}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-lg"
                      style={{ backgroundColor: "#e8f5e9", color: "#2e7d32" }}
                    >
                      <span className="material-symbols-outlined text-sm">verified</span>
                      Verify
                    </button>
                  )}
                  {selected.status !== "rejected" && (
                    <button
                      onClick={() => updateStatus(selected._id, "rejected")}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-lg"
                      style={{ backgroundColor: "#ffebee", color: "#c62828" }}
                    >
                      <span className="material-symbols-outlined text-sm">cancel</span>
                      Reject
                    </button>
                  )}
                  {selected.status === "pending" && (
                    <button
                      className="flex-1 text-xs font-semibold py-2.5 rounded-lg"
                      style={{ backgroundColor: "#001b44", color: "#fff" }}
                    >
                      Send Reminder
                    </button>
                  )}
                </div>
              </div>

              {/* AI Verification Insight — navy panel */}
              <div className="rounded-xl p-5 shadow-lg" style={{ background: "linear-gradient(135deg, #001b44 0%, #002f6c 100%)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined icon-fill text-sm" style={{ color: "#00daf3" }}>colors_spark</span>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white">AI Verification Insight</h4>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "#90bafd" }}>
                  {selected.status === "verified"
                    ? <>Document verified successfully. No signs of tampering detected. Confidence: <strong className="text-white">96%</strong></>
                    : selected.status === "rejected"
                    ? "Document appears low-quality. Resolution too low for USCIS standards. Recommend re-scan at 300 DPI+."
                    : selected.status === "uploaded"
                    ? <>Document ready for AI verification. Click <strong className="text-white">Verify</strong> to run automated authenticity check.</>
                    : "This document is still pending. Send a WhatsApp reminder to the applicant to upload it promptly."}
                </p>
                <button
                  className="mt-4 w-full text-xs font-bold py-2 rounded-lg transition-all hover:opacity-90"
                  style={{ backgroundColor: "#00daf3", color: "#001b44" }}
                >
                  Run AI Verification
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-outline-variant/30 p-8 text-center text-on-surface-variant shadow-sm">
              <span className="material-symbols-outlined text-5xl text-outline-variant">description</span>
              <p className="text-sm mt-2">Select a document to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
