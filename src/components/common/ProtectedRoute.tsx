import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import type { UserRole } from "../../types/api";
import { useAuth } from "../../features/auth/AuthProvider";
import { getRoleHomePath } from "../../lib/auth-routing";

export function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-infobase-dark">
        <div className="flex flex-col items-center gap-4 animate-fadeIn">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="text-sm font-medium text-white/70">Memuat sesi...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  return <Outlet />;
}
