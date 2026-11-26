import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ClipboardCheck, Search, Sun, Moon, MapPin,
  Download, CheckCircle, Clock, ShieldCheck, X, AlertCircle,
  History, Calendar
} from 'lucide-react';
import api from '../../lib/api';
import { formatDate, formatTime, getStatusPresensiLabel } from '../../lib/utils';
import type { Presensi, PaginatedResponse } from '../../types';
import './MonitoringPresensiPage.css';

export default function MonitoringPresensiPage() {
  const location = useLocation();
  const isRiwayat = location.pathname.includes('riwayat');

  const [data, setData] = useState<Presensi[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jenisFilter, setJenisFilter] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [selectedItem, setSelectedItem] = useState<Presensi | null>(null);

  useEffect(() => {
    loadAttendance();
  }, [meta.page, search, statusFilter, jenisFilter, tanggalMulai, tanggalSelesai, isRiwayat]);

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

      if (isRiwayat) {
        if (tanggalMulai) params.tanggalMulai = tanggalMulai;
        if (tanggalSelesai) params.tanggalSelesai = tanggalSelesai;
      }

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
    const prefix = isRiwayat ? 'riwayat_presensi_asrama' : 'monitoring_presensi_hari_ini';
    link.setAttribute('download', `${prefix}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const todayStr = formatDate(new Date());

  return (
    <div className="mon-page animate-fade-in">
      {/* ===== Header Banner ===== */}
      <div className="mon-banner">
        <div className="mon-banner-left">
          {isRiwayat ? (
            <>
              <div className="mon-badge">
                <History size={14} />
                Arsip Historis • UPT Asrama Mahasiswa UNAND
              </div>
              <h1 className="mon-title">Riwayat &amp; Arsip Presensi Asrama</h1>
              <p className="mon-subtitle">
                Pencarian, audit, dan peninjauan rekaman kepatuhan presensi masa lalu seluruh warga asrama berdasarkan rentang tanggal kalender dan sesi.
              </p>
            </>
          ) : (
            <>
              <div className="mon-badge">
                <ShieldCheck size={14} />
                Live Tracking • Sesi Presensi Hari Ini
              </div>
              <h1 className="mon-title">Monitoring Presensi Real-Time</h1>
              <p className="mon-subtitle">
                Pemantauan langsung kehadiran sesi aktif hari ini (Subuh &amp; Malam), verifikasi foto selfie mandiri, dan validasi radius koordinat GPS warga asrama.
              </p>
            </>
          )}
        </div>
        <div className="mon-banner-right">
          {!isRiwayat && (
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Live: {todayStr}</span>
            </div>
          )}
          <button
            onClick={handleExportCSV}
            className="btn-export-csv"
            title="Unduh seluruh baris yang tampil ke format file CSV"
          >
            <Download size={15} />
            <span>{isRiwayat ? 'Ekspor Laporan Riwayat (CSV)' : 'Ekspor Data Hari Ini (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* ===== 3 Summary Stat Cards ===== */}
      <div className="mon-stats-grid">
        <div className="mon-stat-card">
          <div>
            <p className="mon-stat-label">
              {isRiwayat ? 'Total Hadir Tercatat' : 'Hadir Terverifikasi Hari Ini'}
            </p>
            <p className="mon-stat-val text-emerald-800">{hadirCount}</p>
          </div>
          <div className="mon-stat-icon icon-hadir">
            <CheckCircle size={20} />
          </div>
        </div>

        <div className="mon-stat-card">
          <div>
            <p className="mon-stat-label">
              {isRiwayat ? 'Total Izin Tercatat' : 'Izin Terkonfirmasi Hari Ini'}
            </p>
            <p className="mon-stat-val text-amber-700">{izinCount}</p>
          </div>
          <div className="mon-stat-icon icon-izin">
            <Clock size={20} />
          </div>
        </div>

        <div className="mon-stat-card">
          <div>
            <p className="mon-stat-label">
              {isRiwayat ? 'Total Alpa Tercatat' : 'Alpa / Belum Presensi Hari Ini'}
            </p>
            <p className="mon-stat-val text-red-700">{alpaCount}</p>
          </div>
          <div className="mon-stat-icon icon-alpa">
            <AlertCircle size={20} />
          </div>
        </div>
      </div>

      {/* ===== Filters Bar ===== */}
      {isRiwayat ? (
        /* Riwayat Presensi Filter: Includes Date Range */
        <div className="mon-filter-bar-riwayat">
          <div className="mon-search-box">
            <Search size={16} className="mon-search-icon" />
            <input
              type="text"
              placeholder="Cari nama warga atau NIM..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setMeta((m) => ({ ...m, page: 1 }));
              }}
              className="mon-search-input"
            />
          </div>

          <div className="mon-date-group">
            <label className="mon-date-label flex items-center gap-1">
              <Calendar size={11} className="text-emerald-700" />
              Dari Tanggal
            </label>
            <input
              type="date"
              value={tanggalMulai}
              onChange={(e) => {
                setTanggalMulai(e.target.value);
                setMeta((m) => ({ ...m, page: 1 }));
              }}
              className="mon-date-input"
            />
          </div>

          <div className="mon-date-group">
            <label className="mon-date-label flex items-center gap-1">
              <Calendar size={11} className="text-emerald-700" />
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={tanggalSelesai}
              onChange={(e) => {
                setTanggalSelesai(e.target.value);
                setMeta((m) => ({ ...m, page: 1 }));
              }}
              className="mon-date-input"
            />
          </div>

          <div className="mon-date-group">
            <label className="mon-date-label">Sesi Presensi</label>
            <select
              value={jenisFilter}
              onChange={(e) => {
                setJenisFilter(e.target.value);
                setMeta((m) => ({ ...m, page: 1 }));
              }}
              className="mon-select"
            >
              <option value="">Semua Sesi</option>
              <option value="SUBUH">Presensi Subuh</option>
              <option value="MALAM">Presensi Malam</option>
            </select>
          </div>

          <div className="mon-date-group">
            <label className="mon-date-label">Status Kehadiran</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setMeta((m) => ({ ...m, page: 1 }));
              }}
              className="mon-select"
            >
              <option value="">Semua Status</option>
              <option value="HADIR">Hadir (Terverifikasi)</option>
              <option value="IZIN">Izin (Disetujui)</option>
              <option value="ALPA">Alpa (Tidak Hadir)</option>
            </select>
          </div>
        </div>
      ) : (
        /* Monitoring Presensi Filter: Real-Time Sesi Hari Ini */
        <div className="mon-filter-bar">
          <div className="mon-search-box">
            <Search size={16} className="mon-search-icon" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama warga atau NIM..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setMeta((m) => ({ ...m, page: 1 }));
              }}
              className="mon-search-input"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setMeta((m) => ({ ...m, page: 1 }));
              }}
              className="mon-select"
            >
              <option value="">Semua Status Hari Ini</option>
              <option value="HADIR">Hadir (Terverifikasi)</option>
              <option value="IZIN">Izin (Disetujui)</option>
              <option value="ALPA">Alpa (Belum Presensi)</option>
            </select>
          </div>

          <div>
            <select
              value={jenisFilter}
              onChange={(e) => {
                setJenisFilter(e.target.value);
                setMeta((m) => ({ ...m, page: 1 }));
              }}
              className="mon-select"
            >
              <option value="">Semua Sesi Aktif</option>
              <option value="SUBUH">Presensi Subuh (04:30 - 07:00)</option>
              <option value="MALAM">Presensi Malam (21:00 - 23:00)</option>
            </select>
          </div>
        </div>
      )}

      {/* ===== Table Container ===== */}
      <div className="mon-table-card">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-11 skeleton rounded-lg" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-14 text-slate-400">
            <ClipboardCheck size={44} className="mx-auto mb-2 opacity-30 text-emerald-700" />
            <p className="text-xs font-semibold text-slate-700">
              {isRiwayat ? 'Tidak ada arsip presensi yang sesuai rentang filter' : 'Belum ada data presensi untuk sesi hari ini'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isRiwayat ? 'Silakan sesuaikan tanggal mulai dan tanggal selesai di atas.' : 'Data akan muncul otomatis ketika warga asrama melakukan check-in.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="mon-table">
              <thead>
                <tr>
                  <th>Warga Asrama</th>
                  <th>Bukti Selfie</th>
                  <th>Penempatan Kamar</th>
                  <th>Sesi</th>
                  <th>Waktu Check-In</th>
                  <th>Jarak ke Pusat</th>
                  <th>Koordinat GPS</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((p) => {
                  const photo = p.fotoWajah || p.foto_wajah;
                  const distance = p.jarakMeter ?? p.jarak_meter;

                  return (
                    <tr key={p.id}>
                      <td>
                        <div>
                          <p className="font-semibold text-slate-900">{p.user?.name || '-'}</p>
                          <p className="text-[11px] text-slate-400 font-mono font-medium">{p.user?.nim || '-'}</p>
                        </div>
                      </td>
                      <td>
                        {photo ? (
                          <div
                            onClick={() => setSelectedItem(p)}
                            className="selfie-thumb"
                            title="Klik untuk memperbesar bukti foto selfie"
                          >
                            <img
                              src={photo}
                              alt="Selfie"
                              className="selfie-img"
                            />
                          </div>
                        ) : (
                          <span className="qr-chip">
                            QR Presensi
                          </span>
                        )}
                      </td>
                      <td>
                        <p className="font-medium text-slate-800">{p.user?.gedung?.nama || '-'}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{p.user?.kamar?.nama || '-'}</p>
                      </td>
                      <td>
                        <span className={`sesi-badge ${p.jenisPresensi === 'SUBUH' ? 'subuh' : 'malam'}`}>
                          {p.jenisPresensi === 'SUBUH' ? (
                            <Sun size={12} className="text-amber-500" />
                          ) : (
                            <Moon size={12} className="text-emerald-700" />
                          )}
                          <span>{p.jenisPresensi === 'SUBUH' ? 'Subuh' : 'Malam'}</span>
                        </span>
                      </td>
                      <td>
                        <p className="font-mono text-slate-800 font-semibold">{formatTime(p.waktu)} WIB</p>
                        <p className="text-[11px] text-slate-400">{formatDate(p.tanggalPresensi)}</p>
                      </td>
                      <td>
                        {distance !== undefined && distance !== null ? (
                          <span className={`font-semibold ${distance <= 200 ? 'text-emerald-800' : 'text-rose-600'}`}>
                            {distance} m
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Dalam Radius</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-1 font-mono text-[11px] text-slate-600">
                          <MapPin size={12} className="text-emerald-700 flex-shrink-0" />
                          <span>
                            {p.latitude ? `${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}` : '-'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${p.status.toLowerCase()}`}>
                          {getStatusPresensiLabel(p.status)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedItem(p)}
                          className="btn-detail"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {meta.totalPages > 1 && (
          <div className="mon-pagination">
            <span>
              Halaman <strong>{meta.page}</strong> dari <strong>{meta.totalPages}</strong> ({meta.total} rekaman data)
            </span>
            <div className="mon-page-btns">
              <button
                onClick={() => setMeta((m) => ({ ...m, page: m.page - 1 }))}
                disabled={meta.page <= 1}
                className="mon-page-btn"
              >
                &larr; Sebelumnya
              </button>
              <button
                onClick={() => setMeta((m) => ({ ...m, page: m.page + 1 }))}
                disabled={meta.page >= meta.totalPages}
                className="mon-page-btn"
              >
                Selanjutnya &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== Modal Detail Presensi ===== */}
      {selectedItem && (
        <div className="mon-modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="mon-modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="mon-modal-header">
              <h3 className="mon-modal-title">
                <ClipboardCheck size={18} className="text-emerald-700" />
                Rincian Verifikasi Presensi
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="mon-modal-close"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            {/* Photo preview */}
            <div className="mb-3.5">
              {selectedItem.fotoWajah || selectedItem.foto_wajah ? (
                <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-950 border border-slate-200">
                  <img
                    src={selectedItem.fotoWajah || selectedItem.foto_wajah || ''}
                    alt="Foto Selfie Bukti"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] py-1.5 px-3 rounded-lg flex items-center justify-between">
                    <span>Foto Selfie Presensi</span>
                    <span className="font-mono">{formatTime(selectedItem.waktu)} WIB</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center bg-slate-50">
                  <p className="text-xs font-semibold text-slate-700">Presensi Berbasis QR Code</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Check-in tercatat melalui pemindaian QR Code resmi asrama.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div className="flex justify-between py-0.5 border-b border-slate-200/50">
                <span className="text-slate-500 font-medium">Warga Asrama</span>
                <span className="font-bold text-slate-900">{selectedItem.user?.name}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-200/50">
                <span className="text-slate-500 font-medium">NIM</span>
                <span className="font-mono text-slate-800 font-semibold">{selectedItem.user?.nim || '-'}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-200/50">
                <span className="text-slate-500 font-medium">Gedung &amp; Kamar</span>
                <span className="font-semibold text-slate-800">
                  {selectedItem.user?.gedung?.nama} ({selectedItem.user?.kamar?.nama || '-'})
                </span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-200/50">
                <span className="text-slate-500 font-medium">Waktu &amp; Sesi</span>
                <span className="font-mono font-semibold text-slate-900">
                  {formatTime(selectedItem.waktu)} WIB ({selectedItem.jenisPresensi})
                </span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-200/50">
                <span className="text-slate-500 font-medium">Jarak ke Pusat</span>
                <span className="font-bold text-emerald-800">
                  {selectedItem.jarakMeter ?? selectedItem.jarak_meter
                    ? `${selectedItem.jarakMeter ?? selectedItem.jarak_meter} meter`
                    : 'Dalam Radius Terverifikasi'}
                </span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-200/50">
                <span className="text-slate-500 font-medium">Koordinat GPS</span>
                <span className="font-mono text-[11px] text-slate-700">
                  {selectedItem.latitude ? `${selectedItem.latitude.toFixed(5)}, ${selectedItem.longitude.toFixed(5)}` : '-'}
                </span>
              </div>
              <div className="flex justify-between py-0.5 items-center">
                <span className="text-slate-500 font-medium">Status Kehadiran</span>
                <span className={`badge badge-${selectedItem.status.toLowerCase()}`}>
                  {getStatusPresensiLabel(selectedItem.status)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedItem(null)}
              className="mt-4 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
            >
              Tutup Jendela
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
