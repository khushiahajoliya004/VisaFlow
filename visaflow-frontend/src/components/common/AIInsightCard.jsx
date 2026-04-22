export default function AIInsightCard({ title, children, onApply, compact = false }) {
  return (
    <div
      className={`rounded-xl border ${compact ? "p-3" : "p-4"}`}
      style={{ backgroundColor: "#e6faf7", borderColor: "#b2efe4" }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <SparkleIcon />
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#00a884" }}>
            {title || "AI Insight"}
          </span>
        </div>
        {onApply && (
          <button
            onClick={onApply}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-all"
            style={{ backgroundColor: "#00c4a0", color: "#fff" }}
          >
            Apply
          </button>
        )}
      </div>
      <div className="text-sm" style={{ color: "#065f46" }}>
        {children}
      </div>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" fill="#00c4a0" viewBox="0 0 24 24">
      <path d="M12 2l2.4 7.4L22 12l-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6z"/>
    </svg>
  );
}
