const presets = {
  // Lead / Case statuses
  newLead:          { bg: "#e3f2fd", text: "#1565c0" },
  contacted:        { bg: "#e8f5e9", text: "#2e7d32" },
  qualified:        { bg: "#e6faf7", text: "#00a884" },
  documentsPending: { bg: "#fff3e0", text: "#e65100" },
  applicationFiled: { bg: "#ede7f6", text: "#4527a0" },
  decisionPending:  { bg: "#fce4ec", text: "#880e4f" },
  closed:           { bg: "#f5f5f5", text: "#424242" },

  // Document statuses
  pending:  { bg: "#fff3e0", text: "#e65100" },
  uploaded: { bg: "#e3f2fd", text: "#1565c0" },
  verified: { bg: "#e8f5e9", text: "#2e7d32" },
  rejected: { bg: "#ffebee", text: "#c62828" },

  // Payment statuses
  paid:     { bg: "#e8f5e9", text: "#2e7d32" },
  partial:  { bg: "#fff3e0", text: "#e65100" },

  // Channel badges
  whatsapp: { bg: "#e8f5e9", text: "#2e7d32" },
  sms:      { bg: "#e3f2fd", text: "#1565c0" },
  voiceCall:{ bg: "#ede7f6", text: "#4527a0" },
  email:    { bg: "#fce4ec", text: "#880e4f" },

  // Generic
  success:  { bg: "#e8f5e9", text: "#2e7d32" },
  warning:  { bg: "#fff3e0", text: "#e65100" },
  danger:   { bg: "#ffebee", text: "#c62828" },
  info:     { bg: "#e3f2fd", text: "#1565c0" },
  default:  { bg: "#f5f7fb", text: "#5a6278" },
};

const labelMap = {
  newLead: "New Lead",
  documentsPending: "Docs Pending",
  applicationFiled: "App Filed",
  decisionPending: "Decision Pending",
  voiceCall: "Voice",
};

export default function Badge({ label, variant, dot = false }) {
  const key = variant || label?.replace(/\s+/g, "") || "default";
  const style = presets[key] || presets.default;
  const displayLabel = labelMap[key] || label;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: style.text }}
        />
      )}
      {displayLabel}
    </span>
  );
}
