import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Database,
  FolderOpen,
  Image,
  LayoutDashboard,
  Megaphone,
  Menu,
  Star,
  UserCheck,
  UserRound,
  Users,
  X,
  DoorOpen
} from "lucide-react";

const sections = [
  {
    label: "Utama",
    items: [
      { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Users", path: "/admin/users", icon: Users }
    ]
  },
  {
    label: "Konten",
    items: [
      { label: "Tata Tertib", path: "/admin/tata-tertib", icon: BookOpen },
      { label: "Kategori", path: "/admin/kategori-tata-tertib", icon: FolderOpen },
      { label: "Pengumuman", path: "/admin/pengumuman", icon: Megaphone },
      { label: "Agenda", path: "/admin/agenda", icon: CalendarDays }
    ]
  },
  {
    label: "People",
    items: [
      { label: "Staff of Month", path: "/admin/staff-of-the-month", icon: Star },
      { label: "Today Officer", path: "/admin/today-officer", icon: UserCheck },
      { label: "Profil Pegawai", path: "/admin/profil-pegawai", icon: UserRound },
      { label: "Profil Ruangan", path: "/admin/profil-ruangan", icon: DoorOpen }
    ]
  },
  {
    label: "Aset",
    items: [
      { label: "Media", path: "/admin/media", icon: Image }
    ]
  }
];

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarW = collapsed ? "w-[60px]" : "w-[220px]";

  return (
    <div className="min-h-screen bg-infobase-pale text-infobase-ink">
      {/* Mobile overlay */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      {/* Sidebar — dark green */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-infobase-dark transition-all duration-300 ${sidebarW} ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-white/10 px-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-infobase-accent">
            <Database size={14} className="text-white" />
          </div>
          {!collapsed ? (
            <span className="truncate text-sm font-bold text-white">Panel PNS</span>
          ) : null}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          <NavLink
            to="/"
            className="mb-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={14} className="shrink-0" />
            {!collapsed ? "Kembali" : null}
          </NavLink>

          {sections.map((section) => (
            <div key={section.label} className="mb-2">
              {!collapsed ? (
                <p className="mb-1 px-2 pt-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
                  {section.label}
                </p>
              ) : (
                <div className="my-2 border-t border-white/10" />
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
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
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden h-10 shrink-0 items-center justify-center border-t border-white/10 text-white/40 transition hover:bg-white/10 hover:text-white lg:flex"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {/* Main content — pale green bg */}
      <div className={`transition-all duration-300 ${collapsed ? "lg:pl-[60px]" : "lg:pl-[220px]"}`}>
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-infobase-dark/10 bg-white/90 px-4 backdrop-blur-xl lg:hidden">
          <button
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
