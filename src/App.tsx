import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { getRolePath } from './lib/auth';

// Layout & Protected Route
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Feature Pages
import LoginPage from './features/auth/LoginPage';
import PenghuniDashboard from './features/dashboard/PenghuniDashboard';
import FasilDashboard from './features/dashboard/FasilDashboard';
import AdminDashboard from './features/dashboard/AdminDashboard';
import PresensiPage from './features/attendance/PresensiPage';
import RiwayatPresensiPage from './features/attendance/RiwayatPresensiPage';
import MonitoringPresensiPage from './features/attendance/MonitoringPresensiPage';
import PengajuanIzinPage from './features/leave-requests/PengajuanIzinPage';
import RiwayatIzinPage from './features/leave-requests/RiwayatIzinPage';
import LeaveApprovalPage from './features/leave-requests/LeaveApprovalPage';
import ResidentsPage from './features/residents/ResidentsPage';
import FasilPage from './features/residents/FasilPage';
import BuildingsPage from './features/buildings/BuildingsPage';
import RoomsPage from './features/rooms/RoomsPage';
import SettingsPage from './features/settings/SettingsPage';
import AuditLogsPage from './features/audit-logs/AuditLogsPage';
import ProfilePage from './features/profile/ProfilePage';

// Root redirect based on authentication and role
function RootRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-700 rounded-full animate-spin" />
          <p className="text-slate-500 text-xs font-medium">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getRolePath(user.role) + '/dashboard'} replace />;
}

// 404 Page
function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="text-center max-w-sm p-6 bg-white rounded-xl border border-slate-200 shadow-sm animate-fade-in">
        <div className="w-14 h-14 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-xl font-bold mx-auto mb-3">
          404
        </div>
        <h1 className="text-base font-bold text-slate-900 mb-1">Halaman Tidak Ditemukan</h1>
        <p className="text-slate-500 text-xs mb-5">
          Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 bg-emerald-800 text-white font-semibold rounded-lg text-xs hover:bg-emerald-700 transition-colors"
        >
          Kembali ke Beranda
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RootRedirect />} />

          {/* PENGHUNI Routes */}
          <Route element={<ProtectedRoute allowedRoles={['PENGHUNI']} />}>
            <Route path="/penghuni" element={<DashboardLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<PenghuniDashboard />} />
              <Route path="presensi" element={<PresensiPage />} />
              <Route path="riwayat-presensi" element={<RiwayatPresensiPage />} />
              <Route path="pengajuan-izin" element={<PengajuanIzinPage />} />
              <Route path="riwayat-izin" element={<RiwayatIzinPage />} />
              <Route path="profil" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* FASIL Routes */}
          <Route element={<ProtectedRoute allowedRoles={['FASIL', 'ADMIN']} />}>
            <Route path="/fasil" element={<DashboardLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<FasilDashboard />} />
              <Route path="penghuni" element={<ResidentsPage />} />
              <Route path="presensi" element={<MonitoringPresensiPage />} />
              <Route path="riwayat-presensi" element={<MonitoringPresensiPage />} />
              <Route path="pengajuan-izin" element={<LeaveApprovalPage />} />
              <Route path="profil" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* ADMIN Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="penghuni" element={<ResidentsPage />} />
              <Route path="fasil" element={<FasilPage />} />
              <Route path="gedung" element={<BuildingsPage />} />
              <Route path="kamar" element={<RoomsPage />} />
              <Route path="presensi" element={<MonitoringPresensiPage />} />
              <Route path="pengajuan-izin" element={<LeaveApprovalPage />} />
              <Route path="pengaturan" element={<SettingsPage />} />
              <Route path="audit-log" element={<AuditLogsPage />} />
              <Route path="profil" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
