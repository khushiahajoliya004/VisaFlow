import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { path: "/dashboard",   label: "Dashboard",  icon: "dashboard" },
  { path: "/pipeline",    label: "Pipeline",   icon: "account_tree" },
  { path: "/cases",       label: "Cases",      icon: "folder_shared" },
  { path: "/documents",   label: "Documents",  icon: "description" },
  { path: "/workflows",   label: "Workflows",  icon: "auto_awesome" },
  { path: "/inbox",       label: "Inbox",      icon: "inbox" },
  { path: "/automations", label: "Automations",icon: "repeat" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside className="w-64 shrink-0 h-screen bg-slate-50 flex flex-col py-6 border-r border-slate-100 overflow-hidden">

      {/* Logo */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg shadow-sm">
            <span className="material-symbols-outlined text-white icon-fill">colors_spark</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-blue-950 tracking-tight leading-none">VisaFlow AI</h1>
            <p className="text-[10px] font-bold text-blue-700/60 tracking-widest uppercase mt-1">Legal Workspace</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar min-h-0">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? "flex items-center gap-3 bg-white text-blue-700 shadow-sm rounded-lg mx-2 my-1 px-4 py-3 text-sm font-semibold tracking-wide transition-transform active:translate-x-1"
                : "flex items-center gap-3 text-slate-600 hover:text-blue-900 hover:bg-slate-100 rounded-lg mx-2 my-1 px-4 py-3 text-sm font-semibold tracking-wide transition-all duration-200"
            }
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-4 mt-auto">
        <button
          onClick={() => navigate("/cases")}
          className="ai-gradient w-full text-white py-3 rounded-xl font-headline font-bold text-sm shadow-lg hover:shadow-primary/20 transition-all"
        >
          New Case
        </button>

        <div className="mt-6 space-y-1">
          <button className="flex items-center gap-3 text-slate-500 hover:text-blue-900 px-4 py-2 text-xs font-semibold w-full">
            <span className="material-symbols-outlined text-sm">settings</span>
            <span>Settings</span>
          </button>
          <button className="flex items-center gap-3 text-slate-500 hover:text-blue-900 px-4 py-2 text-xs font-semibold w-full">
            <span className="material-symbols-outlined text-sm">contact_support</span>
            <span>Support</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-400 hover:text-red-600 px-4 py-2 text-xs font-semibold w-full"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
