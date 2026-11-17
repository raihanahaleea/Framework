import { useEffect, useState } from 'react';
import { History, Sun, Moon, Filter, Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import { formatDate, formatTime, getStatusPresensiLabel } from '../../lib/utils';
import type { Presensi, PaginatedResponse } from '../../types';
import './RiwayatPresensiPage.css';

export default function RiwayatPresensiPage() {
  const [data, setData] = useState<Presensi[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ tanggalMulai: '', tanggalSelesai: '', jenisPresensi: '' });

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
            <p className="page-subtitle">Daftar rekaman kehadiran presensi mandiri Anda di asrama</p>
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
                  <th>Tanggal Presensi</th>
                  <th>Sesi Presensi</th>
                  <th>Waktu Check-In</th>
                  <th>Titik Geofence GPS</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={item.id}>
                    <td style={{ color: '#9ca3af', fontWeight: 500 }}>
                      {(meta.page - 1) * meta.limit + idx + 1}
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
                    <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>
                      {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                    </td>
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
    </div>
  );
}
