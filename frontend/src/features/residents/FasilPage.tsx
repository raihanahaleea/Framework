import { useEffect, useState } from 'react';
import { Users, Plus, Edit2, Search, Power, Building2, ShieldCheck } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import type { User, Gedung, PaginatedResponse } from '../../types';
import './FasilPage.css';

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
    <div className="fasil-page animate-fade-in">
      {/* ===== Header Banner ===== */}
      <div className="fasil-banner">
        <div className="fasil-banner-left">
          <div className="fasil-badge">
            <ShieldCheck size={14} />
            Panel Administrator • Fasilitator Asrama
          </div>
          <h1 className="fasil-title">Data Fasilitator Asrama</h1>
          <p className="fasil-subtitle">
            Kelola akun fasilitator pembina, penugasan cakupan gedung asrama, kredensial, dan status keaktifan akun.
          </p>
        </div>
        <div className="fasil-banner-right">
          <button onClick={openCreate} className="btn-tambah-fasil">
            <Plus size={16} />
            <span>Tambah Fasilitator</span>
          </button>
        </div>
      </div>

      {/* ===== Search Bar ===== */}
      <div className="fasil-search-wrapper">
        <Search size={16} className="fasil-search-icon" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama fasilitator atau email resmi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="fasil-search-input"
        />
      </div>

      {/* ===== Table ===== */}
      <div className="fasil-table-card">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-11 skeleton rounded-lg" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="fasil-empty-state">
            <Users size={44} className="mx-auto mb-2 opacity-30 text-emerald-800" />
            <p className="fasil-empty-title">Tidak ada data fasilitator ditemukan</p>
            <p className="fasil-empty-desc">Silakan periksa kata kunci pencarian atau tambahkan akun fasilitator baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="fasil-table">
              <thead>
                <tr>
                  <th>Nama Fasilitator</th>
                  <th>Email Resmi</th>
                  <th>Cakupan Gedung</th>
                  <th>Status Akun</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="fasil-avatar">
                          {f.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="fasil-name-text">{f.name}</p>
                          <span className="fasil-role-sub">Fasilitator Pembina</span>
                        </div>
                      </div>
                    </td>
                    <td className="fasil-email-cell">{f.email}</td>
                    <td>
                      <div className="flex flex-wrap gap-1.5">
                        {f.cakupanGedung && f.cakupanGedung.length > 0 ? (
                          f.cakupanGedung.map((cg) => (
                            <span key={cg.id} className="fasil-building-chip">
                              <Building2 size={12} />
                              {cg.gedung.nama}
                            </span>
                          ))
                        ) : (
                          <span className="text-[12px] text-slate-400 italic">Semua Gedung Asrama</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${f.isActive ? 'badge-hadir' : 'badge-alpa'}`}>
                        {f.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(f)}
                          className={`fasil-action-btn ${f.isActive ? 'btn-power-active' : 'btn-power-inactive'}`}
                          title={f.isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                        >
                          <Power size={14} />
                        </button>
                        <button
                          onClick={() => openEdit(f)}
                          className="fasil-action-btn btn-edit-fasil"
                          title="Edit Fasilitator"
                        >
                          <Edit2 size={14} />
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
        <div className="fasil-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="fasil-modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="fasil-modal-title">
              {editingFasil ? 'Edit Data Fasilitator' : 'Tambah Fasilitator Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="fasil-form-label">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rahmat Hidayat, S.T."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="fasil-form-input"
                />
              </div>

              <div>
                <label className="fasil-form-label">Email Resmi UNAND</label>
                <input
                  type="email"
                  required
                  placeholder="fasil@unand.ac.id"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="fasil-form-input"
                />
              </div>

              <div>
                <label className="fasil-form-label">
                  Kata Sandi {editingFasil && '(Kosongkan jika tidak diubah)'}
                </label>
                <input
                  type="password"
                  placeholder={editingFasil ? '••••••••' : 'Password default'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="fasil-form-input"
                />
              </div>

              <div>
                <label className="fasil-form-label">
                  Tugaskan Gedung Bimbingan:
                </label>
                <div className="fasil-building-select-box">
                  {buildings.map((b) => {
                    const isChecked = form.gedungIds.includes(b.id);
                    return (
                      <label key={b.id} className="fasil-building-checkbox-label">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleBuildingSelection(b.id)}
                          className="rounded text-emerald-800 focus:ring-emerald-700 h-4 w-4"
                        />
                        <span className="font-medium text-slate-800">{b.nama}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="fasil-modal-actions">
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
                  className="btn-modal-submit"
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
