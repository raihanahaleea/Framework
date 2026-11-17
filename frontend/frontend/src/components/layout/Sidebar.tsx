import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard, ClipboardCheck, History, FileText, FileClock,
  UserCircle, LogOut, Users, Building2, DoorOpen, Settings,
  ScrollText, Menu, X, ChevronLeft
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const penghuniNav: NavItem[] = [
  { label: 'Dashboard', path: '/penghuni/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Presensi Kehadiran', path: '/penghuni/presensi', icon: <ClipboardCheck size={18} /> },
  { label: 'Riwayat Presensi', path: '/penghuni/riwayat-presensi', icon: <History size={18} /> },
  { label: 'Pengajuan Izin', path: '/penghuni/pengajuan-izin', icon: <FileText size={18} /> },
  { label: 'Riwayat Izin', path: '/penghuni/riwayat-izin', icon: <FileClock size={18} /> },
  { label: 'Profil Saya', path: '/penghuni/profil', icon: <UserCircle size={18} /> },
];

const fasilNav: NavItem[] = [
  { label: 'Dashboard', path: '/fasil/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Data Penghuni', path: '/fasil/penghuni', icon: <Users size={18} /> },
  { label: 'Monitoring Presensi', path: '/fasil/presensi', icon: <ClipboardCheck size={18} /> },
  { label: 'Riwayat Presensi', path: '/fasil/riwayat-presensi', icon: <History size={18} /> },
  { label: 'Persetujuan Izin', path: '/fasil/pengajuan-izin', icon: <FileText size={18} /> },
  { label: 'Profil Saya', path: '/fasil/profil', icon: <UserCircle size={18} /> },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Data Penghuni', path: '/admin/penghuni', icon: <Users size={18} /> },
  { label: 'Data Fasilitator', path: '/admin/fasil', icon: <Users size={18} /> },
  { label: 'Gedung Asrama', path: '/admin/gedung', icon: <Building2 size={18} /> },
  { label: 'Kamar Asrama', path: '/admin/kamar', icon: <DoorOpen size={18} /> },
  { label: 'Data Presensi', path: '/admin/presensi', icon: <ClipboardCheck size={18} /> },
  { label: 'Persetujuan Izin', path: '/admin/pengajuan-izin', icon: <FileText size={18} /> },
  { label: 'Pengaturan Sistem', path: '/admin/pengaturan', icon: <Settings size={18} /> },
  { label: 'Audit Trail & Log', path: '/admin/audit-log', icon: <ScrollText size={18} /> },
  { label: 'Profil Saya', path: '/admin/profil', icon: <UserCircle size={18} /> },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = user?.role === 'ADMIN' ? adminNav : user?.role === 'FASIL' ? fasilNav : penghuniNav;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleLabel =
    user?.role === 'ADMIN' ? 'Administrator' : user?.role === 'FASIL' ? 'Fasilitator' : 'Warga Asrama';

  const sidebarContent = (
    <>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-inner">
          <div className="sidebar-logo">UA</div>
          {!collapsed && (
            <div className="sidebar-brand-text">
              <div className="sidebar-brand-title">Presensi Asrama</div>
              <div className="sidebar-brand-sub">Universitas Andalas</div>
            </div>
          )}
        </div>
      </div>

      {/* User Info Card */}
      {!collapsed && (
        <div className="sidebar-user-card">
          <div className="sidebar-user-inner">
            <div className="sidebar-user-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{roleLabel}</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav Section Label */}
      {!collapsed && (
        <div className="sidebar-nav-label">Menu Navigasi</div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `sidebar-nav-item${isActive ? ' active' : ''}${collapsed ? ' collapsed-item' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-logout-btn">
          <LogOut size={16} />
          {!collapsed && <span>Keluar Sistem</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="mobile-menu-btn"
        aria-label="Buka Menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className={`mobile-overlay${mobileOpen ? ' visible' : ''}`}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside className={`mobile-sidebar${mobileOpen ? ' open' : ''}`}>
        <button
          onClick={() => setMobileOpen(false)}
          className="mobile-close-btn"
        >
          <X size={20} />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`sidebar${collapsed ? ' collapsed' : ''}`}
        style={{ position: 'relative' }}
      >
        {sidebarContent}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-collapse-btn"
          title={collapsed ? 'Perluas Menu' : 'Ciutkan Menu'}
        >
          <ChevronLeft
            size={13}
            style={{ transition: 'transform 0.2s', transform: collapsed ? 'rotate(180deg)' : 'none' }}
          />
        </button>
      </aside>
    </>
  );
}
