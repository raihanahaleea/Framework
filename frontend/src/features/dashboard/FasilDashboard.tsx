import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, ClipboardCheck, FileText, Clock, CheckCircle2, TrendingUp,
  ArrowRight, Sun, Moon, ShieldCheck, AlertCircle, History
} from 'lucide-react';
import api from '../../lib/api';
import { formatTime, getStatusPresensiLabel } from '../../lib/utils';
import type { DashboardFasil } from '../../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import './FasilDashboard.css';

export default function FasilDashboard() {
  const [data, setData] = useState<DashboardFasil | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.get('/dashboard/facilitator');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fasil-dash animate-pulse">
        <div className="h-24 bg-white border border-slate-200 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Warga Binaan',
      value: data?.totalPenghuni || 0,
      icon: <Users size={18} />,
      iconClass: 'icon-fasil-binaan',
      note: 'Total penghuni di gedung binaan',
      link: '/fasil/penghuni',
    },
    {
      label: 'Hadir Hari Ini',
      value: data?.todayAttendance?.hadir || 0,
      icon: <ClipboardCheck size={18} />,
      iconClass: 'icon-fasil-hadir',
      note: 'Presensi terverifikasi valid',
      link: '/fasil/presensi',
    },
    {
      label: 'Izin Hari Ini',
      value: data?.todayAttendance?.izin || 0,
      icon: <FileText size={18} />,
      iconClass: 'icon-fasil-izin',
      note: 'Penghuni izin disetujui',
      link: '/fasil/pengajuan-izin',
    },
    {
      label: 'Permohonan Menunggu',
      value: data?.pendingLeaveRequests || 0,
      icon: <Clock size={18} />,
      iconClass: 'icon-fasil-menunggu',
      note: 'Perlu konfirmasi persetujuan',
      link: '/fasil/pengajuan-izin',
    },
  ];

  return (
    <div className="fasil-dash animate-fade-in">
      {/* ===== Header Welcome Banner ===== */}
      <div className="fasil-banner">
        <div className="fasil-banner-left">
          <div className="fasil-badge">
            <ShieldCheck size={14} />
            Portal Fasilitator • Asrama Mahasiswa UNAND
          </div>
          <h1 className="fasil-title">Dashboard &amp; Monitoring Fasilitator</h1>
          <p className="fasil-subtitle">
            Pemantauan kepatuhan presensi warga asrama binaan, pengelolaan izin keluar asrama, dan rekapitulasi data hunian.
          </p>
        </div>
        <div className="fasil-banner-right">
          <div className="fasil-status-pill">
            <span className="fasil-status-dot" />
            <span>Akun Fasilitator Aktif</span>
          </div>
          <span className="fasil-period-note">T.A. 2025/2026 • Wilayah Binaan</span>
        </div>
      </div>

      {/* ===== Quick Navigation Shortcuts ===== */}
      <div className="fasil-shortcuts-bar">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
          Akses Cepat:
        </span>
        <Link to="/fasil/penghuni" className="fasil-shortcut-btn">
          <Users size={14} className="text-emerald-700" />
          <span>Data Penghuni Binaan</span>
        </Link>
        <Link to="/fasil/presensi" className="fasil-shortcut-btn">
          <ClipboardCheck size={14} className="text-emerald-700" />
          <span>Monitoring Hari Ini</span>
        </Link>
        <Link to="/fasil/riwayat-presensi" className="fasil-shortcut-btn">
          <History size={14} className="text-teal-700" />
          <span>Riwayat &amp; Arsip Presensi</span>
        </Link>
        <Link to="/fasil/pengajuan-izin" className="fasil-shortcut-btn">
          <FileText size={14} className="text-amber-700" />
          <span>Persetujuan Izin</span>
          {(data?.pendingLeaveRequests || 0) > 0 && (
            <span className="fasil-shortcut-badge">{data?.pendingLeaveRequests}</span>
          )}
        </Link>
      </div>

      {/* ===== 4 Metrik Stat Cards ===== */}
      <div className="fasil-stats-grid">
        {stats.map((s) => (
          <Link key={s.label} to={s.link} className="fasil-stat-card" style={{ textDecoration: 'none' }}>
            <div>
              <div className="fasil-stat-top">
                <span className="fasil-stat-label">{s.label}</span>
                <div className={`fasil-stat-icon-wrapper ${s.iconClass}`}>
                  {s.icon}
                </div>
              </div>
              <div className="fasil-stat-val">{s.value}</div>
            </div>
            <div className="fasil-stat-note">
              <span>{s.note}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* ===== Two Column Layout: Chart + Quick Panel ===== */}
      <div className="fasil-grid-2col">
        {/* Left: Attendance Trend Chart */}
        <div className="fasil-card">
          <div className="fasil-card-header">
            <div>
              <h2 className="fasil-card-title">
                <TrendingUp size={16} className="text-emerald-700" />
                Tren Kehadiran (7 Hari Terakhir)
              </h2>
              <p className="fasil-card-subtitle">
                Statistik harian warga binaan yang hadir, izin, dan alpa
              </p>
            </div>
            <span className="fasil-chart-period">Mingguan</span>
          </div>

          <div className="fasil-chart-box">
            {data?.attendanceTrend && data.attendanceTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
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
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar dataKey="hadir" fill="#059669" name="Hadir" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="izin" fill="#d97706" name="Izin" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="alpa" fill="#e11d48" name="Alpa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="fasil-empty-state">
                <TrendingUp size={36} className="fasil-empty-icon" />
                <p className="fasil-empty-text">Belum ada data tren kehadiran minggu ini</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Panel (Alert + Today Summary) */}
        <div className="fasil-quick-panel">
          {/* Pending Leave Alert Card */}
          {(data?.pendingLeaveRequests || 0) > 0 && (
            <div className="fasil-alert-card">
              <AlertCircle size={22} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 className="fasil-alert-title">
                  {data?.pendingLeaveRequests} Permohonan Izin Menunggu
                </h4>
                <p className="fasil-alert-text">
                  Terdapat permohonan izin meninggalkan asrama yang memerlukan peninjauan dan arahan fasilitator.
                </p>
                <Link to="/fasil/pengajuan-izin" className="fasil-alert-link">
                  <span>Tinjau Sekarang</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}

          {/* Today's Summary Card */}
          <div className="fasil-card">
            <div className="fasil-card-header" style={{ marginBottom: 12, paddingBottom: 10 }}>
              <h3 className="fasil-card-title" style={{ fontSize: 13 }}>
                <Clock size={15} className="text-emerald-700" />
                Rekap Kehadiran Hari Ini
              </h3>
            </div>

            <div className="fasil-today-items">
              <div className="fasil-today-item">
                <div className="fasil-today-left">
                  <CheckCircle2 size={16} className="text-emerald-700" />
                  <span>Hadir Terverifikasi</span>
                </div>
                <strong className="text-emerald-700 font-mono text-sm">{data?.todayAttendance?.hadir || 0}</strong>
              </div>

              <div className="fasil-today-item">
                <div className="fasil-today-left">
                  <FileText size={16} className="text-amber-600" />
                  <span>Izin Disetujui</span>
                </div>
                <strong className="text-amber-700 font-mono text-sm">{data?.todayAttendance?.izin || 0}</strong>
              </div>

              <div className="fasil-today-item">
                <div className="fasil-today-left">
                  <AlertCircle size={16} className="text-rose-600" />
                  <span>Alpa / Belum Presensi</span>
                </div>
                <strong className="text-rose-700 font-mono text-sm">{data?.todayAttendance?.alpa || 0}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Recent Attendance Table Card ===== */}
      <div className="fasil-card">
        <div className="fasil-card-header">
          <div>
            <h2 className="fasil-card-title">
              <ClipboardCheck size={16} className="text-emerald-700" />
              Presensi Masuk Terbaru Hari Ini
            </h2>
            <p className="fasil-card-subtitle">
              Rekaman check-in mandiri warga asrama binaan yang baru saja diverifikasi
            </p>
          </div>
          <Link to="/fasil/presensi" className="fasil-see-all-link">
            <span>Monitoring Lengkap</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {data?.recentAttendance && data.recentAttendance.length > 0 ? (
          <div className="fasil-table-container">
            <table className="fasil-table">
              <thead>
                <tr>
                  <th>Nama Penghuni</th>
                  <th>NIM</th>
                  <th>Gedung &amp; Kamar</th>
                  <th>Sesi</th>
                  <th>Waktu Check-In</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentAttendance.map((item) => {
                  const userInitial = item.user?.name ? item.user.name.charAt(0).toUpperCase() : 'W';

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="fasil-user-cell">
                          <div className="fasil-user-avatar">{userInitial}</div>
                          <div>
                            <p className="font-semibold text-slate-900">{item.user?.name || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-slate-700 font-medium">{item.user?.nim || '-'}</td>
                      <td>
                        <span className="font-semibold text-slate-800">{item.user?.gedung?.nama || '-'}</span>
                        {item.user?.kamar?.nama && (
                          <span className="text-slate-400 text-xs ml-1">({item.user.kamar.nama})</span>
                        )}
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1.5 font-medium text-xs px-2 py-0.5 rounded-md bg-slate-100">
                          {item.jenisPresensi === 'SUBUH' ? (
                            <Sun size={13} className="text-amber-500" />
                          ) : (
                            <Moon size={13} className="text-indigo-600" />
                          )}
                          <span>{item.jenisPresensi === 'SUBUH' ? 'Subuh' : 'Malam'}</span>
                        </span>
                      </td>
                      <td className="font-mono text-slate-800 font-semibold">{formatTime(item.waktu)} WIB</td>
                      <td>
                        <span className={`status-badge ${item.status.toLowerCase()}`}>
                          {getStatusPresensiLabel(item.status)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="fasil-empty-state">
            <ClipboardCheck size={40} className="fasil-empty-icon" />
            <p className="fasil-empty-text">Belum ada data presensi yang masuk hari ini</p>
          </div>
        )}
      </div>
    </div>
  );
}
