import { useEffect, useState } from 'react';
import { Users, Plus, Edit2, Search, Power, Building2 } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import type { User, Gedung, PaginatedResponse } from '../../types';

export default function FasilPage() {
  const [data, setData] = useState<User[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [buildings, setBuildings] = useState<Gedung[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingFasil, setEditingFasil] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    gedungIds: [] as string[],
  });

  useEffect(() => {
    loadData();
    loadBuildings();
  }, [meta.page, search]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<User>>('/users', {
        params: { page: meta.page, limit: meta.limit, search, role: 'FASIL' },
      });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal memuat data fasilitator');
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

  const openCreate = () => {
    setEditingFasil(null);
    setForm({ name: '', email: '', password: '', gedungIds: [] });
    setShowModal(true);
  };

  const openEdit = (f: User) => {
    setEditingFasil(f);
    const assignedIds = f.cakupanGedung?.map((cg) => cg.gedung.id) || [];
    setForm({ name: f.name, email: f.email, password: '', gedungIds: assignedIds });
    setShowModal(true);
  };

  const handleToggleStatus = async (f: User) => {
    try {
      await api.patch(`/users/${f.id}/status`, { isActive: !f.isActive });
      toast.success(`Akun fasilitator ${f.name} berhasil di-${!f.isActive ? 'aktifkan' : 'nonaktifkan'}`);
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal mengubah status');
    }
  };

  const toggleBuildingSelection = (id: string) => {
    setForm((prev) => ({
      ...prev,
      gedungIds: prev.gedungIds.includes(id)
        ? prev.gedungIds.filter((gid) => gid !== id)
        : [...prev.gedungIds, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Nama dan email wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        name: form.name,
        email: form.email,
        role: 'FASIL',
      };
      if (form.password) payload.password = form.password;

      if (editingFasil) {
        await api.patch(`/users/${editingFasil.id}`, payload);
        toast.success('Data fasilitator berhasil diperbarui');
      } else {
        await api.post('/users', payload);
        toast.success('Fasilitator baru berhasil ditambahkan');
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users size={20} className="text-emerald-800" />
            Data Fasilitator Asrama
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola akun fasilitator dan penugasan cakupan gedung asrama</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-xs hover:shadow transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          Tambah Fasil
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama fasilitator atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 skeleton rounded-lg" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Users size={40} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs font-medium">Tidak ada data fasilitator</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="text-left py-3 px-4">Nama Fasilitator</th>
                  <th className="text-left py-3 px-4">Email Resmi</th>
                  <th className="text-left py-3 px-4">Cakupan Gedung</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {data.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                          {f.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p>{f.name}</p>
                          <span className="text-[11px] text-slate-400 font-normal">Fasilitator Pembina</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{f.email}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {f.cakupanGedung && f.cakupanGedung.length > 0 ? (
                          f.cakupanGedung.map((cg) => (
                            <span
                              key={cg.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200/60"
                            >
                              <Building2 size={11} />
                              {cg.gedung.nama}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Semua Gedung Asrama</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${f.isActive ? 'badge-hadir' : 'badge-alpa'}`}>
                        {f.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(f)}
                          className={`p-1 rounded text-xs font-medium transition-colors ${
                            f.isActive ? 'text-red-700 hover:bg-red-50' : 'text-emerald-800 hover:bg-emerald-50'
                          }`}
                          title={f.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          <Power size={13} />
                        </button>
                        <button
                          onClick={() => openEdit(f)}
                          className="p-1 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors"
                          title="Edit Fasil"
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
      </div>

      {/* Modal Tambah / Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 animate-fade-in shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
              {editingFasil ? 'Edit Fasilitator' : 'Tambah Fasilitator Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rahmat Hidayat, S.T."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Resmi</label>
                <input
                  type="email"
                  required
                  placeholder="fasil@unand.ac.id"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kata Sandi {editingFasil && '(Kosongkan jika tidak diubah)'}
                </label>
                <input
                  type="password"
                  placeholder={editingFasil ? '••••••••' : 'Password default'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tugaskan Gedung Bimbingan:
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
                  {buildings.map((b) => {
                    const isChecked = form.gedungIds.includes(b.id);
                    return (
                      <label
                        key={b.id}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-white cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleBuildingSelection(b.id)}
                          className="rounded text-emerald-800 focus:ring-emerald-700 h-3.5 w-3.5"
                        />
                        <span className="font-medium text-slate-800">{b.nama}</span>
                      </label>
                    );
                  })}
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
