import { useEffect, useState } from 'react';
import { DoorOpen, Plus, Edit2, Power, Search, Loader2, ShieldCheck } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import type { Kamar, Gedung } from '../../types';
import './RoomsPage.css';

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
    <div className="rooms-page animate-fade-in">
      {/* ===== Header Banner ===== */}
      <div className="rooms-banner">
        <div className="rooms-banner-left">
          <div className="rooms-badge">
            <ShieldCheck size={14} />
            Panel Administrator • Manajemen Hunian
          </div>
          <h1 className="rooms-title">Data Kamar Asrama</h1>
          <p className="rooms-subtitle">
            Kelola alokasi unit kamar hunian, daya tampung kapasitas warga, dan penempatan lantai per gedung asrama.
          </p>
        </div>
        <div className="rooms-banner-right">
          <button onClick={openCreate} className="btn-tambah-kamar">
            <Plus size={16} />
            <span>Tambah Kamar</span>
          </button>
        </div>
      </div>

      {/* ===== Filters & Search Toolbar ===== */}
      <div className="rooms-filter-toolbar">
        <div className="rooms-search-box">
          <Search size={16} className="rooms-search-icon" />
          <input
            type="text"
            placeholder="Cari unit kamar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rooms-search-input"
          />
        </div>

        <div>
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="rooms-select"
          >
            <option value="">Semua Gedung Asrama</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nama}
              </option>
            ))}
          </select>
        </div>

        <div className="rooms-count-card">
          <span>Total Unit Kamar:</span>
          <span className="rooms-count-val">{filtered.length} Unit</span>
        </div>
      </div>

      {/* ===== Structured Table ===== */}
      <div className="rooms-table-card">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-11 skeleton rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rooms-empty-state">
            <DoorOpen size={44} className="mx-auto mb-2 opacity-30 text-emerald-800" />
            <p className="rooms-empty-title">Tidak ada data unit kamar ditemukan</p>
            <p className="rooms-empty-desc">Silakan sesuaikan pilihan gedung atau tambahkan unit kamar baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="rooms-table">
              <thead>
                <tr>
                  <th>Nama Kamar</th>
                  <th>Gedung</th>
                  <th>Lantai</th>
                  <th>Kapasitas Penghuni</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const occupied = r._count?.users ?? 0;
                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="room-name-wrapper">
                          <div className="room-icon-badge">
                            <DoorOpen size={16} />
                          </div>
                          <span className="room-name-text">{r.nama}</span>
                        </div>
                      </td>
                      <td>{r.gedung?.nama || '-'}</td>
                      <td>Lantai {r.nomorLantai}</td>
                      <td>
                        <div className="room-capacity-bar-wrapper">
                          <span className="font-semibold text-slate-800 font-mono text-[12.5px]">
                            {occupied} / {r.kapasitas} org
                          </span>
                          <div className="room-capacity-track">
                            <div
                              className="room-capacity-fill"
                              style={{
                                width: `${Math.min(100, (occupied / r.kapasitas) * 100)}%`,
                                backgroundColor: occupied >= r.kapasitas ? '#ef4444' : '#047857'
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${r.isActive ? 'badge-hadir' : 'badge-alpa'}`}>
                          {r.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(r)}
                            className={`rooms-action-btn ${r.isActive ? 'btn-power-active' : 'btn-power-inactive'}`}
                            title={r.isActive ? 'Nonaktifkan Kamar' : 'Aktifkan Kamar'}
                          >
                            <Power size={14} />
                          </button>
                          <button
                            onClick={() => openEdit(r)}
                            className="rooms-action-btn btn-edit-fasil"
                            title="Edit Kamar"
                          >
                            <Edit2 size={14} />
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
        <div className="rooms-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="rooms-modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="rooms-modal-title">
              {editingRoom ? 'Edit Data Kamar' : 'Tambah Kamar Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="rooms-form-label">Gedung Asrama</label>
                <select
                  required
                  value={form.gedungId}
                  onChange={(e) => setForm({ ...form, gedungId: e.target.value })}
                  className="rooms-form-select"
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
                <label className="rooms-form-label">Nama / Nomor Kamar</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kamar A-101"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="rooms-form-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="rooms-form-label">Nomor Lantai</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={form.nomorLantai}
                    onChange={(e) => setForm({ ...form, nomorLantai: parseInt(e.target.value) || 1 })}
                    className="rooms-form-input"
                  />
                </div>
                <div>
                  <label className="rooms-form-label">Kapasitas (Orang)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={form.kapasitas}
                    onChange={(e) => setForm({ ...form, kapasitas: parseInt(e.target.value) || 4 })}
                    className="rooms-form-input"
                  />
                </div>
              </div>

              <div className="rooms-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-modal-cancel"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-modal-submit flex items-center justify-center gap-1.5"
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
