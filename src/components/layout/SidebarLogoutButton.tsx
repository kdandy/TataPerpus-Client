import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthProvider";

type SidebarLogoutButtonProps = {
  collapsed?: boolean;
  onLogout?: () => void;
};

export function SidebarLogoutButton({ collapsed = false, onLogout }: SidebarLogoutButtonProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    await logout();
    onLogout?.();
    navigate("/login", { replace: true });
  }

  return (
    <div className="border-t border-white/10 p-2">
      {!collapsed && user ? (
        <div className="mb-2 min-w-0 rounded-lg bg-white/10 px-2.5 py-2">
          <p className="truncate text-xs font-bold text-white">{user.name}</p>
          <p className="mt-0.5 truncate text-[11px] font-semibold text-white/50">{user.role}</p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        title={collapsed ? "Logout" : undefined}
        className="flex h-9 w-full items-center justify-center gap-2 rounded-lg px-2 text-sm font-bold text-white/65 transition hover:bg-red-500/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoggingOut ? <Loader2 size={16} className="shrink-0 animate-spin" /> : <LogOut size={16} className="shrink-0" />}
        {!collapsed ? <span className="truncate">Logout</span> : null}
      </button>
    </div>
  );
}
