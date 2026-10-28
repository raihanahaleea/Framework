import { useEffect, useState } from 'react';
import { Settings, Clock, Save, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import type { AttendanceSetting } from '../../types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AttendanceSetting[]>([]);
  const [saving, setSaving] = useState(false);

  const [subuhTime, setSubuhTime] = useState({ start: '04:30', end: '07:00', active: true });
  const [malamTime, setMalamTime] = useState({ start: '21:00', end: '23:00', active: true });
  const [defaultRadius, setDefaultRadius] = useState(100);
  const [gpsAccuracy, setGpsAccuracy] = useState(50);
  const [antiFakeGps, setAntiFakeGps] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.get('/settings');
      const data: AttendanceSetting[] = res.data;
      setSettings(data);

      const subuh = data.find((s) => s.jenisPresensi === 'SUBUH');
      if (subuh) {
        setSubuhTime({ start: subuh.jamMulai, end: subuh.jamSelesai, active: subuh.isActive });
      }

      const malam = data.find((s) => s.jenisPresensi === 'MALAM');
      if (malam) {
        setMalamTime({ start: malam.jamMulai, end: malam.jamSelesai, active: malam.isActive });
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Update Subuh
      const subuh = settings.find((s) => s.jenisPresensi === 'SUBUH');
      if (subuh) {
        await api.patch(`/settings/${subuh.id}`, {
          jamMulai: subuhTime.start,
          jamSelesai: subuhTime.end,
          isActive: subuhTime.active,
        });
      }

      // Update Malam
      const malam = settings.find((s) => s.jenisPresensi === 'MALAM');
      if (malam) {
        await api.patch(`/settings/${malam.id}`, {
          jamMulai: malamTime.start,
          jamSelesai: malamTime.end,
          isActive: malamTime.active,
        });
      }

      toast.success('Pengaturan sistem presensi berhasil disimpan!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-5 animate-fade-in">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings size={20} className="text-emerald-800" />
          Konfigurasi Sistem & Geofence
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Atur jendela waktu presensi, batas toleransi sinyal lokasi, dan proteksi integritas data
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        {/* Jadwal Presensi */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock size={16} className="text-emerald-800" />
            Jadwal Sesi Presensi Kehadiran
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sesi Subuh */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">Sesi Subuh (Pagi)</h3>
                  <p className="text-[11px] text-slate-400">Jadwal presensi sholat subuh bersama</p>
                </div>
                <input
                  type="checkbox"
                  checked={subuhTime.active}
                  onChange={(e) => setSubuhTime({ ...subuhTime, active: e.target.checked })}
                  className="rounded text-emerald-800 focus:ring-emerald-700 h-4 w-4"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={subuhTime.start}
                    onChange={(e) => setSubuhTime({ ...subuhTime, start: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={subuhTime.end}
                    onChange={(e) => setSubuhTime({ ...subuhTime, end: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Sesi Malam */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">Sesi Malam (Apel)</h3>
                  <p className="text-[11px] text-slate-400">Jadwal presensi apel malam asrama</p>
                </div>
                <input
                  type="checkbox"
                  checked={malamTime.active}
                  onChange={(e) => setMalamTime({ ...malamTime, active: e.target.checked })}
                  className="rounded text-emerald-800 focus:ring-emerald-700 h-4 w-4"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={malamTime.start}
                    onChange={(e) => setMalamTime({ ...malamTime, start: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={malamTime.end}
                    onChange={(e) => setMalamTime({ ...malamTime, end: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Keamanan GPS & Geofencing */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-800" />
            Validasi Lokasi & Geofence
          </h2>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Default Radius Geofence Gedung (Meter)
                </label>
                <span className="text-xs font-bold text-emerald-800">{defaultRadius} meter</span>
              </div>
              <input
                type="range"
                min="50"
                max="300"
                step="10"
                value={defaultRadius}
                onChange={(e) => setDefaultRadius(parseInt(e.target.value))}
                className="w-full accent-emerald-700"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Maksimum Toleransi Akurasi GPS
                </label>
                <span className="text-xs font-bold text-emerald-800">&plusmn;{gpsAccuracy} meter</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={gpsAccuracy}
                onChange={(e) => setGpsAccuracy(parseInt(e.target.value))}
                className="w-full accent-emerald-700"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Presensi akan ditolak otomatis apabila sinyal GPS perangkat penghuni dinilai tidak cukup akurat.
              </p>
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={antiFakeGps}
                  onChange={(e) => setAntiFakeGps(e.target.checked)}
                  className="rounded text-emerald-800 focus:ring-emerald-700 h-4 w-4"
                />
                <div>
                  <p className="text-xs font-semibold text-slate-800">Deteksi Manipulasi Fake GPS / Mock Location</p>
                  <p className="text-[10px] text-slate-400">
                    Otomatis blokir percobaan manipulasi koordinat lokasi dari perangkat penghuni.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs hover:shadow transition-all disabled:opacity-50 text-xs"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          <span>Simpan Konfigurasi</span>
        </button>
      </form>
    </div>
  );
}
