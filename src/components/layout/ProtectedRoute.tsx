import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { Role } from '../../types';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-emerald-200 border-t-emerald-700 rounded-full animate-spin" />
          <p className="text-slate-500 text-xs font-medium">Memuat sistem...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center animate-fade-in max-w-sm p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-xl">
            403
          </div>
          <h1 className="text-base font-bold text-slate-900 mb-1">Akses Dibatasi</h1>
          <p className="text-slate-500 text-xs mb-5">Anda tidak memiliki hak akses untuk membuka halaman ini.</p>
          <a href="/" className="inline-block px-5 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors">
            Kembali ke Beranda
          </a>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
