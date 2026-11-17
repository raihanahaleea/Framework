import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { Calendar, Clock } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { useState, useEffect } from 'react';
import './DashboardLayout.css';

export default function DashboardLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute clean breadcrumb
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const sectionName = pathSegments[1]
    ? pathSegments[1].replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    : 'Dashboard';

  const roleName = user?.role === 'ADMIN' ? 'ADMIN' : user?.role === 'FASIL' ? 'FASILITATOR' : 'PENGHUNI';

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <div className="dashboard-content-area">
        {/* Top Header Bar */}
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <div className="topbar-breadcrumb">
              <span className="breadcrumb-role">{roleName}</span>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-page">{sectionName}</span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="topbar-time">
              <Clock size={13} className="time-icon" />
              <span>{timeStr}</span>
            </div>
            <div className="topbar-divider" />
            <div className="topbar-date">
              <Calendar size={13} className="date-icon" />
              <span>{formatDate(new Date())}</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
