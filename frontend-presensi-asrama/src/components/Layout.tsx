import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { LogOut, Home, FileText, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Layout = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navItems = {
    PENGHUNI: [
      { path: '/penghuni', label: 'Dashboard', icon: Home },
      { path: '/penghuni/izin', label: 'Izin', icon: FileText },
    ],
    FASIL: [
      { path: '/fasil', label: 'Dashboard', icon: Home },
      { path: '/fasil/warga', label: 'Data Warga', icon: User },
    ],
    ADMIN: [
      { path: '/admin', label: 'Dashboard', icon: Home },
      { path: '/admin/users', label: 'Kelola User', icon: User },
    ],
  }[user.role];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center font-bold">
              P
            </div>
            <span className="font-bold text-lg text-gray-800">Presensi Asrama</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600 hidden md:block">
              Halo, {user.nama} ({user.role})
            </span>
            <button 
              onClick={logout}
              className="text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar/Tabs (Mobile friendly) */}
      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col md:flex-row gap-6">
        {/* Navigation */}
        <aside className="md:w-64 flex-shrink-0">
          <nav className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
            {navItems?.map((item) => {
              const Icon = item.icon;
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-primary-light hover:text-white transition-all whitespace-nowrap"
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
