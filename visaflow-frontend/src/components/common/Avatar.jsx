const COLORS = ["#0f1f3d", "#00c4a0", "#f57c00", "#e53935", "#4527a0", "#1565c0"];

export default function Avatar({ name = "", size = "md", src }) {
  const initials = name.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase();
  const color = COLORS[name.charCodeAt(0) % COLORS.length];

  const sizes = { xs: "w-6 h-6 text-[10px]", sm: "w-7 h-7 text-xs", md: "w-8 h-8 text-xs", lg: "w-10 h-10 text-sm", xl: "w-12 h-12 text-base" };

  if (src) {
    return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover`} />;
  }

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}
