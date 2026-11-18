import { useEffect, useState } from 'react';
import { History, Sun, Moon, Filter, Search, Download, ChevronLeft, ChevronRight, Camera, X } from 'lucide-react';
import api from '../../lib/api';
import { formatDate, formatTime, getStatusPresensiLabel } from '../../lib/utils';
import type { Presensi, PaginatedResponse } from '../../types';
import './RiwayatPresensiPage.css';

export default function RiwayatPresensiPage() {
  const [data, setData] = useState<Presensi[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ tanggalMulai: '', tanggalSelesai: '', jenisPresensi: '' });
  const [selectedItem, setSelectedItem] = useState<Presensi | null>(null);

  useEffect(() => {
    loadData();
  }, [meta.page, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = { page: meta.page, limit: meta.limit };
      if (filters.tanggalMulai) params.tanggalMulai = filters.tanggalMulai;
      if (filters.tanggalSelesai) params.tanggalSelesai = filters.tanggalSelesai;
      if (filters.jenisPresensi) params.jenisPresensi = filters.jenisPresensi;

      const res = await api.get<PaginatedResponse<Presensi>>('/attendance/me', { params });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="riwayat-page animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="riwayat-header-row">
          <div>
            <h1 className="page-title">
              <History size={20} className="page-title-icon" />
              Riwayat Presensi
            </h1>
            <p className="page-subtitle">Daftar rekaman kehadiran presensi foto selfie dan validasi geofence Anda di asrama</p>
          </div>
          <div className="riwayat-header-actions">
            <button className="btn-outline" style={{ fontSize: 11.5 }}>
              <Download size={14} />
              Ekspor Data
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card riwayat-filter-card">
        <div className="card-body">
          <div className="riwayat-filter-label">
            <Filter size={13} style={{ color: '#047857' }} />
            <span>Filter Periode &amp; Sesi</span>
          </div>
          <div className="filter-bar">
            <div>
              <label className="filter-label">Dari Tanggal</label>
              <input
                type="date"
                value={filters.tanggalMulai}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, tanggalMulai: e.target.value }));
                  setMeta((m) => ({ ...m, page: 1 }));
                }}
                className="filter-input"
                style={{ fontFamily: 'monospace' }}
              />
            </div>
            <div>
              <label className="filter-label">Sampai Tanggal</label>
              <input
                type="date"
                value={filters.tanggalSelesai}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, tanggalSelesai: e.target.value }));
                  setMeta((m) => ({ ...m, page: 1 }));
                }}
                className="filter-input"
                style={{ fontFamily: 'monospace' }}
              />
            </div>
            <div>
              <label className="filter-label">Sesi Presensi</label>
              <select
                value={filters.jenisPresensi}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, jenisPresensi: e.target.value }));
                  setMeta((m) => ({ ...m, page: 1 }));
                }}
                className="filter-select"
              >
                <option value="">Semua Sesi</option>
                <option value="SUBUH">Sesi Subuh</option>
                <option value="MALAM">Sesi Malam</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="riwayat-results-info">
        <Search size={13} />
        <span>Menampilkan <strong>{data.length}</strong> dari <strong>{meta.total}</strong> rekaman presensi</span>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div style={{ padding: 24 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skel" style={{ height: 40, marginBottom: 8, borderRadius: 8 }} />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            <History size={40} className="empty-state-icon" />
            <p className="empty-state-text">Tidak ada data riwayat presensi</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Bukti Foto</th>
                  <th>Tanggal Presensi</th>
                  <th>Sesi Presensi</th>
                  <th>Waktu Check-In</th>
                  <th>Jarak Asrama</th>
                  <th>Titik GPS</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => {
                  const photo = item.fotoWajah || item.foto_wajah;
                  const distance = item.jarakMeter ?? item.jarak_meter;

                  return (
                    <tr key={item.id}>
                      <td style={{ color: '#9ca3af', fontWeight: 500 }}>
                        {(meta.page - 1) * meta.limit + idx + 1}
                      </td>
                      <td>
                        {photo ? (
                          <div
                            onClick={() => setSelectedItem(item)}
                            className="cursor-pointer group relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shadow-2xs hover:border-emerald-600 transition-all"
                            title="Klik untuk memperbesar bukti foto"
                          >
                            <img
                              src={photo}
                              alt="Bukti Absensi"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                          </div>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded"
                            title="Data absensi lama menggunakan QR Code"
                          >
                            QR Code
                          </span>
                        )}
                      </td>
                      <td style={{ fontWeight: 600, color: '#111827' }}>
                        {formatDate(item.tanggalPresensi)}
                      </td>
                      <td>
                        <span className="riwayat-session-cell">
                          {item.jenisPresensi === 'SUBUH' ? (
                            <Sun size={13} style={{ color: '#f59e0b' }} />
                          ) : (
                            <Moon size={13} style={{ color: '#6366f1' }} />
                          )}
                          {item.jenisPresensi === 'SUBUH' ? 'Subuh' : 'Malam'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: 11.5 }}>
                        {formatTime(item.waktu)} WIB
                      </td>
                      <td style={{ fontSize: 11, fontWeight: 500 }}>
                        {distance !== undefined && distance !== null ? (
                          <span style={{ color: distance <= 200 ? '#047857' : '#b91c1c' }}>
                            {distance} m
                          </span>
                        ) : (
                          <span style={{ color: '#9ca3af' }}>Dalam Radius</span>
                        )}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>
                        {item.latitude ? `${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}` : '-'}
                      </td>
                      <td>
                        <span className={`status-badge ${item.status.toLowerCase()}`}>
                          {getStatusPresensiLabel(item.status)}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="btn-outline"
                          style={{ fontSize: 11, padding: '4px 8px' }}
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="pagination">
            <span>
              Halaman {meta.page} dari {meta.totalPages} ({meta.total} total)
            </span>
            <div className="pagination-buttons">
              <button
                onClick={() => setMeta((m) => ({ ...m, page: m.page - 1 }))}
                disabled={meta.page <= 1}
                className="pagination-btn"
              >
                <ChevronLeft size={14} />
                Sebelumnya
              </button>
              <button
                onClick={() => setMeta((m) => ({ ...m, page: m.page + 1 }))}
                disabled={meta.page >= meta.totalPages}
                className="pagination-btn"
              >
                Selanjutnya
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal with Selfie Photo */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Camera size={16} className="text-emerald-700" />
                Bukti Presensi Kehadiran
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            {/* Photo preview container */}
            <div className="mb-4">
              {selectedItem.fotoWajah || selectedItem.foto_wajah ? (
                <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-950 border border-slate-200">
                  <img
                    src={selectedItem.fotoWajah || selectedItem.foto_wajah || ''}
                    alt="Bukti Selfie"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 right-2 bg-slate-900/75 backdrop-blur-xs text-white text-[11px] py-1 px-2.5 rounded-lg flex items-center justify-between">
                    <span>Foto Selfie Langsung</span>
                    <span className="font-mono">{formatTime(selectedItem.waktu)} WIB</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center bg-slate-50">
                  <p className="text-xs font-medium text-slate-600">Presensi QR Code (Data Lama)</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Rekaman presensi ini diverifikasi menggunakan mekanisme QR Code sebelum fitur kamera selfie diaktifkan.
                  </p>
                </div>
              )}
            </div>

            {/* Info details */}
            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Tanggal &amp; Sesi</span>
                <span className="font-semibold text-slate-900">
                  {formatDate(selectedItem.tanggalPresensi)} ({selectedItem.jenisPresensi})
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Waktu Validasi</span>
                <span className="font-mono text-slate-900">{formatTime(selectedItem.waktu)} WIB</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Jarak ke Asrama</span>
                <span className="font-semibold text-emerald-800">
                  {selectedItem.jarakMeter ?? selectedItem.jarak_meter
                    ? `${selectedItem.jarakMeter ?? selectedItem.jarak_meter} meter`
                    : 'Dalam Radius Terverifikasi'}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Koordinat GPS</span>
                <span className="font-mono text-[11px] text-slate-600">
                  {selectedItem.latitude ? `${selectedItem.latitude.toFixed(5)}, ${selectedItem.longitude.toFixed(5)}` : '-'}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Status</span>
                <span className={`status-badge ${selectedItem.status.toLowerCase()}`}>
                  {getStatusPresensiLabel(selectedItem.status)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedItem(null)}
              className="mt-4 w-full py-2 bg-slate-100 text-slate-700 rounded-xl font-medium text-xs hover:bg-slate-200 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
