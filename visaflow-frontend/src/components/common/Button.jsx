const variants = {
  primary:   { backgroundColor: "#0f1f3d", color: "#fff" },
  secondary: { backgroundColor: "#f5f7fb", color: "#1a1a2e", border: "1px solid #e8ecf4" },
  teal:      { backgroundColor: "#00c4a0", color: "#fff" },
  danger:    { backgroundColor: "#e53935", color: "#fff" },
  ghost:     { backgroundColor: "transparent", color: "#5a6278" },
};

const sizes = {
  sm: "px-3 py-1.5 text-xs rounded-md",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-5 py-2.5 text-sm rounded-lg",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  className = "",
  type = "button",
  icon,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 font-semibold transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${className}`}
      style={variants[variant]}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
