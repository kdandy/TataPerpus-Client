import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../components/common/ProtectedRoute";
import { AdminLayout } from "../components/layout/AdminLayout";
import { LoginPage } from "../pages/auth/LoginPage";
import { LandingPage } from "../pages/public/LandingPage";
import { AdminDashboard } from "../pages/admin/AdminDashboard";
import { AdminMediaPage } from "../pages/admin/AdminMediaPage";
import { AdminResourcePage } from "../pages/admin/AdminResourcePage";
import { adminConfigs } from "../pages/admin/adminConfigs";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/app/*" element={<Navigate to="/" replace />} />

      <Route element={<ProtectedRoute roles={["PNS"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminResourcePage config={adminConfigs.users} />} />
          <Route path="tata-tertib" element={<AdminResourcePage config={adminConfigs.rules} />} />
          <Route path="kategori-tata-tertib" element={<AdminResourcePage config={adminConfigs.ruleCategories} />} />
          <Route path="pengumuman" element={<AdminResourcePage config={adminConfigs.announcements} />} />
          <Route path="agenda" element={<AdminResourcePage config={adminConfigs.activities} />} />
          <Route path="staff-of-the-month" element={<AdminResourcePage config={adminConfigs.staffOfMonth} />} />
          <Route path="today-officer" element={<AdminResourcePage config={adminConfigs.todayOfficer} />} />
          <Route path="profil-pegawai" element={<AdminResourcePage config={adminConfigs.staff} />} />
          <Route path="profil-ruangan" element={<AdminResourcePage config={adminConfigs.rooms} />} />
          <Route path="media" element={<AdminMediaPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
