import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, ClipboardCheck, FileText, Clock, CheckCircle2, TrendingUp,
  ArrowRight, Sun, Moon, Shield, AlertCircle,
} from 'lucide-react';
import api from '../../lib/api';
import { formatTime, getStatusPresensiLabel } from '../../lib/utils';
import type { DashboardFasil } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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
      <div className="fasil-dash-loading">
        <div className="skel" style={{ height: 28, width: 280, marginBottom: 16 }} />
        <div className="stat-cards-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skel" style={{ height: 90, borderRadius: 12 }} />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Warga Binaan',
      value: data?.totalPenghuni || 0,
      icon: <Users size={16} />,
      bgClass: 'stat-icon-emerald',
      note: 'Total penghuni di gedung Anda',
    },
    {
      label: 'Hadir Hari Ini',
      value: data?.todayAttendance?.hadir || 0,
      icon: <ClipboardCheck size={16} />,
      bgClass: 'stat-icon-emerald',
      note: 'Presensi terverifikasi valid',
    },
    {
      label: 'Izin Hari Ini',
      value: data?.todayAttendance?.izin || 0,
      icon: <FileText size={16} />,
      bgClass: 'stat-icon-amber',
      note: 'Penghuni izin disetujui',
    },
    {
      label: 'Permohonan Menunggu',
      value: data?.pendingLeaveRequests || 0,
      icon: <Clock size={16} />,
      bgClass: 'stat-icon-blue',
      note: 'Perlu konfirmasi persetujuan',
    },
  ];

  return (
    <div className="fasil-dash animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="fasil-header-row">
          <div>
            <h1 className="page-title">
              <Shield size={20} className="page-title-icon" />
              Dashboard Fasilitator
            </h1>
            <p className="page-subtitle">Monitoring presensi dan status kehadiran warga asrama binaan Anda</p>
          </div>
          <div className="fasil-header-actions">
            <Link to="/fasil/pengajuan-izin" className="btn-outline">
              <FileText size={14} />
              Persetujuan Izin
              {(data?.pendingLeaveRequests || 0) > 0 && (
                <span className="fasil-pending-badge">{data?.pendingLeaveRequests}</span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-top">
              <span className="stat-card-label">{s.label}</span>
              <div className={`stat-card-icon ${s.bgClass}`}>{s.icon}</div>
            </div>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-sub">{s.note}</div>
          </div>
        ))}
      </div>

      {/* Two Column Layout: Chart + Quick Actions */}
      <div className="fasil-grid-2col">
        {/* Left: Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-header-title">
              <TrendingUp size={15} style={{ color: '#047857' }} />
              Tren Kehadiran (7 Hari)
            </div>
            <span className="fasil-chart-period">Mingguan</span>
          </div>
          <div className="card-body">
            {data?.attendanceTrend && data.attendanceTrend.length > 0 ? (
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '11px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="hadir" fill="#047857" name="Hadir" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="izin" fill="#d97706" name="Izin" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="alpa" fill="#dc2626" name="Alpa" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="empty-state">
                <TrendingUp size={32} className="empty-state-icon" />
                <p className="empty-state-text">Belum ada data tren kehadiran</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Actions / Info */}
        <div className="fasil-quick-panel">
          {/* Pending Alert */}
          {(data?.pendingLeaveRequests || 0) > 0 && (
            <div className="fasil-alert-card">
              <AlertCircle size={18} style={{ color: '#d97706', flexShrink: 0 }} />
              <div>
                <p className="fasil-alert-title">
                  {data?.pendingLeaveRequests} Permohonan Menunggu
                </p>
                <p className="fasil-alert-text">
                  Terdapat permohonan izin yang perlu segera ditinjau dan disetujui.
                </p>
                <Link to="/fasil/pengajuan-izin" className="fasil-alert-link">
                  Tinjau Sekarang <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          )}

          {/* Today Summary */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-title" style={{ fontSize: 12 }}>Ringkasan Hari Ini</div>
            </div>
            <div className="card-body" style={{ padding: 14 }}>
              <div className="fasil-today-items">
                <div className="fasil-today-item">
                  <div className="fasil-today-left">
                    <CheckCircle2 size={14} style={{ color: '#047857' }} />
                    <span>Hadir Terverifikasi</span>
                  </div>
                  <strong style={{ color: '#047857' }}>{data?.todayAttendance?.hadir || 0}</strong>
                </div>
                <div className="fasil-today-divider" />
                <div className="fasil-today-item">
                  <div className="fasil-today-left">
                    <FileText size={14} style={{ color: '#d97706' }} />
                    <span>Izin Disetujui</span>
                  </div>
                  <strong style={{ color: '#d97706' }}>{data?.todayAttendance?.izin || 0}</strong>
                </div>
                <div className="fasil-today-divider" />
                <div className="fasil-today-item">
                  <div className="fasil-today-left">
                    <AlertCircle size={14} style={{ color: '#dc2626' }} />
                    <span>Alpa / Tidak Hadir</span>
                  </div>
                  <strong style={{ color: '#dc2626' }}>{data?.todayAttendance?.alpa || 0}</strong>
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
            <CheckCircle2 size={15} style={{ color: '#047857' }} />
            Presensi Masuk Hari Ini
          </div>
          <Link to="/fasil/presensi" className="dash-see-all-link">
            Monitoring Lengkap <ArrowRight size={13} />
          </Link>
        </div>
        {data?.recentAttendance && data.recentAttendance.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Penghuni</th>
                  <th>NIM</th>
                  <th>Gedung</th>
                  <th>Sesi</th>
                  <th>Waktu Check-In</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentAttendance.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600, color: '#111827' }}>{item.user?.name || '-'}</td>
                    <td style={{ fontFamily: 'monospace', color: '#6b7280' }}>{item.user?.nim || '-'}</td>
                    <td>{item.user?.gedung?.nama || '-'}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
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
            <ClipboardCheck size={36} className="empty-state-icon" />
            <p className="empty-state-text">Belum ada data presensi terekam hari ini</p>
          </div>
        )}
      </div>
    </div>
  );
}
