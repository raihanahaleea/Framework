import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  UserCircle, Save, Loader2, Lock, ShieldCheck, Mail,
  Hash, MapPin, Building2, DoorOpen, KeyRound, Eye, EyeOff,
  PhoneCall, Shield
} from 'lucide-react';
import { getRoleLabel, getJenisKelaminLabel } from '../../lib/utils';
import api from '../../lib/api';
import { toast } from 'sonner';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [changingPw, setChangingPw] = useState(false);
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error('Konfirmasi kata sandi tidak cocok');
      return;
    }
    if (pwForm.newPassword.length < 8) {
      toast.error('Kata sandi baru minimal 8 karakter');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/auth/change-password', {
        oldPassword: pwForm.oldPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Kata sandi berhasil diperbarui');
      setPwForm({ oldPassword: '', newPassword: '', confirm: '' });
      setChangingPw(false);
      await refreshUser();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal mengubah kata sandi');
    } finally {
      setSubmitting(false);
    }
  };

  const getGedungDisplay = () => {
    if (!user?.gedung) return '-';
    const kode = user.gedung.kode ? `Gedung ${user.gedung.kode} - ` : '';
    const kat = user.gedung.kategori
      ? ` (${user.gedung.kategori === 'PUTRI' ? 'Asrama Putri' : 'Asrama Putra'})`
      : '';
    return `${kode}${user.gedung.nama}${kat}`;
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="profile-page animate-fade-in">
      {/* ===== Header Banner ===== */}
      <div className="profile-banner">
        <div className="profile-banner-left">
          <div className="profile-badge">
            <ShieldCheck size={14} />
            Civitas Akademika Asrama UNAND
          </div>
          <h1 className="profile-title">Profil &amp; Identitas Pengguna</h1>
          <p className="profile-subtitle">
            Informasi identitas resmi terdaftar, penempatan kamar hunian asrama, serta pengaturan keamanan akun Anda.
          </p>
        </div>
        <div className="profile-banner-right">
          <div className="profile-status-pill">
            <span className="status-dot-pulse" />
            <span>Akun Aktif Terverifikasi</span>
          </div>
        </div>
      </div>

      {/* ===== 2-Column Responsive Layout ===== */}
      <div className="profile-grid-layout">
        {/* LEFT COLUMN: Digital Dormitory ID Card */}
        <div className="profile-id-card-wrapper">
          <div className="profile-id-card">
            {/* ID Card Top Header */}
            <div className="id-card-header">
              <div className="id-card-top-row">
                <div className="id-card-institution">
                  <div className="id-card-univ-logo">UA</div>
                  <div>
                    <div className="id-card-univ-name">Universitas Andalas</div>
                    <div className="id-card-dept">UPT Asrama Mahasiswa</div>
                  </div>
                </div>
                <span className="id-card-badge-chip">T.A. 2025/2026</span>
              </div>
            </div>

            {/* Avatar & Identitas Singkat */}
            <div className="id-card-avatar-wrapper">
              <div className="id-card-avatar">
                {userInitial}
              </div>
            </div>

            <div className="id-card-body">
              <h2 className="id-card-name">{user?.name || 'Nama Pengguna'}</h2>
              <div className="id-card-role">
                {user?.role ? getRoleLabel(user.role) : 'Penghuni Asrama'}
              </div>

              {user?.nim && (
                <div className="id-card-nim-pill">
                  <Hash size={13} className="text-emerald-700" />
                  <span>NIM: {user.nim}</span>
                </div>
              )}

              {/* Placement box */}
              <div className="id-card-placement-box">
                <div className="id-card-placement-item">
                  <span className="id-card-placement-label">
                    <Building2 size={13} />
                    Gedung Asrama:
                  </span>
                  <span className="id-card-placement-val">
                    {user?.gedung?.nama ? `Gedung ${user.gedung.kode || ''} - ${user.gedung.nama}` : 'Gedung A - RPX'}
                  </span>
                </div>
                <div className="id-card-placement-item">
                  <span className="id-card-placement-label">
                    <DoorOpen size={13} />
                    Unit Kamar:
                  </span>
                  <span className="id-card-placement-val">
                    {user?.kamar?.nama || 'Kamar 101'}
                  </span>
                </div>
                <div className="id-card-placement-item">
                  <span className="id-card-placement-label">
                    <MapPin size={13} />
                    Asal Daerah:
                  </span>
                  <span className="id-card-placement-val">
                    {user?.asal || 'Sumatera Barat'}
                  </span>
                </div>
              </div>

              {/* Barcode & Verification */}
              <div className="id-card-barcode-box">
                <div className="id-card-barcode-lines">
                  <div className="barcode-line" style={{ width: 2 }} />
                  <div className="barcode-line" style={{ width: 4 }} />
                  <div className="barcode-line" style={{ width: 1 }} />
                  <div className="barcode-line" style={{ width: 3 }} />
                  <div className="barcode-line" style={{ width: 2 }} />
                  <div className="barcode-line" style={{ width: 5 }} />
                  <div className="barcode-line" style={{ width: 2 }} />
                  <div className="barcode-line" style={{ width: 4 }} />
                  <div className="barcode-line" style={{ width: 1 }} />
                  <div className="barcode-line" style={{ width: 3 }} />
                  <div className="barcode-line" style={{ width: 2 }} />
                  <div className="barcode-line" style={{ width: 4 }} />
                  <div className="barcode-line" style={{ width: 3 }} />
                  <div className="barcode-line" style={{ width: 2 }} />
                  <div className="barcode-line" style={{ width: 4 }} />
                </div>
                <span className="id-card-barcode-num">
                  ID: UNAND-ASR-{user?.nim || user?.id?.slice(0, 8) || '2026'}
                </span>
              </div>
            </div>
          </div>

          {/* Help & Support Card */}
          <div className="profile-help-card">
            <div className="profile-help-title">
              <PhoneCall size={14} className="text-emerald-700" />
              <span>Bantuan &amp; Pengaduan Asrama</span>
            </div>
            <p className="profile-help-desc">
              Terdapat kendala data kamar atau akses sistem? Hubungi Kantor Pengelola UPT Asrama Mahasiswa UNAND Gedung Rusunawa.
            </p>
            <div className="profile-help-contact">
              <Shield size={13} />
              <span>Posko Keamanan Asrama: 24 Jam Siaga</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Detailed Information & Security */}
        <div className="profile-main-content">
          {/* Card 1: Data Identitas Resmi */}
          <div className="profile-section-card">
            <div className="profile-section-header">
              <h3 className="profile-section-title">
                <UserCircle size={17} className="text-emerald-700" />
                Data Identitas Terdaftar
              </h3>
              <span className="text-xs text-slate-400 font-medium">Data Resmi Kampus</span>
            </div>

            <div className="profile-section-body">
              <div className="profile-info-grid">
                <div className="profile-info-cell">
                  <div className="profile-cell-icon">
                    <UserCircle size={18} />
                  </div>
                  <div className="profile-cell-content">
                    <span className="profile-cell-label">Nama Lengkap</span>
                    <span className="profile-cell-value">{user?.name || '-'}</span>
                  </div>
                </div>

                <div className="profile-info-cell">
                  <div className="profile-cell-icon">
                    <Mail size={18} />
                  </div>
                  <div className="profile-cell-content">
                    <span className="profile-cell-label">Alamat Email SSO</span>
                    <span className="profile-cell-value">{user?.email || '-'}</span>
                  </div>
                </div>

                <div className="profile-info-cell">
                  <div className="profile-cell-icon">
                    <Hash size={18} />
                  </div>
                  <div className="profile-cell-content">
                    <span className="profile-cell-label">Nomor Induk Mahasiswa (NIM)</span>
                    <span className="profile-cell-value font-mono">{user?.nim || '-'}</span>
                  </div>
                </div>

                <div className="profile-info-cell">
                  <div className="profile-cell-icon">
                    <MapPin size={18} />
                  </div>
                  <div className="profile-cell-content">
                    <span className="profile-cell-label">Asal Daerah / Kota</span>
                    <span className="profile-cell-value">{user?.asal || '-'}</span>
                  </div>
                </div>

                <div className="profile-info-cell">
                  <div className="profile-cell-icon">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="profile-cell-content">
                    <span className="profile-cell-label">Jenis Kelamin</span>
                    <span className="profile-cell-value">
                      {user?.jenisKelamin ? getJenisKelaminLabel(user.jenisKelamin) : '-'}
                    </span>
                  </div>
                </div>

                <div className="profile-info-cell">
                  <div className="profile-cell-icon">
                    <KeyRound size={18} />
                  </div>
                  <div className="profile-cell-content">
                    <span className="profile-cell-label">Peran &amp; Hak Akses</span>
                    <span className="profile-cell-value">
                      {user?.role ? getRoleLabel(user.role) : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Informasi Hunian & Kamar */}
          <div className="profile-section-card">
            <div className="profile-section-header">
              <h3 className="profile-section-title">
                <Building2 size={17} className="text-emerald-700" />
                Penempatan Hunian Asrama
              </h3>
              <span className="text-xs text-slate-400 font-medium">Berdasarkan SK Asrama</span>
            </div>

            <div className="profile-section-body">
              <div className="profile-info-grid">
                <div className="profile-info-cell">
                  <div className="profile-cell-icon">
                    <Building2 size={18} />
                  </div>
                  <div className="profile-cell-content">
                    <span className="profile-cell-label">Kompleks Gedung Asrama</span>
                    <span className="profile-cell-value">{getGedungDisplay()}</span>
                  </div>
                </div>

                <div className="profile-info-cell">
                  <div className="profile-cell-icon">
                    <DoorOpen size={18} />
                  </div>
                  <div className="profile-cell-content">
                    <span className="profile-cell-label">Nomor Unit Kamar</span>
                    <span className="profile-cell-value">
                      {user?.kamar?.nama || 'Kamar G-102'}
                      {user?.kamar?.nomorLantai ? ` (Lantai ${user.kamar.nomorLantai})` : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Keamanan Akun & Perbarui Kata Sandi */}
          <div className="profile-section-card">
            <div className="profile-section-header">
              <h3 className="profile-section-title">
                <Lock size={17} className="text-emerald-700" />
                Keamanan &amp; Kata Sandi
              </h3>
              <span className="text-xs text-slate-400 font-medium">Enkripsi Bcrypt Terproteksi</span>
            </div>

            <div className="profile-section-body">
              <div className="profile-security-banner">
                <div className="profile-security-left">
                  <div className="profile-security-icon">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h4 className="profile-security-heading">Kata Sandi Akun Anda</h4>
                    <p className="profile-security-desc">
                      Disarankan untuk memperbarui kata sandi secara berkala guna menjaga keamanan akun presensi Anda.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setChangingPw(!changingPw)}
                  className="btn-toggle-pw"
                >
                  <Lock size={13} />
                  <span>{changingPw ? 'Tutup Formulir' : 'Ubah Kata Sandi'}</span>
                </button>
              </div>

              {/* Formulir Ganti Kata Sandi */}
              {changingPw && (
                <form onSubmit={handleChangePassword} className="profile-pw-form animate-fade-in">
                  <div className="profile-form-group">
                    <label className="profile-form-label">Kata Sandi Saat Ini</label>
                    <div className="profile-input-wrapper">
                      <Lock size={15} className="profile-input-icon" />
                      <input
                        type={showOldPw ? 'text' : 'password'}
                        required
                        value={pwForm.oldPassword}
                        onChange={(e) => setPwForm({ ...pwForm, oldPassword: e.target.value })}
                        placeholder="Masukkan kata sandi lama Anda"
                        className="profile-pw-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPw(!showOldPw)}
                        className="profile-pw-toggle-btn"
                        tabIndex={-1}
                      >
                        {showOldPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="profile-form-row">
                    <div className="profile-form-group">
                      <label className="profile-form-label">Kata Sandi Baru</label>
                      <div className="profile-input-wrapper">
                        <Lock size={15} className="profile-input-icon" />
                        <input
                          type={showNewPw ? 'text' : 'password'}
                          required
                          value={pwForm.newPassword}
                          onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                          placeholder="Minimal 8 karakter"
                          className="profile-pw-input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPw(!showNewPw)}
                          className="profile-pw-toggle-btn"
                          tabIndex={-1}
                        >
                          {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div className="profile-form-group">
                      <label className="profile-form-label">Konfirmasi Kata Sandi Baru</label>
                      <div className="profile-input-wrapper">
                        <Lock size={15} className="profile-input-icon" />
                        <input
                          type={showConfirmPw ? 'text' : 'password'}
                          required
                          value={pwForm.confirm}
                          onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                          placeholder="Ulangi kata sandi baru"
                          className="profile-pw-input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPw(!showConfirmPw)}
                          className="profile-pw-toggle-btn"
                          tabIndex={-1}
                        >
                          {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="profile-form-actions">
                    <button
                      type="button"
                      onClick={() => setChangingPw(false)}
                      className="btn-toggle-pw"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-simpan-pw"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <Save size={14} />
                          <span>Simpan Kata Sandi</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
