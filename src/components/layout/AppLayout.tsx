import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Database,
  LayoutDashboard,
  LibraryBig,
  Menu
} from "lucide-react";
import { useAuth } from "../../features/auth/AuthProvider";
import { SidebarLogoutButton } from "./SidebarLogoutButton";

const appItems = [
  { label: "Infobase", path: "/app/infobase", icon: LibraryBig }
] as const;

export function AppLayout() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarW = collapsed ? "w-[60px]" : "w-[220px]";

  return (
    <div className="min-h-screen bg-infobase-pale text-infobase-ink">
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-infobase-dark transition-all duration-300 ${sidebarW} ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-white/10 px-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-infobase-accent">
            <Database size={14} className="text-white" />
          </div>
          {!collapsed ? (
            <span className="truncate text-sm font-bold text-white">Panel {user?.role || "Petugas"}</span>
          ) : null}
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2">
          <NavLink
            to="/"
            onClick={() => setMobileOpen(false)}
            className="mb-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={14} className="shrink-0" />
            {!collapsed ? "Beranda Publik" : null}
          </NavLink>

          <div className="mb-2">
            {!collapsed ? (
              <p className="mb-1 px-2 pt-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
                Aplikasi
              </p>
            ) : (
              <div className="my-2 border-t border-white/10" />
            )}

            {appItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-white/15 text-white"
                        : "text-white/60 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-infobase-accent" />
                      ) : null}
                      <Icon size={16} className="shrink-0" />
                      {!collapsed ? <span className="truncate">{item.label}</span> : null}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {user?.role === "PNS" ? (
            <div className="mb-2">
              {!collapsed ? (
                <p className="mb-1 px-2 pt-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
                  Admin
                </p>
              ) : (
                <div className="my-2 border-t border-white/10" />
              )}
              <NavLink
                to="/admin/dashboard"
                onClick={() => setMobileOpen(false)}
                title={collapsed ? "Panel PNS" : undefined}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <LayoutDashboard size={16} className="shrink-0" />
                {!collapsed ? <span className="truncate">Panel PNS</span> : null}
              </NavLink>
            </div>
          ) : null}
        </nav>

        <SidebarLogoutButton collapsed={collapsed} onLogout={() => setMobileOpen(false)} />

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden h-10 shrink-0 items-center justify-center border-t border-white/10 text-white/40 transition hover:bg-white/10 hover:text-white lg:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      <div className={`transition-all duration-300 ${collapsed ? "lg:pl-[60px]" : "lg:pl-[220px]"}`}>
        <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-infobase-dark/10 bg-white/90 px-4 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-infobase-dark hover:bg-infobase-pale"
            aria-label="Open sidebar"
          >
            <Menu size={18} />
          </button>
          <span className="text-sm font-bold text-infobase-dark">INFOBASE UPPJPDS</span>
        </header>

        <main className="p-4 lg:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
