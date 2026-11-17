import { useEffect, useState } from 'react';
import { ClipboardCheck, Search, Sun, Moon, MapPin, Download, CheckCircle, Clock } from 'lucide-react';
import api from '../../lib/api';
import { formatDate, formatTime, getStatusPresensiLabel } from '../../lib/utils';
import type { Presensi, PaginatedResponse } from '../../types';

export default function MonitoringPresensiPage() {
  const [data, setData] = useState<Presensi[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jenisFilter, setJenisFilter] = useState('');
  const [selectedItem, setSelectedItem] = useState<Presensi | null>(null);

  useEffect(() => {
    loadAttendance();
  }, [meta.page, search, statusFilter, jenisFilter]);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: meta.page,
        limit: meta.limit,
      };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (jenisFilter) params.jenisPresensi = jenisFilter;

      const res = await api.get<PaginatedResponse<Presensi>>('/attendance', { params });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hadirCount = data.filter((d) => d.status === 'HADIR').length;
  const izinCount = data.filter((d) => d.status === 'IZIN').length;
  const alpaCount = data.filter((d) => d.status === 'ALPA').length;

  const handleExportCSV = () => {
    if (data.length === 0) return;
    const headers = ['Nama', 'NIM', 'Gedung', 'Kamar', 'Jenis', 'Tanggal', 'Waktu', 'Status', 'Latitude', 'Longitude'];
    const rows = data.map((d) => [
      d.user?.name || '',
      d.user?.nim || '',
      d.user?.gedung?.nama || '',
      d.user?.kamar?.nama || '',
      d.jenisPresensi,
      d.tanggalPresensi,
      formatTime(d.waktu),
      d.status,
      d.latitude,
      d.longitude,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_presensi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardCheck size={20} className="text-emerald-800" />
            Monitoring Presensi Penghuni
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Pemantauan kehadiran sesi subuh dan malam seluruh warga asrama</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-all self-start sm:self-auto text-xs"
        >
          <Download size={14} />
          Ekspor Data CSV
        </button>
      </div>

      {/* Summary Mini Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hadir Terverifikasi</p>
            <p className="text-2xl font-bold text-emerald-800 tracking-tight mt-0.5">{hadirCount}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
            <CheckCircle size={18} />
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Izin Disetujui</p>
            <p className="text-2xl font-bold text-amber-700 tracking-tight mt-0.5">{izinCount}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Clock size={18} />
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Alpa / Belum Presensi</p>
            <p className="text-2xl font-bold text-red-700 tracking-tight mt-0.5">{alpaCount}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center font-bold">
            <Clock size={18} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau NIM..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 text-slate-700 font-medium"
          >
            <option value="">Semua Status Kehadiran</option>
            <option value="HADIR">Hadir</option>
            <option value="IZIN">Izin</option>
            <option value="ALPA">Alpa</option>
          </select>
        </div>

        <div>
          <select
            value={jenisFilter}
            onChange={(e) => setJenisFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 text-slate-700 font-medium"
          >
            <option value="">Semua Sesi (Subuh & Malam)</option>
            <option value="SUBUH">Presensi Subuh</option>
            <option value="MALAM">Presensi Malam</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 skeleton rounded-lg" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <ClipboardCheck size={40} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs font-medium">Belum ada data presensi yang sesuai</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="text-left py-3 px-4">Penghuni</th>
                  <th className="text-left py-3 px-4">Gedung & Kamar</th>
                  <th className="text-left py-3 px-4">Sesi Presensi</th>
                  <th className="text-left py-3 px-4">Waktu Check-In</th>
                  <th className="text-left py-3 px-4">Titik Geofence</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {data.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-slate-900">{p.user?.name || '-'}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{p.user?.nim || '-'}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{p.user?.gedung?.nama || '-'}</p>
                      <p className="text-[11px] text-slate-400">{p.user?.kamar?.nama || '-'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {p.jenisPresensi === 'SUBUH' ? (
                          <Sun size={12} className="text-amber-500" />
                        ) : (
                          <Moon size={12} className="text-emerald-700" />
                        )}
                        {p.jenisPresensi === 'SUBUH' ? 'Subuh' : 'Malam'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <p className="font-mono">{formatTime(p.waktu)} WIB</p>
                      <p className="text-[11px] text-slate-400">{formatDate(p.tanggalPresensi)}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600">
                        <MapPin size={12} className="text-emerald-800" />
                        <span>
                          {p.latitude?.toFixed(4)}, {p.longitude?.toFixed(4)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge badge-${p.status.toLowerCase()}`}>
                        {getStatusPresensiLabel(p.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedItem(p)}
                        className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-700 px-2 py-1 rounded hover:bg-emerald-50 transition-colors"
                      >
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between p-3.5 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Halaman {meta.page} dari {meta.totalPages} ({meta.total} data)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setMeta((m) => ({ ...m, page: m.page - 1 }))}
                disabled={meta.page <= 1}
                className="px-2.5 py-1 border border-slate-200 rounded text-xs disabled:opacity-50 hover:bg-slate-50"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setMeta((m) => ({ ...m, page: m.page + 1 }))}
                disabled={meta.page >= meta.totalPages}
                className="px-2.5 py-1 border border-slate-200 rounded text-xs disabled:opacity-50 hover:bg-slate-50"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Detail */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-xl max-w-sm w-full p-5 animate-fade-in shadow-xl border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
              Verifikasi Detail Presensi
            </h3>
            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Warga Asrama</span>
                <span className="font-semibold text-slate-900">{selectedItem.user?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">NIM</span>
                <span className="font-mono text-slate-800">{selectedItem.user?.nim}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Gedung / Kamar</span>
                <span>
                  {selectedItem.user?.gedung?.nama} ({selectedItem.user?.kamar?.nama})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Waktu & Sesi</span>
                <span className="font-mono">
                  {formatTime(selectedItem.waktu)} WIB ({selectedItem.jenisPresensi})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Koordinat GPS</span>
                <span className="font-mono text-[11px]">
                  {selectedItem.latitude}, {selectedItem.longitude}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Status Kehadiran</span>
                <span className={`badge badge-${selectedItem.status.toLowerCase()}`}>
                  {getStatusPresensiLabel(selectedItem.status)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedItem(null)}
              className="mt-4 w-full py-2 bg-slate-100 text-slate-700 rounded-lg font-medium text-xs hover:bg-slate-200 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
