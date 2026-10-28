import { useEffect, useState } from 'react';
import { Users, Building2, DoorOpen, ClipboardCheck, FileText, TrendingUp, Activity } from 'lucide-react';
import api from '../../lib/api';
import { formatDateTime } from '../../lib/utils';
import type { DashboardAdmin } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
      <div className="space-y-6 animate-pulse">
        <div className="h-7 w-64 skeleton" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 skeleton rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Penghuni Aktif',
      value: data?.totalPenghuni || 0,
      icon: <Users size={18} className="text-emerald-700" />,
      bgIcon: 'bg-emerald-50',
      note: 'Warga asrama terdaftar',
    },
    {
      label: 'Fasilitator Terpilih',
      value: data?.totalFasil || 0,
      icon: <Users size={18} className="text-teal-700" />,
      bgIcon: 'bg-teal-50',
      note: 'Pembina lorong & gedung',
    },
    {
      label: 'Gedung Asrama',
      value: data?.totalGedung || 0,
      icon: <Building2 size={18} className="text-blue-700" />,
      bgIcon: 'bg-blue-50',
      note: 'Titik koordinat geofence aktif',
    },
    {
      label: 'Kapasitas Kamar',
      value: data?.totalKamar || 0,
      icon: <DoorOpen size={18} className="text-indigo-700" />,
      bgIcon: 'bg-indigo-50',
      note: 'Total unit kamar hunian',
    },
    {
      label: 'Presensi Hadir Hari Ini',
      value: data?.todayAttendance?.hadir || 0,
      icon: <ClipboardCheck size={18} className="text-emerald-700" />,
      bgIcon: 'bg-emerald-50',
      note: 'Sesi subuh & malam tervalidasi',
    },
    {
      label: 'Pengajuan Izin Menunggu',
      value: data?.pendingLeaveRequests || 0,
      icon: <FileText size={18} className="text-amber-700" />,
      bgIcon: 'bg-amber-50',
      note: 'Perlu ditinjau fasilitator/admin',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard Administrator</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ringkasan metrik operasional presensi dan tata kelola asrama Universitas Andalas
          </p>
        </div>
      </div>

      {/* Grid Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.bgIcon}`}>{s.icon}</div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-bold text-slate-900 tracking-tight">{s.value}</p>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{s.note}</p>
          </div>
        ))}
      </div>

      {/* Attendance Trend Chart */}
      {data?.attendanceTrend && data.attendanceTrend.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-700" />
                Tren Kehadiran Penghuni Asrama (7 Hari Terakhir)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Perbandingan data kehadiran hadir, izin, dan alpa harian
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="hadir" fill="#15803d" name="Hadir" radius={[3, 3, 0, 0]} />
                <Bar dataKey="izin" fill="#d97706" name="Izin" radius={[3, 3, 0, 0]} />
                <Bar dataKey="alpa" fill="#dc2626" name="Alpa" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Activity Log */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity size={16} className="text-emerald-700" />
            Aktivitas Terakhir Sistem
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">Audit Trail Otomatis</span>
        </div>
        {data?.recentActivity && data.recentActivity.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {data.recentActivity.map((log) => (
              <div key={log.id} className="py-2.5 flex items-start gap-3 hover:bg-slate-50/60 transition-colors">
                <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                  ✓
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-800">
                    <span className="font-semibold text-slate-900">{log.actor?.name || 'Sistem'}</span>{' '}
                    <span className="text-slate-600">melakukan tindakan</span>{' '}
                    <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                      {log.action}
                    </span>{' '}
                    <span className="text-slate-500">pada entitas {log.entityType}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{formatDateTime(log.createdAt)} WIB</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-6 text-xs text-slate-400">Belum ada catatan aktivitas terbaru</p>
        )}
      </div>
    </div>
  );
}
