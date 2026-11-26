import { useEffect, useState } from 'react';
import {
  Users, Plus, Search, Edit2, Power, ShieldCheck,
  Building2, DoorOpen, X
} from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import type { User, PaginatedResponse, Gedung, Kamar } from '../../types';
import './ResidentsPage.css';

export default function ResidentsPage() {
  const [data, setData] = useState<User[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [buildings, setBuildings] = useState<Gedung[]>([]);
  const [rooms, setRooms] = useState<Kamar[]>([]);
  const [form, setForm] = useState({
    name: '',
    nim: '',
    email: '',
    password: '',
    asal: '',
    jenisKelamin: '',
    gedungId: '',
    kamarId: '',
    role: 'PENGHUNI',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
    loadBuildings();
  }, [meta.page, search]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<User>>('/users', {
        params: { page: meta.page, limit: meta.limit, search, role: 'PENGHUNI' },
      });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadBuildings = async () => {
    try {
      const res = await api.get('/buildings');
      setBuildings(res.data);
    } catch {}
  };

  const loadRooms = async (gedungId: string) => {
    try {
      const res = await api.get('/rooms', { params: { gedungId } });
      setRooms(res.data.data || []);
    } catch {}
  };

  const openCreate = () => {
    setEditUser(null);
    setForm({
      name: '',
      nim: '',
      email: '',
      password: '',
      asal: '',
      jenisKelamin: '',
      gedungId: '',
      kamarId: '',
      role: 'PENGHUNI',
    });
    setRooms([]);
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    setEditUser(u);
    setForm({
      name: u.name,
      nim: u.nim || '',
      email: u.email,
      password: '',
      asal: u.asal || '',
      jenisKelamin: u.jenisKelamin || '',
      gedungId: u.gedungId || '',
      kamarId: u.kamarId || '',
      role: u.role,
    });
    if (u.gedungId) loadRooms(u.gedungId);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = { ...form };
      if (!payload.password) delete payload.password;
      if (editUser) {
        await api.patch(`/users/${editUser.id}`, payload);
        toast.success('Data penghuni berhasil diperbarui');
      } else {
        await api.post('/users', payload);
        toast.success('Penghuni berhasil ditambahkan');
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (u: User) => {
    try {
      await api.patch(`/users/${u.id}/status`, { isActive: !u.isActive });
      toast.success(`Akun ${u.name} berhasil ${u.isActive ? 'dinonaktifkan' : 'diaktifkan'}`);
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal mengubah status');
    }
  };

  return (
    <div className="res-page animate-fade-in">
      {/* ===== Header Banner ===== */}
      <div className="res-banner">
        <div className="res-banner-left">
          <div className="res-badge">
            <ShieldCheck size={14} />
            Data Warga • UPT Asrama Mahasiswa UNAND
          </div>
          <h1 className="res-title">Data &amp; Penempatan Penghuni Asrama</h1>
          <p className="res-subtitle">
            Kelola data identitas warga asrama, nomor induk mahasiswa (NIM), penempatan hunian gedung &amp; kamar, serta status keaktifan akun.
          </p>
        </div>
        <div className="res-banner-right">
          <button
            onClick={openCreate}
            className="btn-tambah-penghuni"
          >
            <Plus size={16} />
            <span>Tambah Penghuni</span>
          </button>
        </div>
      </div>

      {/* ===== Search Input ===== */}
      <div className="res-search-wrapper">
        <Search size={16} className="res-search-icon" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama lengkap penghuni, NIM, atau alamat email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setMeta((m) => ({ ...m, page: 1 }));
          }}
          className="res-search-input"
        />
      </div>

      {/* ===== Table Card ===== */}
      <div className="res-table-card">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-11 skeleton rounded-lg" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-14 text-slate-400">
            <Users size={44} className="mx-auto mb-2 opacity-30 text-emerald-700" />
            <p className="text-xs font-semibold text-slate-700">Tidak ada data penghuni ditemukan</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Coba ubah kata kunci pencarian Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="res-table">
              <thead>
                <tr>
                  <th>Nama Penghuni</th>
                  <th>NIM</th>
                  <th>Gedung &amp; Kamar</th>
                  <th>Asal Daerah</th>
                  <th>Status Akun</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((u) => {
                  const userInitial = u.name ? u.name.charAt(0).toUpperCase() : 'U';

                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="res-user-cell">
                          <div className="res-avatar">{userInitial}</div>
                          <div>
                            <p className="font-semibold text-slate-900">{u.name}</p>
                            <p className="text-[11px] text-slate-400 font-normal">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono font-medium text-slate-800">{u.nim || '-'}</td>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 flex items-center gap-1">
                            <Building2 size={12} className="text-emerald-700" />
                            {u.gedung?.nama || '-'}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <DoorOpen size={11} className="text-slate-400" />
                            {u.kamar?.nama || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="text-slate-600">{u.asal || '-'}</td>
                      <td>
                        <span className={`badge ${u.isActive ? 'badge-hadir' : 'badge-alpa'}`}>
                          {u.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => toggleStatus(u)}
                            className={`res-action-btn ${u.isActive ? 'res-action-power-on' : 'res-action-power-off'}`}
                            title={u.isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                          >
                            <Power size={13} />
                          </button>
                          <button
                            onClick={() => openEdit(u)}
                            className="res-action-btn res-action-edit"
                            title="Edit Data Penghuni"
                          >
                            <Edit2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="res-pagination">
            <span>
              Halaman <strong>{meta.page}</strong> dari <strong>{meta.totalPages}</strong> ({meta.total} warga terdaftar)
            </span>
            <div className="res-page-btns">
              <button
                onClick={() => setMeta((m) => ({ ...m, page: m.page - 1 }))}
                disabled={meta.page <= 1}
                className="res-page-btn"
              >
                &larr; Sebelumnya
              </button>
              <button
                onClick={() => setMeta((m) => ({ ...m, page: m.page + 1 }))}
                disabled={meta.page >= meta.totalPages}
                className="res-page-btn"
              >
                Selanjutnya &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== Modal Form Tambah / Edit ===== */}
      {showModal && (
        <div className="res-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="res-modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="res-modal-header">
              <h3 className="res-modal-title">
                {editUser ? 'Edit Data Penghuni' : 'Tambah Penghuni Asrama Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIM</label>
                  <input
                    type="text"
                    required
                    value={form.nim}
                    onChange={(e) => setForm({ ...form, nim: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-emerald-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Email Resmi</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Asal Daerah</label>
                  <input
                    type="text"
                    value={form.asal}
                    onChange={(e) => setForm({ ...form, asal: e.target.value })}
                    placeholder="Contoh: Bukittinggi"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gedung Asrama</label>
                  <select
                    value={form.gedungId}
                    onChange={(e) => {
                      setForm({ ...form, gedungId: e.target.value, kamarId: '' });
                      if (e.target.value) loadRooms(e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-emerald-700"
                  >
                    <option value="">Pilih Gedung...</option>
                    {buildings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kamar Asrama</label>
                  <select
                    value={form.kamarId}
                    onChange={(e) => setForm({ ...form, kamarId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-emerald-700"
                  >
                    <option value="">Pilih Kamar...</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
