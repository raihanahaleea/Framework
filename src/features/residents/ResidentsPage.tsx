import { useEffect, useState } from 'react';
import { Users, Plus, Search, Edit2, Power } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import type { User, PaginatedResponse, Gedung, Kamar } from '../../types';

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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users size={20} className="text-emerald-800" />
            Data Penghuni Asrama
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola identitas, NIM, dan penempatan kamar warga asrama</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-xs hover:shadow transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          Tambah Penghuni
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama, NIM, atau email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setMeta((m) => ({ ...m, page: 1 }));
          }}
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
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Users size={40} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs font-medium">Tidak ada data penghuni ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="text-left py-3 px-4">Nama Penghuni</th>
                  <th className="text-left py-3 px-4">NIM</th>
                  <th className="text-left py-3 px-4">Gedung & Kamar</th>
                  <th className="text-left py-3 px-4">Asal Daerah</th>
                  <th className="text-left py-3 px-4">Status Akun</th>
                  <th className="text-right py-3 px-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {data.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div>
                        <p>{u.name}</p>
                        <p className="text-[11px] text-slate-400 font-normal">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">{u.nim || '-'}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{u.gedung?.nama || '-'}</p>
                      <p className="text-[11px] text-slate-400">{u.kamar?.nama || '-'}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{u.asal || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${u.isActive ? 'badge-hadir' : 'badge-alpa'}`}>
                        {u.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => toggleStatus(u)}
                          className={`p-1 rounded text-xs font-medium transition-colors ${
                            u.isActive ? 'text-red-700 hover:bg-red-50' : 'text-emerald-800 hover:bg-emerald-50'
                          }`}
                          title={u.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          <Power size={13} />
                        </button>
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors"
                          title="Edit Penghuni"
                        >
                          <Edit2 size={13} />
                        </button>
                      </div>
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
              Halaman {meta.page} dari {meta.totalPages} ({meta.total} warga)
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

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 animate-fade-in shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
              {editUser ? 'Edit Data Penghuni' : 'Tambah Penghuni Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NIM</label>
                  <input
                    type="text"
                    required
                    value={form.nim}
                    onChange={(e) => setForm({ ...form, nim: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Resmi</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Asal Daerah</label>
                  <input
                    type="text"
                    value={form.asal}
                    onChange={(e) => setForm({ ...form, asal: e.target.value })}
                    placeholder="Contoh: Bukittinggi"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gedung Asrama</label>
                  <select
                    value={form.gedungId}
                    onChange={(e) => {
                      setForm({ ...form, gedungId: e.target.value, kamarId: '' });
                      if (e.target.value) loadRooms(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kamar Asrama</label>
                  <select
                    value={form.kamarId}
                    onChange={(e) => setForm({ ...form, kamarId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
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

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium text-xs hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs shadow-xs transition-all disabled:opacity-50"
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
