import { useEffect, useState } from 'react';
import { Building2, Plus, Edit2, MapPin, Power, Search, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import type { Gedung } from '../../types';

export default function BuildingsPage() {
  const [data, setData] = useState<Gedung[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Gedung | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    nama: '',
    latitude: -0.9152,
    longitude: 100.4612,
    radiusPresensi: 100,
  });

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/buildings');
      setData(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal memuat data gedung');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingBuilding(null);
    setForm({
      nama: '',
      latitude: -0.9152,
      longitude: 100.4612,
      radiusPresensi: 100,
    });
    setShowModal(true);
  };

  const openEdit = (b: Gedung) => {
    setEditingBuilding(b);
    setForm({
      nama: b.nama,
      latitude: b.latitude,
      longitude: b.longitude,
      radiusPresensi: b.radiusPresensi,
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (b: Gedung) => {
    try {
      await api.patch(`/buildings/${b.id}/status`, { isActive: !b.isActive });
      toast.success(`Gedung ${b.nama} berhasil di-${!b.isActive ? 'aktifkan' : 'nonaktifkan'}`);
      loadBuildings();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal mengubah status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim()) {
      toast.error('Nama gedung wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      if (editingBuilding) {
        await api.patch(`/buildings/${editingBuilding.id}`, form);
        toast.success('Data gedung berhasil diperbarui');
      } else {
        await api.post('/buildings', form);
        toast.success('Gedung baru berhasil ditambahkan');
      }
      setShowModal(false);
      loadBuildings();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan data gedung');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = data.filter((b) => b.nama.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 size={20} className="text-emerald-800" />
            Data Gedung Asrama
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola data gedung, titik koordinat GPS, dan radius presensi geofence</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-xs hover:shadow transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          Tambah Gedung
        </button>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari gedung asrama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
          />
        </div>
        <div className="bg-white px-3.5 py-2 border border-slate-200 rounded-lg text-xs flex items-center justify-between text-slate-600">
          <span>Total Gedung Terdaftar:</span>
          <span className="font-bold text-slate-900">{data.length} Gedung</span>
        </div>
      </div>

      {/* Buildings Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 skeleton rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-10 text-center text-slate-400">
          <Building2 size={40} className="mx-auto mb-2 opacity-30" />
          <p className="text-xs font-medium">Tidak ada data gedung ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{b.nama}</h3>
                      <span className={`badge ${b.isActive ? 'badge-hadir' : 'badge-alpa'} text-[10px] mt-0.5`}>
                        {b.isActive ? 'Status Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 my-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-emerald-700 flex-shrink-0" />
                    <span className="truncate font-mono text-[11px]">
                      {b.latitude.toFixed(6)}, {b.longitude.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                    <span className="text-slate-500">Radius Geofence:</span>
                    <span className="font-semibold text-slate-800">{b.radiusPresensi} meter</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                    <span className="text-slate-500">Jumlah Kamar:</span>
                    <span className="font-semibold text-slate-800">{b._count?.kamar ?? 12} Unit</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                    <span className="text-slate-500">Total Penghuni:</span>
                    <span className="font-semibold text-slate-800">{b._count?.users ?? 34} Orang</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleToggleStatus(b)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
                    b.isActive ? 'text-red-700 hover:bg-red-50' : 'text-emerald-800 hover:bg-emerald-50'
                  }`}
                  title={b.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                >
                  <Power size={12} />
                  {b.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
                <button
                  onClick={() => openEdit(b)}
                  className="px-2.5 py-1 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors flex items-center gap-1 text-[11px] font-medium border border-slate-200"
                >
                  <Edit2 size={12} />
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah / Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 animate-fade-in shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
              {editingBuilding ? 'Edit Data Gedung' : 'Tambah Gedung Asrama'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Gedung Asrama</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Asrama Menara Hijau"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Titik Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Titik Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-700"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Radius Geofence Presensi</label>
                  <span className="text-xs font-bold text-emerald-800">{form.radiusPresensi} Meter</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  value={form.radiusPresensi}
                  onChange={(e) => setForm({ ...form, radiusPresensi: parseInt(e.target.value) || 100 })}
                  className="w-full accent-emerald-700"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Jarak maksimal penghuni dari titik pusat gedung agar presensi dinyatakan sah.
                </p>
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
