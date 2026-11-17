import { useEffect, useState } from 'react';
import { FileClock } from 'lucide-react';
import api from '../../lib/api';
import { formatDate, getStatusIzinLabel } from '../../lib/utils';
import type { PengajuanIzin, PaginatedResponse } from '../../types';

export default function RiwayatIzinPage() {
  const [data, setData] = useState<PengajuanIzin[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PengajuanIzin | null>(null);

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

  const statusBadge = (status: string) => {
    const cls = status === 'DISETUJUI' ? 'badge-disetujui' : status === 'DITOLAK' ? 'badge-ditolak' : 'badge-menunggu';
    return <span className={`badge ${cls}`}>{getStatusIzinLabel(status as any)}</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FileClock size={20} className="text-emerald-800" />
          Riwayat Pengajuan Izin
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Daftar status dan riwayat permohonan izin asrama Anda</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 skeleton rounded-lg" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <FileClock size={40} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs font-medium">Belum ada catatan pengajuan izin</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="text-left py-3 px-4">Tanggal Diajukan</th>
                  <th className="text-left py-3 px-4">Jenis Perizinan</th>
                  <th className="text-left py-3 px-4">Periode Tanggal</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500">{formatDate(item.createdAt)}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{item.jenisIzin}</td>
                    <td className="py-3 px-4 text-slate-700">
                      {formatDate(item.tanggalMulai)} - {formatDate(item.tanggalSelesai)}
                    </td>
                    <td className="py-3 px-4">{statusBadge(item.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelected(item)}
                        className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-700 px-2 py-1 rounded hover:bg-emerald-50 transition-colors"
                      >
                        Lihat
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

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl max-w-sm w-full p-5 animate-fade-in shadow-xl border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
              Detail Pengajuan Izin
            </h3>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Jenis Izin</span>
                <span className="font-semibold text-slate-900">{selected.jenisIzin}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Periode</span>
                <span className="font-medium text-slate-800">
                  {formatDate(selected.tanggalMulai)} - {formatDate(selected.tanggalSelesai)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Status Keputusan</span>
                {statusBadge(selected.status)}
              </div>
              <div>
                <span className="text-slate-500 text-[11px] font-semibold block mb-0.5">Alasan:</span>
                <p className="text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">{selected.alasan}</p>
              </div>
              {selected.catatanFasil && (
                <div>
                  <span className="text-slate-500 text-[11px] font-semibold block mb-0.5">Catatan Pembina / Fasil:</span>
                  <p className="text-emerald-900 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 font-medium">
                    {selected.catatanFasil}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelected(null)}
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
