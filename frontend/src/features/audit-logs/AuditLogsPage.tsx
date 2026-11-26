import { useEffect, useState } from 'react';
import { ScrollText, Search, Clock, ShieldCheck } from 'lucide-react';
import api from '../../lib/api';
import { formatDateTime } from '../../lib/utils';
import type { AuditLog, PaginatedResponse } from '../../types';
import './AuditLogsPage.css';

export default function AuditLogsPage() {
  const [data, setData] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    loadLogs();
  }, [meta.page]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<AuditLog>>('/audit-logs', {
        params: { page: meta.page, limit: meta.limit },
      });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    let color = 'bg-slate-100 text-slate-700 border-slate-200';
    if (action.includes('CREATE') || action.includes('APPROVE')) color = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    else if (action.includes('DELETE') || action.includes('REJECT') || action.includes('BLOCK')) color = 'bg-red-50 text-red-700 border-red-200';
    else if (action.includes('UPDATE')) color = 'bg-blue-50 text-blue-700 border-blue-200';
    else if (action.includes('LOGIN')) color = 'bg-teal-50 text-teal-800 border-teal-200';

    return <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${color}`}>{action}</span>;
  };

  const filtered = data.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actor?.name.toLowerCase().includes(search.toLowerCase()) ||
      l.entityType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="audit-page animate-fade-in">
      {/* ===== Header Banner ===== */}
      <div className="audit-banner">
        <div className="audit-banner-left">
          <div className="audit-badge">
            <ShieldCheck size={14} />
            Panel Administrator • Keamanan &amp; Integritas
          </div>
          <h1 className="audit-title">Audit Trail &amp; Log Aktivitas</h1>
          <p className="audit-subtitle">
            Rekam jejak setiap aktivitas sistem, perubahan master data pengguna, perizinan, dan pemantauan integritas akses.
          </p>
        </div>
      </div>

      {/* ===== Search ===== */}
      <div className="audit-search-wrapper">
        <Search size={16} className="audit-search-icon" />
        <input
          type="text"
          placeholder="Cari aktivitas, nama pengguna, atau aksi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="audit-search-input"
        />
      </div>

      {/* ===== Table ===== */}
      <div className="audit-table-card">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-11 skeleton rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="audit-empty-state">
            <ScrollText size={44} className="mx-auto mb-2 opacity-30 text-emerald-800" />
            <p className="audit-empty-title">Belum ada riwayat log aktivitas</p>
            <p className="audit-empty-desc">Aktivitas sistem dan perubahan data akan dicatat secara otomatis di sini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Waktu &amp; Tanggal</th>
                  <th>Aktor / Pengguna</th>
                  <th>Aksi Sistem</th>
                  <th>Entitas Terkait</th>
                  <th>Alamat IP</th>
                  <th style={{ textAlign: 'right' }}>Detail</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div className="flex items-center gap-2 text-slate-600 font-mono text-[12px]">
                        <Clock size={13} className="text-slate-400" />
                        {formatDateTime(log.createdAt)} WIB
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="audit-actor-avatar">
                          {log.actor?.name.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-[13px]">{log.actor?.name || 'Sistem Otomatis'}</p>
                          <p className="text-[11.5px] text-slate-400 font-normal">{log.actor?.email || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td>{getActionBadge(log.action)}</td>
                    <td>
                      <span className="font-semibold text-slate-800">{log.entityType}</span>
                      {log.entityId && <span className="text-slate-400 font-mono ml-1 text-xs">#{log.entityId}</span>}
                    </td>
                    <td className="font-mono text-[12px] text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="btn-audit-detail"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="audit-pagination">
            <span>
              Halaman {meta.page} dari {meta.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setMeta((m) => ({ ...m, page: m.page - 1 }))}
                disabled={meta.page <= 1}
                className="audit-page-btn"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setMeta((m) => ({ ...m, page: m.page + 1 }))}
                disabled={meta.page >= meta.totalPages}
                className="audit-page-btn"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="audit-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="audit-modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="audit-modal-title">
              Detail Log Aktivitas
            </h3>
            <div>
              <div className="audit-modal-row">
                <span className="audit-modal-label">Aksi Sistem</span>
                {getActionBadge(selectedLog.action)}
              </div>
              <div className="audit-modal-row">
                <span className="audit-modal-label">Pelaksana</span>
                <span className="audit-modal-val">{selectedLog.actor?.name || 'Sistem Otomatis'}</span>
              </div>
              <div className="audit-modal-row">
                <span className="audit-modal-label">Waktu Eksekusi</span>
                <span className="font-mono text-[12px] text-slate-700">{formatDateTime(selectedLog.createdAt)} WIB</span>
              </div>
              <div className="audit-modal-row">
                <span className="audit-modal-label">Alamat IP</span>
                <span className="font-mono text-[12px] text-slate-700">{selectedLog.ipAddress || '-'}</span>
              </div>
              <div className="pt-3">
                <span className="text-slate-500 text-[11px] uppercase font-bold tracking-wider block mb-1.5">
                  Payload Perubahan:
                </span>
                <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl text-[11.5px] overflow-x-auto font-mono leading-relaxed">
                  {JSON.stringify(selectedLog.details || {}, null, 2)}
                </pre>
              </div>
            </div>

            <button
              onClick={() => setSelectedLog(null)}
              className="btn-audit-modal-close"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
