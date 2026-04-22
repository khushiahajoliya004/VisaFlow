import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

const VISA_TYPES = ["H-1B", "PR", "Student", "Business", "Family", "O-1", "L-1", "EB-5"];
const COUNTRIES  = ["United States", "Canada", "Australia", "UK", "Germany", "UAE", "Singapore", "New Zealand"];
const SOURCES    = [
  { value: "manual",   label: "Manual Entry" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "metaAds",  label: "Meta Ads" },
  { value: "csv",      label: "CSV Import" },
];

const FIELD = "w-full px-3 py-2.5 text-sm rounded-lg border border-outline-variant/30 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 text-on-background";
const LABEL = "block text-xs font-semibold text-on-surface-variant mb-1";

export default function AddLeadModal({ onClose }) {
  const createLead = useMutation(api.leads.create);

  const [form, setForm] = useState({
    name: "", phone: "", email: "", visaType: "", country: "", budget: "", source: "manual", notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  function set(field, value) {
    setForm((p) => ({ ...p, [field]: value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim())  return setError("Name is required.");
    if (!form.phone.trim()) return setError("Phone number is required.");

    setLoading(true);
    try {
      await createLead({
        name:      form.name.trim(),
        phone:     form.phone.trim(),
        email:     form.email.trim()   || undefined,
        visaType:  form.visaType       || undefined,
        country:   form.country        || undefined,
        budget:    form.budget ? Number(form.budget) : undefined,
        source:    form.source,
        notes:     form.notes.trim()   || undefined,
        status:    "newLead",
        aiScore:   Math.floor(Math.random() * 40) + 50, // 50-90 simulated score
      });
      onClose();
    } catch (err) {
      setError("Failed to create lead. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30" style={{ background: "linear-gradient(135deg, #001b44 0%, #002f6c 100%)" }}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm" style={{ color: "#00daf3" }}>person_add</span>
            <h2 className="text-sm font-bold text-white">Add New Lead</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-xl leading-none">×</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">

          {/* Name + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Full Name <span className="text-red-500">*</span></label>
              <input className={FIELD} placeholder="e.g. Ravi Kumar" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <label className={LABEL}>Phone Number <span className="text-red-500">*</span></label>
              <input className={FIELD} placeholder="+91 98765 43210" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={LABEL}>Email Address</label>
            <input className={FIELD} type="email" placeholder="ravi@email.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>

          {/* Visa Type + Country */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Visa Type</label>
              <select className={FIELD} value={form.visaType} onChange={(e) => set("visaType", e.target.value)}>
                <option value="">Select visa type</option>
                {VISA_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Destination Country</label>
              <select className={FIELD} value={form.country} onChange={(e) => set("country", e.target.value)}>
                <option value="">Select country</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Budget + Source */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Budget (₹)</label>
              <input className={FIELD} type="number" placeholder="e.g. 85000" value={form.budget} onChange={(e) => set("budget", e.target.value)} min="0" />
            </div>
            <div>
              <label className={LABEL}>Lead Source</label>
              <select className={FIELD} value={form.source} onChange={(e) => set("source", e.target.value)}>
                {SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={LABEL}>Notes</label>
            <textarea className={FIELD} rows={3} placeholder="Any initial notes about this lead..." value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>

          {/* AI Score info */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ backgroundColor: "#e6faf7" }}>
            <span className="material-symbols-outlined text-sm" style={{ color: "#00a884" }}>psychology</span>
            <p className="text-xs" style={{ color: "#065f46" }}>
              AI score will be <strong>auto-assigned</strong> when the lead is created.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="px-3 py-2.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: "#ffebee", color: "#c62828" }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-60"
              style={{ backgroundColor: "#001b44" }}
            >
              {loading ? "Creating..." : "Create Lead"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
