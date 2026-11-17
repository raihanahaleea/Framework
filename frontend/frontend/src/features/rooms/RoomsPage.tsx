import { useEffect, useState } from 'react';
import { DoorOpen, Plus, Edit2, Power, Search, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import type { Kamar, Gedung } from '../../types';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Kamar[]>([]);
  const [buildings, setBuildings] = useState<Gedung[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Kamar | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    nama: '',
    nomorLantai: 1,
    kapasitas: 4,
    gedungId: '',
  });

  useEffect(() => {
    loadBuildings();
  }, []);

  useEffect(() => {
    loadRooms();
  }, [selectedBuilding]);

  const loadBuildings = async () => {
    try {
      const res = await api.get('/buildings');
      setBuildings(res.data);
      if (res.data.length > 0 && !selectedBuilding) {
        setSelectedBuilding(res.data[0].id);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const loadRooms = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedBuilding) params.gedungId = selectedBuilding;
      const res = await api.get('/rooms', { params });
      setRooms(res.data.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal memuat data kamar');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingRoom(null);
    setForm({
      nama: '',
      nomorLantai: 1,
      kapasitas: 4,
      gedungId: selectedBuilding || (buildings[0]?.id ?? ''),
    });
    setShowModal(true);
  };

  const openEdit = (r: Kamar) => {
    setEditingRoom(r);
    setForm({
      nama: r.nama,
      nomorLantai: r.nomorLantai,
      kapasitas: r.kapasitas,
      gedungId: r.gedungId,
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (r: Kamar) => {
    try {
      await api.patch(`/rooms/${r.id}/status`, { isActive: !r.isActive });
      toast.success(`Kamar ${r.nama} berhasil di-${!r.isActive ? 'aktifkan' : 'nonaktifkan'}`);
      loadRooms();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal mengubah status kamar');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim()) {
      toast.error('Nama kamar wajib diisi');
      return;
    }
    if (!form.gedungId) {
      toast.error('Pilih gedung asrama');
      return;
    }

    setSubmitting(true);
    try {
      if (editingRoom) {
        await api.patch(`/rooms/${editingRoom.id}`, form);
        toast.success('Data kamar berhasil diperbarui');
      } else {
        await api.post('/rooms', form);
        toast.success('Kamar baru berhasil ditambahkan');
      }
      setShowModal(false);
      loadRooms();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan data kamar');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = rooms.filter((r) => r.nama.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <DoorOpen size={20} className="text-emerald-800" />
            Data Kamar Asrama
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola alokasi unit kamar, daya tampung, dan lantai per gedung</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-xs hover:shadow transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          Tambah Kamar
        </button>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari unit kamar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
          />
        </div>

        <div>
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700 text-slate-700 font-medium"
          >
            <option value="">Semua Gedung Asrama</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nama}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white px-3.5 py-2 border border-slate-200 rounded-lg text-xs flex items-center justify-between text-slate-600">
          <span>Total Unit Kamar:</span>
          <span className="font-bold text-slate-900">{filtered.length} Unit</span>
        </div>
      </div>

      {/* Structured Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 skeleton rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <DoorOpen size={40} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs font-medium">Tidak ada data unit kamar ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="text-left py-3 px-4">Nama Kamar</th>
                  <th className="text-left py-3 px-4">Gedung</th>
                  <th className="text-left py-3 px-4">Lantai</th>
                  <th className="text-left py-3 px-4">Kapasitas Penghuni</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((r) => {
                  const occupied = r._count?.users ?? 0;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                        <DoorOpen size={14} className="text-emerald-800" />
                        {r.nama}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{r.gedung?.nama || '-'}</td>
                      <td className="py-3 px-4 text-slate-600">Lantai {r.nomorLantai}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-800 font-medium">
                            {occupied} / {r.kapasitas} org
                          </span>
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                occupied >= r.kapasitas ? 'bg-red-500' : 'bg-emerald-600'
                              }`}
                              style={{ width: `${Math.min(100, (occupied / r.kapasitas) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge ${r.isActive ? 'badge-hadir' : 'badge-alpa'}`}>
                          {r.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(r)}
                            className={`p-1 rounded text-xs font-medium transition-colors ${
                              r.isActive ? 'text-red-700 hover:bg-red-50' : 'text-emerald-800 hover:bg-emerald-50'
                            }`}
                            title={r.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            <Power size={13} />
                          </button>
                          <button
                            onClick={() => openEdit(r)}
                            className="p-1 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors"
                            title="Edit Kamar"
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
      </div>

      {/* Modal Tambah / Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 animate-fade-in shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
              {editingRoom ? 'Edit Data Kamar' : 'Tambah Kamar Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gedung Asrama</label>
                <select
                  required
                  value={form.gedungId}
                  onChange={(e) => setForm({ ...form, gedungId: e.target.value })}
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama / Nomor Kamar</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kamar 101"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Lantai</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={form.nomorLantai}
                    onChange={(e) => setForm({ ...form, nomorLantai: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kapasitas (Orang)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={form.kapasitas}
                    onChange={(e) => setForm({ ...form, kapasitas: parseInt(e.target.value) || 4 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
                  />
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
                  className="flex-1 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
