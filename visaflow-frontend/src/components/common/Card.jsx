export default function Card({ children, className = "", onClick, noPad = false }) {
  return (
    <div
      className={`bg-white rounded-xl border border-border shadow-sm transition-all ${noPad ? "" : "p-5"} ${onClick ? "cursor-pointer hover:shadow-md" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
