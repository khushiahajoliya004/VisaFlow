import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  const roleLabel = {
    admin: "Admin",
    manager: "Manager",
    counsellor: "Counsellor",
    documentExecutive: "Document Executive",
  }[user?.role] ?? user?.role;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 h-16 w-full border-b border-slate-100 shadow-sm gap-4">

      {/* Search */}
      <div className="flex items-center flex-1 max-w-md bg-slate-50 border border-slate-200 rounded-lg px-3 gap-2 h-9">
        <span className="material-symbols-outlined text-slate-400 shrink-0" style={{ fontSize: 18 }}>search</span>
        <input
          className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          placeholder="Search cases, documents, agents..."
          type="text"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">

        {/* Icon buttons */}
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>notifications</span>
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>help</span>
        </button>

        {/* Divider */}
        <div className="h-7 w-px bg-slate-200 mx-1" />

        {/* User info */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-blue-950 leading-tight">{user?.name ?? "—"}</p>
            <p className="text-[11px] text-slate-400 leading-tight">
              {roleLabel}{user?.branch ? ` · ${user.branch}` : ""}
            </p>
          </div>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-sm select-none shrink-0">
            {initials}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Sign out"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
