import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { UserCircle, Save, Loader2, Lock } from 'lucide-react';
import { getRoleLabel, getJenisKelaminLabel } from '../../lib/utils';
import api from '../../lib/api';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [changingPw, setChangingPw] = useState(false);
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
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
      await api.post('/auth/change-password', { oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
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

  const info = [
    { label: 'Nama Lengkap', value: user?.name },
    { label: 'Alamat Email', value: user?.email },
    { label: 'Nomor Induk Mahasiswa (NIM)', value: user?.nim || '-' },
    { label: 'Asal Daerah', value: user?.asal || '-' },
    { label: 'Jenis Kelamin', value: user?.jenisKelamin ? getJenisKelaminLabel(user.jenisKelamin) : '-' },
    { label: 'Peran / Hak Akses', value: user?.role ? getRoleLabel(user.role) : '-' },
    { label: 'Gedung Asrama', value: user?.gedung?.nama || '-' },
    { label: 'Unit Kamar', value: user?.kamar?.nama || '-' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <UserCircle size={20} className="text-emerald-800" />
          Informasi Profil Pengguna
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Detail identitas resmi dan keamanan akun Anda</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <div className="flex items-center gap-4 mb-5 pb-4 border-b border-slate-100">
          <div className="w-14 h-14 rounded-xl bg-emerald-800 text-white flex items-center justify-center text-xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{user?.name}</h2>
            <p className="text-xs text-slate-500 font-medium">
              {user?.role ? getRoleLabel(user.role) : ''} &bull; Universitas Andalas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {info.map((item) => (
            <div key={item.label} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">{item.label}</span>
              <span className="font-semibold text-slate-800">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Change password toggle */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">Keamanan Akses Akun</span>
          <button
            onClick={() => setChangingPw(!changingPw)}
            className="px-3 py-1.5 border border-slate-300 hover:border-emerald-700 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Lock size={13} />
            <span>{changingPw ? 'Tutup Formulir' : 'Ubah Kata Sandi'}</span>
          </button>
        </div>

        {/* Password Form */}
        {changingPw && (
          <form onSubmit={handleChangePassword} className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-fade-in">
            <h3 className="text-xs font-bold text-slate-900">Perbarui Kata Sandi Akun</h3>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kata Sandi Saat Ini</label>
              <input
                type="password"
                required
                value={pwForm.oldPassword}
                onChange={(e) => setPwForm({ ...pwForm, oldPassword: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kata Sandi Baru</label>
                <input
                  type="password"
                  required
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  placeholder="Min. 8 karakter"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Konfirmasi Kata Sandi</label>
                <input
                  type="password"
                  required
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              <span>Simpan Kata Sandi</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
