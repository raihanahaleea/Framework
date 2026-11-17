import { useEffect, useState } from 'react';
import { FileText, CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { formatDate, getStatusIzinLabel } from '../../lib/utils';
import { toast } from 'sonner';
import type { PengajuanIzin, PaginatedResponse } from '../../types';

export default function LeaveApprovalPage() {
  const [data, setData] = useState<PengajuanIzin[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState<'ALL' | 'MENUNGGU' | 'DISETUJUI' | 'DITOLAK'>('MENUNGGU');
  const [selected, setSelected] = useState<PengajuanIzin | null>(null);
  const [actionModal, setActionModal] = useState<{ item: PengajuanIzin; action: 'DISETUJUI' | 'DITOLAK' } | null>(null);
  const [catatan, setCatatan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadLeaves();
  }, [meta.page, statusTab]);

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const params: any = { page: meta.page, limit: meta.limit };
      if (statusTab !== 'ALL') params.status = statusTab;

      const res = await api.get<PaginatedResponse<PengajuanIzin>>('/leave-requests', { params });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async () => {
    if (!actionModal) return;
    setSubmitting(true);
    try {
      await api.patch(`/leave-requests/${actionModal.item.id}/status`, {
        status: actionModal.action,
        catatanFasil: catatan.trim() || undefined,
      });
      toast.success(
        `Pengajuan izin berhasil ${actionModal.action === 'DISETUJUI' ? 'disetujui' : 'ditolak'}`
      );
      setActionModal(null);
      setCatatan('');
      loadLeaves();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal memproses keputusan izin');
    } finally {
      setSubmitting(false);
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
          <FileText size={20} className="text-emerald-800" />
          Verifikasi & Persetujuan Perizinan
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Tinjau dan proses permohonan izin meninggalkan asrama oleh warga asrama</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        {[
          { key: 'MENUNGGU', label: 'Perlu Ditinjau' },
          { key: 'DISETUJUI', label: 'Disetujui' },
          { key: 'DITOLAK', label: 'Ditolak' },
          { key: 'ALL', label: 'Semua Status' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setStatusTab(tab.key as any);
              setMeta((m) => ({ ...m, page: 1 }));
            }}
            className={`pb-2.5 font-bold text-xs transition-colors relative tracking-wide ${
              statusTab === tab.key
                ? 'text-emerald-800 border-b-2 border-emerald-800'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 skeleton rounded-lg" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <CheckCircle size={40} className="mx-auto mb-2 opacity-30 text-emerald-600" />
            <p className="text-xs font-medium">Tidak ada permohonan izin dalam kategori ini</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.map((item) => (
              <div key={item.id} className="p-4 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-slate-900 text-sm">{item.user?.name || 'Warga Asrama'}</span>
                    <span className="text-[11px] text-slate-400 font-mono">NIM: {item.user?.nim || '-'}</span>
                    {statusBadge(item.status)}
                  </div>
                  <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      Jenis Izin: <strong className="text-slate-700">{item.jenisIzin}</strong>
                    </span>
                    <span>
                      Periode: <strong className="text-slate-700">{formatDate(item.tanggalMulai)} - {formatDate(item.tanggalSelesai)}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 mt-1">
                    <span className="font-semibold text-slate-500 text-[10px] uppercase block mb-0.5">Alasan Permohonan:</span>
                    {item.alasan}
                  </p>
                  {item.catatanFasil && (
                    <p className="text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-md border border-emerald-100">
                      <strong>Catatan Petugas:</strong> {item.catatanFasil}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => setSelected(item)}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Eye size={13} /> Detail
                  </button>

                  {item.status === 'MENUNGGU' && (
                    <>
                      <button
                        onClick={() => {
                          setActionModal({ item, action: 'DITOLAK' });
                          setCatatan('');
                        }}
                        className="px-2.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1 border border-red-200"
                      >
                        <XCircle size={13} /> Tolak
                      </button>
                      <button
                        onClick={() => {
                          setActionModal({ item, action: 'DISETUJUI' });
                          setCatatan('Disetujui. Harap mematuhi tata tertib asrama.');
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <CheckCircle size={13} /> Setujui
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decision Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 animate-fade-in shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              {actionModal.action === 'DISETUJUI' ? 'Setujui Permohonan Izin' : 'Tolak Permohonan Izin'}
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              Konfirmasi status untuk permohonan <strong>{actionModal.item.user?.name}</strong>
            </p>

            <div className="mb-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Arahan / Alasan (Opsional)
              </label>
              <textarea
                rows={3}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Tuliskan arahan resmi untuk penghuni..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="flex-1 py-1.5 border border-slate-300 text-slate-700 rounded-lg font-medium text-xs hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDecision}
                className={`flex-1 py-1.5 text-white rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-1.5 ${
                  actionModal.action === 'DISETUJUI' ? 'bg-emerald-800 hover:bg-emerald-700' : 'bg-red-700 hover:bg-red-800'
                }`}
              >
                {submitting ? <Loader2 size={13} className="animate-spin" /> : 'Konfirmasi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl max-w-sm w-full p-5 animate-fade-in shadow-xl border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
              Detail Permohonan Izin
            </h3>
            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Pemohon</span>
                <span className="font-semibold text-slate-900">{selected.user?.name} ({selected.user?.nim})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Jenis Izin</span>
                <span className="font-medium text-slate-900">{selected.jenisIzin}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Periode Izin</span>
                <span className="text-slate-900 font-medium">{formatDate(selected.tanggalMulai)} s/d {formatDate(selected.tanggalSelesai)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Status</span>
                {statusBadge(selected.status)}
              </div>
              <div>
                <span className="text-slate-500 text-[11px] font-semibold block mb-0.5">Alasan:</span>
                <p className="text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">{selected.alasan}</p>
              </div>
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
