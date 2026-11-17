import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  ClipboardCheck, Calendar, FileText, Sun, Moon,
  MapPin, ArrowRight, Shield, CheckCircle2,
} from 'lucide-react';
import api from '../../lib/api';
import { formatDate, formatTime, getStatusPresensiLabel } from '../../lib/utils';
import type { DashboardPenghuni } from '../../types';
import './PenghuniDashboard.css';

export default function PenghuniDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardPenghuni | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.get('/dashboard/resident');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="penghuni-dash-loading">
        <div className="skel" style={{ height: 28, width: 240, marginBottom: 16 }} />
        <div className="stat-cards-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skel" style={{ height: 90, borderRadius: 12 }} />
          ))}
        </div>
      </div>
    );
  }

  const subuhDone = !!data?.todayAttendance?.subuh;
  const malamDone = !!data?.todayAttendance?.malam;

  // Calculate percentage for donut
  const total = (data?.monthSummary?.hadir || 0) + (data?.monthSummary?.izin || 0) + (data?.monthSummary?.alpa || 0);
  const hadirPct = total > 0 ? Math.round(((data?.monthSummary?.hadir || 0) / total) * 100) : 0;

  return (
    <div className="penghuni-dash animate-fade-in">
      {/* Welcome Banner */}
      <div className="dash-welcome-banner">
        <div className="dash-welcome-left">
          <div className="dash-welcome-badge">
            <Shield size={12} />
            Portal Warga Asrama
          </div>
          <h1 className="dash-welcome-title">
            Selamat datang, {user?.name} <span className="dash-wave">👋</span>
          </h1>
          <p className="dash-welcome-sub">
            NIM: <span className="dash-nim">{user?.nim || '-'}</span> • Pastikan Anda melakukan presensi geofence sesuai jadwal yang ditentukan.
          </p>
        </div>
        <div className="dash-welcome-actions">
          <Link to="/penghuni/presensi" className="btn-primary">
            <ClipboardCheck size={16} />
            Presensi Sekarang
          </Link>
          <Link to="/penghuni/pengajuan-izin" className="btn-outline">
            <FileText size={16} />
            Ajukan Izin
          </Link>
        </div>
      </div>

      {/* Info Grid: 2 column layout */}
      <div className="dash-info-grid">
        {/* Left: Stats and sessions */}
        <div className="dash-info-left">
          {/* Stat Cards Row */}
          <div className="dash-stat-row">
            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-card-label">Lokasi Gedung</span>
                <div className="stat-card-icon">
                  <MapPin size={15} />
                </div>
              </div>
              <div className="stat-card-value">{user?.gedung?.nama || 'Gedung A'}</div>
              <div className="stat-card-sub">Kampus Limau Manis</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <span className="stat-card-label">Nomor Kamar</span>
                <div className="stat-card-icon">
                  <MapPin size={15} />
                </div>
              </div>
              <div className="stat-card-value">{user?.kamar?.nama || 'Kamar 102'}</div>
              <div className="stat-card-sub">Lantai {user?.kamar?.nomorLantai || 1}</div>
            </div>
          </div>

          {/* Session Status */}
          <div className="dash-session-row">
            <div className={`dash-session-card ${subuhDone ? 'done' : 'pending'}`}>
              <div className="dash-session-top">
                <span className="dash-session-label">
                  <Sun size={14} className={subuhDone ? 'icon-success' : 'icon-amber'} />
                  Presensi Subuh
                </span>
                <span className={`status-badge ${subuhDone ? 'hadir' : 'alpa'}`}>
                  {subuhDone ? 'Hadir' : 'Belum'}
                </span>
              </div>
              <p className="dash-session-time">
                {subuhDone ? 'Status: Hadir Valid ✓' : 'Jadwal 04:30 - 07:00 WIB'}
              </p>
            </div>

            <div className={`dash-session-card ${malamDone ? 'done' : 'pending'}`}>
              <div className="dash-session-top">
                <span className="dash-session-label">
                  <Moon size={14} className={malamDone ? 'icon-success' : 'icon-muted'} />
                  Presensi Malam
                </span>
                <span className={`status-badge ${malamDone ? 'hadir' : 'alpa'}`}>
                  {malamDone ? 'Hadir' : 'Belum'}
                </span>
              </div>
              <p className="dash-session-time">
                {malamDone ? 'Status: Hadir Valid ✓' : 'Jadwal 21:00 - 23:00 WIB'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Donut + Monthly Summary */}
        <div className="dash-info-right">
          <div className="card">
            <div className="card-header">
              <div className="card-header-title">
                <Calendar size={15} style={{ color: '#047857' }} />
                Rekap Bulan Ini
              </div>
              <span className="dash-period-label">Bulan Berjalan</span>
            </div>
            <div className="card-body">
              {/* Donut chart visual */}
              <div className="dash-donut-container">
                <div className="dash-donut-chart">
                  <svg viewBox="0 0 36 36" className="dash-donut-svg">
                    {/* Background circle */}
                    <circle cx="18" cy="18" r="15.91549" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                    {/* Hadir */}
                    <circle
                      cx="18" cy="18" r="15.91549" fill="none" stroke="#047857" strokeWidth="3"
                      strokeDasharray={`${hadirPct} ${100 - hadirPct}`} strokeDashoffset="25"
                      strokeLinecap="round"
                    />
                    {/* Izin portion */}
                    {total > 0 && (data?.monthSummary?.izin || 0) > 0 && (
                      <circle
                        cx="18" cy="18" r="15.91549" fill="none" stroke="#f59e0b" strokeWidth="3"
                        strokeDasharray={`${Math.round(((data?.monthSummary?.izin || 0) / total) * 100)} ${100 - Math.round(((data?.monthSummary?.izin || 0) / total) * 100)}`}
                        strokeDashoffset={`${25 - hadirPct}`}
                        strokeLinecap="round"
                      />
                    )}
                  </svg>
                  <div className="dash-donut-center">
                    <span className="dash-donut-pct">{hadirPct}%</span>
                    <span className="dash-donut-label">Kehadiran</span>
                  </div>
                </div>
              </div>

              {/* Summary numbers */}
              <div className="dash-summary-grid">
                <div className="dash-summary-item hadir">
                  <div className="dash-summary-val">{data?.monthSummary?.hadir || 0}</div>
                  <div className="dash-summary-lbl">Hadir</div>
                </div>
                <div className="dash-summary-item izin">
                  <div className="dash-summary-val">{data?.monthSummary?.izin || 0}</div>
                  <div className="dash-summary-lbl">Izin</div>
                </div>
                <div className="dash-summary-item alpa">
                  <div className="dash-summary-val">{data?.monthSummary?.alpa || 0}</div>
                  <div className="dash-summary-lbl">Alpa</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Attendance Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-header-title">
            <ClipboardCheck size={15} style={{ color: '#047857' }} />
            Riwayat Presensi Terakhir
          </div>
          <Link to="/penghuni/riwayat-presensi" className="dash-see-all-link">
            Lihat Semua <ArrowRight size={13} />
          </Link>
        </div>
        {data?.recentAttendance && data.recentAttendance.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Sesi Presensi</th>
                  <th>Waktu Check-In</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentAttendance.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600, color: '#111827' }}>{formatDate(item.tanggalPresensi)}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 500 }}>
                        {item.jenisPresensi === 'SUBUH' ? (
                          <Sun size={13} style={{ color: '#f59e0b' }} />
                        ) : (
                          <Moon size={13} style={{ color: '#6366f1' }} />
                        )}
                        {item.jenisPresensi === 'SUBUH' ? 'Subuh' : 'Malam'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>{formatTime(item.waktu)} WIB</td>
                    <td>
                      <span className={`status-badge ${item.status.toLowerCase()}`}>
                        {getStatusPresensiLabel(item.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <CheckCircle2 size={36} className="empty-state-icon" />
            <p className="empty-state-text">Belum ada rekaman data presensi</p>
          </div>
        )}
      </div>
    </div>
  );
}
