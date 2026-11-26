import { useEffect, useState } from 'react';
import {
  FileText, CheckCircle, XCircle, Eye, Loader2,
  ShieldCheck, X
} from 'lucide-react';
import api from '../../lib/api';
import { formatDate, getStatusIzinLabel } from '../../lib/utils';
import { toast } from 'sonner';
import type { PengajuanIzin, PaginatedResponse } from '../../types';
import './LeaveApprovalPage.css';

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

  const tabs = [
    { key: 'MENUNGGU', label: 'Perlu Ditinjau' },
    { key: 'DISETUJUI', label: 'Telah Disetujui' },
    { key: 'DITOLAK', label: 'Ditolak' },
    { key: 'ALL', label: 'Semua Permohonan' },
  ];

  return (
    <div className="lapp-page animate-fade-in">
      {/* ===== Header Banner ===== */}
      <div className="lapp-banner">
        <div className="lapp-banner-left">
          <div className="lapp-badge">
            <ShieldCheck size={14} />
            Portal Fasilitator • Verifikasi Perizinan
          </div>
          <h1 className="lapp-title">Verifikasi &amp; Persetujuan Izin Asrama</h1>
          <p className="lapp-subtitle">
            Tinjau, beri catatan arahan tata tertib, dan proses permohonan izin meninggalkan asrama yang diajukan oleh warga asrama.
          </p>
        </div>
      </div>

      {/* ===== Tabs Bar ===== */}
      <div className="lapp-tabs-bar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setStatusTab(tab.key as any);
              setMeta((m) => ({ ...m, page: 1 }));
            }}
            className={`lapp-tab-btn ${statusTab === tab.key ? 'active' : ''}`}
          >
            <span>{tab.label}</span>
            {statusTab === tab.key && meta.total > 0 && (
              <span className="lapp-tab-count">{meta.total}</span>
            )}
          </button>
        ))}
      </div>

      {/* ===== List Cards ===== */}
      <div className="lapp-list-container">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 skeleton rounded-xl" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center text-slate-400">
            <CheckCircle size={44} className="mx-auto mb-2 opacity-30 text-emerald-700" />
            <p className="text-xs font-semibold text-slate-700">Tidak ada permohonan izin dalam kategori ini</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Semua permohonan telah selesai diproses.</p>
          </div>
        ) : (
          data.map((item) => {
            const userInitial = item.user?.name ? item.user.name.charAt(0).toUpperCase() : 'W';

            return (
              <div key={item.id} className="lapp-item-card">
                <div className="lapp-item-top">
                  <div className="lapp-user-info">
                    <div className="lapp-user-avatar">{userInitial}</div>
                    <div>
                      <h3 className="lapp-user-name">{item.user?.name || 'Warga Asrama'}</h3>
                      <p className="lapp-user-nim">NIM: {item.user?.nim || '-'}</p>
                    </div>
                  </div>
                  <div>{statusBadge(item.status)}</div>
                </div>

                <div className="lapp-meta-grid">
                  <div className="lapp-meta-item">
                    <span className="lapp-meta-label">Jenis Izin:</span>
                    <span className="lapp-meta-val">{item.jenisIzin}</span>
                  </div>
                  <div className="lapp-meta-item">
                    <span className="lapp-meta-label">Periode:</span>
                    <span className="lapp-meta-val">
                      {formatDate(item.tanggalMulai)} &ndash; {formatDate(item.tanggalSelesai)}
                    </span>
                  </div>
                </div>

                <div className="lapp-reason-box">
                  <div className="lapp-reason-label">Alasan Permohonan:</div>
                  <p className="lapp-reason-text">{item.alasan}</p>
                </div>

                {item.catatanFasil && (
                  <div className={`lapp-catatan-box ${item.status === 'DITOLAK' ? 'ditolak' : ''}`}>
                    <strong>Catatan Petugas:</strong> {item.catatanFasil}
                  </div>
                )}

                <div className="lapp-item-actions">
                  <button
                    onClick={() => setSelected(item)}
                    className="btn-lapp-detail"
                  >
                    <Eye size={13} />
                    <span>Lihat Rincian</span>
                  </button>

                  {item.status === 'MENUNGGU' && (
                    <>
                      <button
                        onClick={() => {
                          setActionModal({ item, action: 'DITOLAK' });
                          setCatatan('');
                        }}
                        className="btn-lapp-tolak"
                      >
                        <XCircle size={13} />
                        <span>Tolak</span>
                      </button>
                      <button
                        onClick={() => {
                          setActionModal({ item, action: 'DISETUJUI' });
                          setCatatan('Disetujui. Harap mematuhi tata tertib asrama.');
                        }}
                        className="btn-lapp-setujui"
                      >
                        <CheckCircle size={13} />
                        <span>Setujui</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}

        {meta.totalPages > 1 && (
          <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 flex items-center justify-between text-xs text-slate-500">
            <span>
              Halaman <strong>{meta.page}</strong> dari <strong>{meta.totalPages}</strong> ({meta.total} data)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setMeta((m) => ({ ...m, page: m.page - 1 }))}
                disabled={meta.page <= 1}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs disabled:opacity-40 font-semibold hover:bg-slate-50"
              >
                &larr; Sebelumnya
              </button>
              <button
                onClick={() => setMeta((m) => ({ ...m, page: m.page + 1 }))}
                disabled={meta.page >= meta.totalPages}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs disabled:opacity-40 font-semibold hover:bg-slate-50"
              >
                Selanjutnya &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== Action Decision Modal ===== */}
      {actionModal && (
        <div className="lapp-modal-overlay" onClick={() => setActionModal(null)}>
          <div className="lapp-modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="lapp-modal-header">
              <h3 className="lapp-modal-title">
                {actionModal.action === 'DISETUJUI' ? 'Setujui Permohonan Izin' : 'Tolak Permohonan Izin'}
              </h3>
              <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-slate-700">
                <X size={17} />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3.5">
              Konfirmasi status perizinan untuk <strong>{actionModal.item.user?.name}</strong> (NIM: {actionModal.item.user?.nim || '-'})
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Catatan Arahan / Alasan Keputusan (Opsional):
              </label>
              <textarea
                rows={3}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Tuliskan catatan atau instruksi bagi penghuni..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-700"
              />
            </div>

            <div className="flex gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold text-xs hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDecision}
                className={`flex-1 py-2 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${actionModal.action === 'DISETUJUI' ? 'bg-emerald-800 hover:bg-emerald-700' : 'bg-red-700 hover:bg-red-800'
                  }`}
              >
                {submitting ? <Loader2 size={13} className="animate-spin" /> : 'Konfirmasi Keputusan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Detail Modal ===== */}
      {selected && (
        <div className="lapp-modal-overlay" onClick={() => setSelected(null)}>
          <div className="lapp-modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="lapp-modal-header">
              <h3 className="lapp-modal-title flex items-center gap-1.5">
                <FileText size={17} className="text-emerald-700" />
                Rincian Permohonan Izin
              </h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700">
                <X size={17} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Pemohon</span>
                <span className="font-bold text-slate-900">{selected.user?.name} ({selected.user?.nim})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Jenis Izin</span>
                <span className="font-semibold text-slate-900">{selected.jenisIzin}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Periode Izin</span>
                <span className="text-slate-900 font-semibold">{formatDate(selected.tanggalMulai)} &ndash; {formatDate(selected.tanggalSelesai)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 items-center">
                <span className="text-slate-500 font-medium">Status</span>
                <div>{statusBadge(selected.status)}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] font-bold block mb-1">Alasan Permohonan:</span>
                <p className="text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">{selected.alasan}</p>
              </div>
              {selected.catatanFasil && (
                <div>
                  <span className="text-slate-500 text-[11px] font-bold block mb-1">Catatan Petugas:</span>
                  <p className="text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 leading-relaxed">{selected.catatanFasil}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelected(null)}
              className="mt-4 w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
