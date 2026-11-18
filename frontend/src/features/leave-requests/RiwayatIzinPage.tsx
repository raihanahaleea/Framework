import { useEffect, useState, useMemo } from 'react';
import {
  FileClock, CheckCircle2, Clock, XCircle,
  FileText, Search, Eye, Calendar, X, AlertCircle, ShieldCheck
} from 'lucide-react';
import api from '../../lib/api';
import { formatDate, getStatusIzinLabel } from '../../lib/utils';
import type { PengajuanIzin, PaginatedResponse, StatusPengajuanIzin } from '../../types';
import './RiwayatIzinPage.css';

export default function RiwayatIzinPage() {
  const [data, setData] = useState<PengajuanIzin[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PengajuanIzin | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | StatusPengajuanIzin>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, [meta.page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<PengajuanIzin>>('/leave-requests/me', {
        params: { page: meta.page, limit: meta.limit },
      });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from data
  const stats = useMemo(() => {
    const total = data.length;
    const pending = data.filter((d) => d.status === 'MENUNGGU').length;
    const approved = data.filter((d) => d.status === 'DISETUJUI').length;
    const rejected = data.filter((d) => d.status === 'DITOLAK').length;
    return { total, pending, approved, rejected };
  }, [data]);

  // Filtered dataset for display
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchStatus = filterStatus === 'ALL' || item.status === filterStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.jenisIzin.toLowerCase().includes(q) ||
        item.alasan.toLowerCase().includes(q) ||
        (item.catatanFasil && item.catatanFasil.toLowerCase().includes(q));
      return matchStatus && matchQuery;
    });
  }, [data, filterStatus, searchQuery]);

  const renderStatusBadge = (status: StatusPengajuanIzin) => {
    const cls =
      status === 'DISETUJUI'
        ? 'disetujui'
        : status === 'DITOLAK'
        ? 'ditolak'
        : 'menunggu';
    return (
      <span className={`rizin-badge-status ${cls}`}>
        <span className="rizin-status-dot" />
        {getStatusIzinLabel(status)}
      </span>
    );
  };

  const calculateDays = (start: string, end: string) => {
    try {
      const d1 = new Date(start);
      const d2 = new Date(end);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return `${diffDays} hari`;
    } catch {
      return '';
    }
  };

  return (
    <div className="riwayat-izin-page animate-fade-in">
      {/* ===== Header / Welcome Banner ===== */}
      <div className="rizin-banner">
        <div className="rizin-banner-left">
          <div className="rizin-badge">
            <ShieldCheck size={14} />
            Portal Perizinan Asrama
          </div>
          <h1 className="rizin-title">Riwayat Pengajuan Izin</h1>
          <p className="rizin-subtitle">
            Daftar lengkap permohonan izin meninggalkan asrama, keputusan fasilitator, serta status verifikasi Anda.
          </p>
        </div>
      </div>

      {/* ===== Statistics Cards ===== */}
      <div className="rizin-stats-grid">
        <div className="rizin-stat-card">
          <div className="rizin-stat-icon total">
            <FileText size={20} />
          </div>
          <div className="rizin-stat-body">
            <span className="rizin-stat-value">{stats.total}</span>
            <span className="rizin-stat-label">Total Permohonan</span>
          </div>
        </div>

        <div className="rizin-stat-card">
          <div className="rizin-stat-icon menunggu">
            <Clock size={20} />
          </div>
          <div className="rizin-stat-body">
            <span className="rizin-stat-value">{stats.pending}</span>
            <span className="rizin-stat-label">Menunggu Persetujuan</span>
          </div>
        </div>

        <div className="rizin-stat-card">
          <div className="rizin-stat-icon disetujui">
            <CheckCircle2 size={20} />
          </div>
          <div className="rizin-stat-body">
            <span className="rizin-stat-value">{stats.approved}</span>
            <span className="rizin-stat-label">Izin Disetujui</span>
          </div>
        </div>

        <div className="rizin-stat-card">
          <div className="rizin-stat-icon ditolak">
            <XCircle size={20} />
          </div>
          <div className="rizin-stat-body">
            <span className="rizin-stat-value">{stats.rejected}</span>
            <span className="rizin-stat-label">Izin Ditolak</span>
          </div>
        </div>
      </div>

      {/* ===== Filter & Search Toolbar ===== */}
      <div className="rizin-toolbar-card">
        <div className="rizin-filter-tabs">
          <button
            type="button"
            className={`rizin-filter-tab ${filterStatus === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterStatus('ALL')}
          >
            <span>Semua</span>
            <span className="rizin-tab-count">{stats.total}</span>
          </button>
          <button
            type="button"
            className={`rizin-filter-tab ${filterStatus === 'MENUNGGU' ? 'active' : ''}`}
            onClick={() => setFilterStatus('MENUNGGU')}
          >
            <span>Menunggu</span>
            <span className="rizin-tab-count">{stats.pending}</span>
          </button>
          <button
            type="button"
            className={`rizin-filter-tab ${filterStatus === 'DISETUJUI' ? 'active' : ''}`}
            onClick={() => setFilterStatus('DISETUJUI')}
          >
            <span>Disetujui</span>
            <span className="rizin-tab-count">{stats.approved}</span>
          </button>
          <button
            type="button"
            className={`rizin-filter-tab ${filterStatus === 'DITOLAK' ? 'active' : ''}`}
            onClick={() => setFilterStatus('DITOLAK')}
          >
            <span>Ditolak</span>
            <span className="rizin-tab-count">{stats.rejected}</span>
          </button>
        </div>

        <div className="rizin-search-box">
          <Search size={14} className="rizin-search-icon" />
          <input
            type="text"
            placeholder="Cari jenis izin atau alasan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rizin-search-input"
          />
        </div>
      </div>

      {/* ===== Main Table & Cards View ===== */}
      <div className="rizin-table-card">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 skeleton rounded-xl" />
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="rizin-empty-state">
            <div className="rizin-empty-icon">
              <FileClock size={32} />
            </div>
            <h3 className="rizin-empty-title">Tidak Ada Catatan Perizinan</h3>
            <p className="rizin-empty-desc">
              {searchQuery || filterStatus !== 'ALL'
                ? 'Tidak ada data izin yang cocok dengan filter atau kata kunci pencarian Anda.'
                : 'Anda belum memiliki riwayat pengajuan izin asrama.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="rizin-table-container overflow-x-auto">
              <table className="rizin-table">
                <thead>
                  <tr>
                    <th>Tanggal Diajukan</th>
                    <th>Jenis Perizinan</th>
                    <th>Periode Izin</th>
                    <th>Status Keputusan</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr key={item.id}>
                      <td className="rizin-col-date">
                        {formatDate(item.createdAt)}
                      </td>
                      <td>
                        <div className="rizin-jenis-pill">
                          <FileText size={15} className="text-emerald-700" />
                          <span>{item.jenisIzin}</span>
                        </div>
                      </td>
                      <td>
                        <div className="rizin-col-periode">
                          {formatDate(item.tanggalMulai)} &ndash; {formatDate(item.tanggalSelesai)}
                        </div>
                        <div className="rizin-periode-sub">
                          Durasi: {calculateDays(item.tanggalMulai, item.tanggalSelesai)}
                        </div>
                      </td>
                      <td>{renderStatusBadge(item.status)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => setSelected(item)}
                          className="btn-lihat-detail"
                        >
                          <Eye size={13} />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="rizin-cards-list">
              {filteredData.map((item) => (
                <div key={item.id} className="rizin-mobile-card">
                  <div className="rizin-mobile-card-top">
                    <div>
                      <div className="rizin-jenis-pill">
                        <FileText size={15} className="text-emerald-700" />
                        <span>{item.jenisIzin}</span>
                      </div>
                      <div className="rizin-col-date" style={{ marginTop: '3px' }}>
                        Diajukan: {formatDate(item.createdAt)}
                      </div>
                    </div>
                    {renderStatusBadge(item.status)}
                  </div>

                  <div className="rizin-mobile-card-body">
                    <div>
                      <strong>Periode:</strong> {formatDate(item.tanggalMulai)} &ndash; {formatDate(item.tanggalSelesai)} ({calculateDays(item.tanggalMulai, item.tanggalSelesai)})
                    </div>
                    <div>
                      <strong>Alasan:</strong> {item.alasan.length > 60 ? item.alasan.slice(0, 60) + '...' : item.alasan}
                    </div>
                  </div>

                  <div className="rizin-mobile-card-footer">
                    <span className="text-xs text-slate-400 font-mono">ID: {item.id.slice(0, 8)}</span>
                    <button
                      type="button"
                      onClick={() => setSelected(item)}
                      className="btn-lihat-detail"
                    >
                      <Eye size={13} />
                      <span>Lihat Detail</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {meta.totalPages > 1 && (
          <div className="rizin-pagination">
            <span>
              Halaman <strong>{meta.page}</strong> dari <strong>{meta.totalPages}</strong> ({meta.total} data)
            </span>
            <div className="rizin-pagination-btns">
              <button
                type="button"
                onClick={() => setMeta((m) => ({ ...m, page: m.page - 1 }))}
                disabled={meta.page <= 1}
                className="rizin-page-btn"
              >
                &larr; Sebelumnya
              </button>
              <button
                type="button"
                onClick={() => setMeta((m) => ({ ...m, page: m.page + 1 }))}
                disabled={meta.page >= meta.totalPages}
                className="rizin-page-btn"
              >
                Selanjutnya &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== Detail Modal ===== */}
      {selected && (
        <div className="rizin-modal-overlay" onClick={() => setSelected(null)}>
          <div className="rizin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="rizin-modal-header">
              <h3 className="rizin-modal-title">
                <FileClock size={18} className="text-emerald-700" />
                Rincian Pengajuan Izin
              </h3>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rizin-modal-close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rizin-modal-body">
              <div className="rizin-modal-field">
                <span className="rizin-modal-label">
                  <FileText size={13} />
                  Jenis Perizinan
                </span>
                <span className="rizin-modal-val">{selected.jenisIzin}</span>
              </div>

              <div className="rizin-modal-field">
                <span className="rizin-modal-label">
                  <Calendar size={13} />
                  Periode Izin
                </span>
                <span className="rizin-modal-val">
                  {formatDate(selected.tanggalMulai)} &ndash; {formatDate(selected.tanggalSelesai)}
                  <br />
                  <small className="text-slate-500 font-normal">
                    ({calculateDays(selected.tanggalMulai, selected.tanggalSelesai)})
                  </small>
                </span>
              </div>

              <div className="rizin-modal-field">
                <span className="rizin-modal-label">
                  <Clock size={13} />
                  Tanggal Diajukan
                </span>
                <span className="rizin-modal-val font-mono">{formatDate(selected.createdAt)}</span>
              </div>

              <div className="rizin-modal-field">
                <span className="rizin-modal-label">
                  <AlertCircle size={13} />
                  Status Keputusan
                </span>
                <div>{renderStatusBadge(selected.status)}</div>
              </div>

              <div className="rizin-modal-box">
                <div className="rizin-modal-box-title">Alasan Keperluan</div>
                <p className="rizin-modal-box-text">{selected.alasan}</p>
              </div>

              {selected.catatanFasil && (
                <div className={`rizin-catatan-box ${selected.status === 'DITOLAK' ? 'ditolak' : ''}`}>
                  <div className="rizin-catatan-title">
                    {selected.status === 'DISETUJUI' ? 'Catatan Persetujuan Fasilitator:' : 'Alasan Penolakan Fasilitator:'}
                  </div>
                  <p className="rizin-modal-box-text">{selected.catatanFasil}</p>
                </div>
              )}
            </div>

            <div className="rizin-modal-footer">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="btn-lihat-detail"
                style={{ padding: '8px 18px' }}
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
