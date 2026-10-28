import { useEffect, useState } from 'react';
import { ScrollText, Search, Clock } from 'lucide-react';
import api from '../../lib/api';
import { formatDateTime } from '../../lib/utils';
import type { AuditLog, PaginatedResponse } from '../../types';

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
    <div className="space-y-6 animate-fade-in">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ScrollText size={20} className="text-emerald-800" />
          Audit Trail & Log Aktivitas
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Rekam jejak setiap aktivitas sistem, perubahan master data, dan integritas keamanan
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari aktivitas, nama pengguna, atau aksi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 skeleton rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <ScrollText size={40} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs font-medium">Belum ada riwayat audit log</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="text-left py-3 px-4">Waktu</th>
                  <th className="text-left py-3 px-4">Aktor / Pengguna</th>
                  <th className="text-left py-3 px-4">Aksi</th>
                  <th className="text-left py-3 px-4">Entitas Terkait</th>
                  <th className="text-left py-3 px-4">Alamat IP</th>
                  <th className="text-right py-3 px-4">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-slate-400" />
                        {formatDateTime(log.createdAt)} WIB
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                          {log.actor?.name.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{log.actor?.name || 'Sistem Otomatis'}</p>
                          <p className="text-[10px] text-slate-400 font-normal">{log.actor?.email || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getActionBadge(log.action)}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="font-semibold text-slate-800">{log.entityType}</span>
                      {log.entityId && <span className="text-slate-400 font-mono ml-1">#{log.entityId}</span>}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-700 px-2 py-1 rounded hover:bg-emerald-50 transition-colors"
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
          <div className="flex items-center justify-between p-3.5 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Halaman {meta.page} dari {meta.totalPages}
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

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4" onClick={() => setSelectedLog(null)}>
          <div className="bg-white rounded-xl max-w-sm w-full p-5 animate-fade-in shadow-xl border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
              Detail Log Aktivitas
            </h3>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Aksi Sistem</span>
                {getActionBadge(selectedLog.action)}
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Pelaksana</span>
                <span className="font-semibold text-slate-900">{selectedLog.actor?.name || 'Sistem'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Waktu Eksekusi</span>
                <span className="font-mono text-[11px]">{formatDateTime(selectedLog.createdAt)} WIB</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">IP Address</span>
                <span className="font-mono text-[11px]">{selectedLog.ipAddress || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold block mb-1">Payload Perubahan:</span>
                <pre className="bg-slate-900 text-slate-100 p-2.5 rounded-lg text-[11px] overflow-x-auto font-mono">
                  {JSON.stringify(selectedLog.details || {}, null, 2)}
                </pre>
              </div>
            </div>

            <button
              onClick={() => setSelectedLog(null)}
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
