import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout() {
  return (
    // Root: full-viewport flex row — sidebar + content are true siblings, no overlap possible
    <div className="flex h-screen overflow-hidden bg-surface">

      {/* Sidebar occupies a fixed slice on the left */}
      <Sidebar />

      {/* Right column: topbar + scrollable page content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
