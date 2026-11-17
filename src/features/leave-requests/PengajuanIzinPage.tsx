import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Upload, Loader2, X, CheckCircle2,
  AlertCircle, Calendar, Info,
} from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import './PengajuanIzinPage.css';

const JENIS_IZIN = ['Sakit', 'Keperluan Keluarga', 'Kegiatan Kampus / Akademik', 'Pulang Kampung', 'Lainnya'];
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function PengajuanIzinPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    jenisIzin: '',
    tanggalMulai: '',
    tanggalSelesai: '',
    alasan: '',
    keterangan: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.jenisIzin) e.jenisIzin = 'Pilih jenis izin yang sesuai';
    if (!form.tanggalMulai) e.tanggalMulai = 'Tanggal mulai izin wajib diisi';
    if (!form.tanggalSelesai) e.tanggalSelesai = 'Tanggal selesai izin wajib diisi';
    if (form.tanggalMulai && form.tanggalSelesai && form.tanggalMulai > form.tanggalSelesai) {
      e.tanggalSelesai = 'Tanggal selesai tidak boleh mendahului tanggal mulai';
    }
    if (!form.alasan.trim()) e.alasan = 'Alasan izin wajib diisi secara jelas';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const valid: File[] = [];
    for (const f of selected) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        toast.error(`${f.name}: Format berkas tidak didukung (Gunakan JPG, PNG, atau PDF)`);
        continue;
      }
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name}: Ukuran berkas melebihi 5MB`);
        continue;
      }
      valid.push(f);
    }
    setFiles((prev) => [...prev, ...valid]);
    e.target.value = '';
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('jenisIzin', form.jenisIzin);
      formData.append('tanggalMulai', form.tanggalMulai);
      formData.append('tanggalSelesai', form.tanggalSelesai);
      formData.append('alasan', form.alasan.trim());
      if (form.keterangan.trim()) formData.append('keterangan', form.keterangan.trim());

      for (const file of files) {
        formData.append('files', file);
      }

      await api.post('/leave-requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Pengajuan izin Anda berhasil dikirim ke fasilitator');
      navigate('/penghuni/riwayat-izin');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal mengirim pengajuan izin');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="izin-page animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">
          <FileText size={20} className="page-title-icon" />
          Pengajuan Izin
        </h1>
        <p className="page-subtitle">
          Surat izin resmi meninggalkan asrama untuk diverifikasi oleh fasilitator
        </p>
      </div>

      <div className="izin-layout">
        {/* Left: Form */}
        <div className="izin-form-col">
          <form onSubmit={handleSubmit} className="card">
            <div className="card-header">
              <div className="card-header-title">
                <FileText size={15} style={{ color: '#047857' }} />
                Formulir Perizinan
              </div>
              <span className="izin-form-badge">Wajib Diisi</span>
            </div>

            <div className="card-body izin-form-body">
              {/* Jenis Izin */}
              <div className="form-field">
                <label className="form-field-label">
                  Jenis Perizinan <span className="required-mark">*</span>
                </label>
                <select
                  value={form.jenisIzin}
                  onChange={(e) => setForm((f) => ({ ...f, jenisIzin: e.target.value }))}
                  className={`form-field-select ${errors.jenisIzin ? 'has-error' : ''}`}
                >
                  <option value="">Pilih Jenis Perizinan...</option>
                  {JENIS_IZIN.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
                {errors.jenisIzin && <p className="form-field-error">{errors.jenisIzin}</p>}
              </div>

              {/* Tanggal Periode */}
              <div className="izin-date-row">
                <div className="form-field">
                  <label className="form-field-label">
                    <Calendar size={12} style={{ marginRight: 4, verticalAlign: -1 }} />
                    Tanggal Mulai <span className="required-mark">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.tanggalMulai}
                    onChange={(e) => setForm((f) => ({ ...f, tanggalMulai: e.target.value }))}
                    className={`form-field-input ${errors.tanggalMulai ? 'has-error' : ''}`}
                    style={{ fontFamily: 'monospace' }}
                  />
                  {errors.tanggalMulai && <p className="form-field-error">{errors.tanggalMulai}</p>}
                </div>
                <div className="form-field">
                  <label className="form-field-label">
                    <Calendar size={12} style={{ marginRight: 4, verticalAlign: -1 }} />
                    Tanggal Selesai <span className="required-mark">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.tanggalSelesai}
                    onChange={(e) => setForm((f) => ({ ...f, tanggalSelesai: e.target.value }))}
                    className={`form-field-input ${errors.tanggalSelesai ? 'has-error' : ''}`}
                    style={{ fontFamily: 'monospace' }}
                  />
                  {errors.tanggalSelesai && <p className="form-field-error">{errors.tanggalSelesai}</p>}
                </div>
              </div>

              {/* Alasan */}
              <div className="form-field">
                <label className="form-field-label">
                  Alasan Permohonan Izin <span className="required-mark">*</span>
                </label>
                <textarea
                  rows={3}
                  value={form.alasan}
                  onChange={(e) => setForm((f) => ({ ...f, alasan: e.target.value }))}
                  placeholder="Jelaskan keperluan dan detail tujuan permohonan izin Anda..."
                  className={`form-field-textarea ${errors.alasan ? 'has-error' : ''}`}
                />
                {errors.alasan && <p className="form-field-error">{errors.alasan}</p>}
              </div>

              {/* Keterangan */}
              <div className="form-field">
                <label className="form-field-label">
                  Keterangan / Kontak Darurat
                </label>
                <textarea
                  rows={2}
                  value={form.keterangan}
                  onChange={(e) => setForm((f) => ({ ...f, keterangan: e.target.value }))}
                  placeholder="Nomor kontak orang tua atau info tambahan lainnya (opsional)"
                  className="form-field-textarea"
                />
              </div>

              {/* File Upload */}
              <div className="form-field">
                <label className="form-field-label">Lampiran Berkas Pendukung</label>
                <div className="upload-zone">
                  <Upload size={28} style={{ color: '#9ca3af', marginBottom: 6 }} />
                  <p className="upload-title">Surat dokter, dispensasi kampus, atau surat orang tua</p>
                  <p className="upload-hint">Format JPG, PNG, PDF (Maks. 5MB)</p>
                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    className="upload-input-hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="upload-btn">
                    Pilih Berkas Lampiran
                  </label>
                </div>
                {files.length > 0 && (
                  <div className="upload-file-list">
                    {files.map((f, i) => (
                      <div key={i} className="upload-file-item">
                        <span className="upload-file-name">{f.name} ({(f.size / 1024).toFixed(0)} KB)</span>
                        <button type="button" onClick={() => removeFile(i)} className="upload-file-remove">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button type="submit" disabled={submitting} className="btn-primary izin-submit-btn">
                {submitting ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Mengirimkan Permohonan...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Kirimkan Pengajuan Izin</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Info Sidebar */}
        <div className="izin-info-col">
          {/* Info Box */}
          <div className="izin-info-card">
            <div className="izin-info-header">
              <Info size={16} style={{ color: '#047857' }} />
              <span>Informasi Perizinan</span>
            </div>
            <div className="izin-info-body">
              <div className="izin-info-item">
                <div className="izin-info-dot green" />
                <p>Pengajuan izin akan diteruskan ke fasilitator gedung untuk diverifikasi.</p>
              </div>
              <div className="izin-info-item">
                <div className="izin-info-dot green" />
                <p>Waktu verifikasi maksimal 1x24 jam hari kerja.</p>
              </div>
              <div className="izin-info-item">
                <div className="izin-info-dot amber" />
                <p>Presensi selama periode izin disetujui otomatis berstatus <strong>"Izin"</strong>.</p>
              </div>
              <div className="izin-info-item">
                <div className="izin-info-dot red" />
                <p>Izin yang ditolak akan dikembalikan dengan catatan fasilitator.</p>
              </div>
            </div>
          </div>

          {/* Notice */}
          <div className="izin-notice-card">
            <AlertCircle size={16} style={{ color: '#6b7280', flexShrink: 0, marginTop: 2 }} />
            <div>
              <p className="izin-notice-title">Perlu bantuan?</p>
              <p className="izin-notice-text">
                Hubungi fasilitator gedung Anda jika mengalami kendala dalam pengajuan izin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
