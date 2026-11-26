import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, DoorOpen, ClipboardCheck, FileText,
  TrendingUp, Activity, ShieldCheck,
  Clock, ArrowUpRight, SlidersHorizontal
} from 'lucide-react';
import api from '../../lib/api';
import { formatDateTime } from '../../lib/utils';
import type { DashboardAdmin } from '../../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.get('/dashboard/admin');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard animate-pulse">
        <div className="h-24 bg-white border border-slate-200 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Penghuni Aktif',
      value: data?.totalPenghuni || 0,
      icon: <Users size={19} />,
      iconClass: 'icon-emerald',
      note: 'Warga asrama terdaftar aktif',
      link: '/admin/penghuni',
    },
    {
      label: 'Fasilitator Terpilih',
      value: data?.totalFasil || 0,
      icon: <Users size={19} />,
      iconClass: 'icon-teal',
      note: 'Pembina lorong & penanggung jawab',
      link: '/admin/fasil',
    },
    {
      label: 'Kapasitas Kamar',
      value: data?.totalKamar || 0,
      icon: <DoorOpen size={19} />,
      iconClass: 'icon-indigo',
      note: 'Total unit kamar hunian asrama',
      link: '/admin/kamar',
    },
    {
      label: 'Presensi Hadir Hari Ini',
      value: data?.todayAttendance?.hadir || 0,
      icon: <ClipboardCheck size={19} />,
      iconClass: 'icon-green',
      note: 'Sesi subuh & malam tervalidasi',
      link: '/admin/presensi',
    },
    {
      label: 'Pengajuan Izin Menunggu',
      value: data?.pendingLeaveRequests || 0,
      icon: <FileText size={19} />,
      iconClass: 'icon-amber',
      note: 'Perlu ditinjau fasilitator / admin',
      link: '/admin/pengajuan-izin',
    },
  ];

  // Attendance breakdown calculation
  const hadirCount = data?.todayAttendance?.hadir || 0;
  const izinCount = data?.todayAttendance?.izin || 0;
  const alpaCount = data?.todayAttendance?.alpa || 0;
  const totalHariIni = hadirCount + izinCount + alpaCount;

  const hadirPct = totalHariIni > 0 ? Math.round((hadirCount / totalHariIni) * 100) : 0;
  const izinPct = totalHariIni > 0 ? Math.round((izinCount / totalHariIni) * 100) : 0;
  const alpaPct = totalHariIni > 0 ? Math.round((alpaCount / totalHariIni) * 100) : 0;

  return (
    <div className="admin-dashboard animate-fade-in">
      {/* ===== Header Welcome Banner ===== */}
      <div className="admin-banner">
        <div className="admin-banner-left">
          <div className="admin-badge">
            <ShieldCheck size={14} />
            Panel Administrator Utama • UPT Asrama UNAND
          </div>
          <h1 className="admin-title">Dashboard Tata Kelola &amp; Presensi Asrama</h1>
          <p className="admin-subtitle">
            Pusat kendali metrik operasional harian, pemantauan presensi geofence GPS, dan status hunian warga asrama Universitas Andalas.
          </p>
        </div>
        <div className="admin-banner-right">
          <div className="admin-status-pill">
            <span className="admin-status-dot" />
            <span>Sistem Online • Aktif</span>
          </div>
          <span className="admin-period-note">Tahun Akademik 2025/2026</span>
        </div>
      </div>

      {/* ===== Quick Navigation Shortcuts ===== */}
      <div className="admin-shortcuts-bar">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
          Akses Cepat:
        </span>
        <Link to="/admin/penghuni" className="admin-shortcut-btn">
          <Users size={14} className="text-emerald-700" />
          <span>Kelola Penghuni</span>
        </Link>
        <Link to="/admin/fasil" className="admin-shortcut-btn">
          <Users size={14} className="text-teal-700" />
          <span>Data Fasilitator</span>
        </Link>
        <Link to="/admin/kamar" className="admin-shortcut-btn">
          <DoorOpen size={14} className="text-indigo-700" />
          <span>Kamar Asrama</span>
        </Link>
        <Link to="/admin/pengajuan-izin" className="admin-shortcut-btn">
          <FileText size={14} className="text-amber-700" />
          <span>Verifikasi Izin</span>
          {data?.pendingLeaveRequests && data.pendingLeaveRequests > 0 ? (
            <span className="admin-shortcut-badge">{data.pendingLeaveRequests}</span>
          ) : null}
        </Link>
        <Link to="/admin/pengaturan" className="admin-shortcut-btn">
          <SlidersHorizontal size={14} className="text-slate-600" />
          <span>Pengaturan Sesi Presensi</span>
        </Link>
      </div>

      {/* ===== 6 Metrik Stat Cards ===== */}
      <div className="admin-stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="admin-stat-card">
            <div>
              <div className="admin-stat-top">
                <span className="admin-stat-label">{s.label}</span>
                <div className={`admin-stat-icon-wrapper ${s.iconClass}`}>
                  {s.icon}
                </div>
              </div>
              <div className="admin-stat-val">{s.value}</div>
            </div>
            <div className="admin-stat-note">
              <span>{s.note}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ===== Analytics & Today Attendance Row ===== */}
      <div className="admin-analytics-row">
        {/* Attendance Trend Chart */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">
                <TrendingUp size={17} className="text-emerald-700" />
                Tren Kehadiran Penghuni Asrama (7 Hari Terakhir)
              </h2>
              <p className="admin-card-subtitle">
                Perbandingan data kehadiran hadir, izin, dan alpa harian warga asrama
              </p>
            </div>
          </div>

          <div className="admin-chart-box">
            {data?.attendanceTrend && data.attendanceTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={270}>
                <BarChart data={data.attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="hadir" fill="#059669" name="Hadir" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="izin" fill="#d97706" name="Izin" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="alpa" fill="#e11d48" name="Alpa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="admin-empty-state">
                <TrendingUp size={36} className="admin-empty-icon" />
                <p className="admin-empty-text">Belum ada data tren kehadiran 7 hari terakhir</p>
              </div>
            )}
          </div>
        </div>

        {/* Today's Attendance Breakdown */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">
                <Clock size={17} className="text-emerald-700" />
                Rekap Presensi Hari Ini
              </h2>
              <p className="admin-card-subtitle">
                Distribusi status presensi terkini
              </p>
            </div>
          </div>

          <div className="today-summary-list">
            <div className="today-summary-item">
              <div className="today-summary-left">
                <span className="today-indicator-dot dot-hadir" />
                <span className="today-summary-label">Hadir Tervalidasi</span>
              </div>
              <span className="today-summary-val text-emerald-700">{hadirCount}</span>
            </div>

            <div className="today-summary-item">
              <div className="today-summary-left">
                <span className="today-indicator-dot dot-izin" />
                <span className="today-summary-label">Izin / Sakit</span>
              </div>
              <span className="today-summary-val text-amber-700">{izinCount}</span>
            </div>

            <div className="today-summary-item">
              <div className="today-summary-left">
                <span className="today-indicator-dot dot-alpa" />
                <span className="today-summary-label">Belum Presensi (Alpa)</span>
              </div>
              <span className="today-summary-val text-rose-700">{alpaCount}</span>
            </div>
          </div>

          {/* Progress bar visual */}
          {totalHariIni > 0 && (
            <div className="mt-4">
              <div className="today-bar-container">
                <div className="today-bar-segment bar-hadir" style={{ width: `${hadirPct}%` }} title={`Hadir: ${hadirPct}%`} />
                <div className="today-bar-segment bar-izin" style={{ width: `${izinPct}%` }} title={`Izin: ${izinPct}%`} />
                <div className="today-bar-segment bar-alpa" style={{ width: `${alpaPct}%` }} title={`Alpa: ${alpaPct}%`} />
              </div>
              <div className="today-bar-legend">
                <span>Hadir: {hadirPct}%</span>
                <span>Izin: {izinPct}%</span>
                <span>Alpa: {alpaPct}%</span>
              </div>
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Total Catatan:</span>
            <span className="text-xs font-bold text-slate-800">{totalHariIni} Sesi</span>
          </div>
        </div>
      </div>

      {/* ===== Recent Activity Log (Audit Trail) ===== */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">
              <Activity size={17} className="text-emerald-700" />
              Aktivitas Terakhir Sistem
            </h2>
            <p className="admin-card-subtitle">
              Pencatatan riwayat audit perubahan data dan autentikasi otomatis
            </p>
          </div>
          <Link
            to="/admin/audit-log"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Buka Semua Log</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>

        {data?.recentActivity && data.recentActivity.length > 0 ? (
          <div className="activity-list">
            {data.recentActivity.map((log) => {
              const actorInit = log.actor?.name ? log.actor.name.charAt(0).toUpperCase() : 'S';
              return (
                <div key={log.id} className="activity-item">
                  <div className="activity-avatar">{actorInit}</div>
                  <div className="activity-details">
                    <p className="activity-text">
                      <span className="activity-actor">{log.actor?.name || 'Sistem'}</span>{' '}
                      <span>melakukan tindakan</span>{' '}
                      <span className="activity-action-chip">{log.action}</span>{' '}
                      <span className="activity-entity">pada entitas {log.entityType}</span>
                    </p>
                    <div className="activity-time">{formatDateTime(log.createdAt)} WIB</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="admin-empty-state">
            <Activity size={32} className="admin-empty-icon" />
            <p className="admin-empty-text">Belum ada catatan aktivitas terbaru sistem</p>
          </div>
        )}
      </div>
    </div>
  );
}
