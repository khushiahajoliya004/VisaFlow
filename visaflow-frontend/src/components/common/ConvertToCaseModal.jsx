import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

const BRANCHES      = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune"];
const NATIONALITIES = ["Indian", "Pakistani", "Bangladeshi", "Sri Lankan", "Nepali", "Nigerian", "Filipino", "Other"];

const FIELD = "w-full px-3 py-2.5 text-sm rounded-lg border border-outline-variant/30 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 text-on-background";
const LABEL = "block text-xs font-semibold text-on-surface-variant mb-1";

function generateCaseNumber() {
  const year = new Date().getFullYear();
  const rand = String(Math.floor(Math.random() * 900) + 100);
  return `VF-${year}-${rand}`;
}

export default function ConvertToCaseModal({ lead, onClose, onSuccess }) {
  const createCase = useMutation(api.cases.create);

  const [branch,      setBranch]      = useState("Mumbai");
  const [nationality, setNationality] = useState("Indian");
  const [notes,       setNotes]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const caseId = await createCase({
        caseNumber:    generateCaseNumber(),
        leadId:        lead._id,
        applicantName: lead.name,
        visaType:      lead.visaType || "General",
        nationality,
        email:         lead.email   || undefined,
        phone:         lead.phone   || undefined,
        branch,
        notes:         notes.trim() || undefined,
        status:        "In Progress",
      });
      onSuccess(caseId);
      onClose();
    } catch (err) {
      setError("Failed to create case. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/30" style={{ background: "linear-gradient(135deg, #001b44 0%, #002f6c 100%)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm" style={{ color: "#00daf3" }}>folder_shared</span>
              <h2 className="text-sm font-bold text-white">Convert to Case</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-xl leading-none">×</button>
          </div>
          <p className="text-xs mt-1" style={{ color: "#90bafd" }}>A full case file will be created for this lead.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Lead summary — read only */}
          <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: "#f2f4f6" }}>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Lead Details (auto-filled)</p>
            {[
              { label: "Name",      value: lead.name },
              { label: "Phone",     value: lead.phone },
              { label: "Visa Type", value: lead.visaType || "—" },
              { label: "Country",   value: lead.country  || "—" },
            ].map((f) => (
              <div key={f.label} className="flex justify-between text-xs">
                <span className="text-on-surface-variant font-medium">{f.label}</span>
                <span className="font-semibold text-on-background">{f.value}</span>
              </div>
            ))}
          </div>

          {/* Branch */}
          <div>
            <label className={LABEL}>Assign Branch <span className="text-red-500">*</span></label>
            <select className={FIELD} value={branch} onChange={(e) => setBranch(e.target.value)}>
              {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Nationality */}
          <div>
            <label className={LABEL}>Nationality <span className="text-red-500">*</span></label>
            <select className={FIELD} value={nationality} onChange={(e) => setNationality(e.target.value)}>
              {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className={LABEL}>Case Notes</label>
            <textarea className={FIELD} rows={2} placeholder="Any initial notes for this case..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg" style={{ backgroundColor: "#e6faf7" }}>
            <span className="material-symbols-outlined text-sm mt-0.5" style={{ color: "#00a884" }}>info</span>
            <p className="text-xs leading-relaxed" style={{ color: "#065f46" }}>
              A unique case number will be auto-generated. The case will appear immediately on the <strong>Cases page</strong>.
            </p>
          </div>

          {error && (
            <div className="px-3 py-2.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: "#ffebee", color: "#c62828" }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-60"
              style={{ backgroundColor: "#001b44" }}
            >
              {loading ? "Creating Case..." : "Convert to Case"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
