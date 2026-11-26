import { useEffect, useState } from 'react';
import { Clock, Save, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import type { AttendanceSetting } from '../../types';
import './SettingsPage.css';

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
    <div className="settings-page animate-fade-in">
      {/* ===== Header Banner ===== */}
      <div className="settings-banner">
        <div className="settings-banner-left">
          <div className="settings-badge">
            <ShieldCheck size={14} />
            Panel Administrator • Konfigurasi Sistem
          </div>
          <h1 className="settings-title">Konfigurasi Sistem &amp; Geofence</h1>
          <p className="settings-subtitle">
            Atur jendela waktu presensi, batas toleransi sinyal lokasi geofence GPS, dan proteksi integritas anti-spoofing.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="settings-form">
        {/* Jadwal Presensi */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <Clock size={18} />
            </div>
            <div>
              <h2 className="settings-card-title">Jadwal Sesi Presensi Kehadiran</h2>
              <p className="settings-card-desc">Atur rentang jam aktif untuk sesi presensi Subuh dan Malam warga asrama</p>
            </div>
          </div>

          <div className="sesi-cards-grid">
            {/* Sesi Subuh */}
            <div className="sesi-subcard">
              <div className="sesi-subcard-top">
                <div>
                  <h3 className="sesi-subcard-title">Sesi Subuh (Pagi)</h3>
                  <p className="sesi-subcard-desc">Presensi sholat subuh berjamaah</p>
                </div>
                <input
                  type="checkbox"
                  checked={subuhTime.active}
                  onChange={(e) => setSubuhTime({ ...subuhTime, active: e.target.checked })}
                  className="rounded text-emerald-800 focus:ring-emerald-700 h-4 w-4"
                />
              </div>

              <div className="sesi-time-grid">
                <div>
                  <label className="sesi-time-label">Jam Mulai</label>
                  <input
                    type="time"
                    value={subuhTime.start}
                    onChange={(e) => setSubuhTime({ ...subuhTime, start: e.target.value })}
                    className="sesi-time-input"
                  />
                </div>
                <div>
                  <label className="sesi-time-label">Jam Selesai</label>
                  <input
                    type="time"
                    value={subuhTime.end}
                    onChange={(e) => setSubuhTime({ ...subuhTime, end: e.target.value })}
                    className="sesi-time-input"
                  />
                </div>
              </div>
            </div>

            {/* Sesi Malam */}
            <div className="sesi-subcard">
              <div className="sesi-subcard-top">
                <div>
                  <h3 className="sesi-subcard-title">Sesi Malam (Apel)</h3>
                  <p className="sesi-subcard-desc">Presensi apel malam &amp; jam malam asrama</p>
                </div>
                <input
                  type="checkbox"
                  checked={malamTime.active}
                  onChange={(e) => setMalamTime({ ...malamTime, active: e.target.checked })}
                  className="rounded text-emerald-800 focus:ring-emerald-700 h-4 w-4"
                />
              </div>

              <div className="sesi-time-grid">
                <div>
                  <label className="sesi-time-label">Jam Mulai</label>
                  <input
                    type="time"
                    value={malamTime.start}
                    onChange={(e) => setMalamTime({ ...malamTime, start: e.target.value })}
                    className="sesi-time-input"
                  />
                </div>
                <div>
                  <label className="sesi-time-label">Jam Selesai</label>
                  <input
                    type="time"
                    value={malamTime.end}
                    onChange={(e) => setMalamTime({ ...malamTime, end: e.target.value })}
                    className="sesi-time-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Keamanan GPS & Geofencing */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="settings-card-title">Validasi Lokasi &amp; Geofence GPS</h2>
              <p className="settings-card-desc">Batas radius jangkauan presensi dan toleransi presisi koordinat perangkat</p>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="slider-group">
              <div className="slider-top-row">
                <label className="slider-label">
                  Default Radius Geofence Gedung
                </label>
                <span className="slider-badge-val">{defaultRadius} meter</span>
              </div>
              <input
                type="range"
                min="50"
                max="300"
                step="10"
                value={defaultRadius}
                onChange={(e) => setDefaultRadius(parseInt(e.target.value))}
                className="slider-range-input"
              />
              <p className="slider-help-note">
                Jarak radius maksimum dari titik koordinat pusat gedung asrama yang diizinkan untuk check-in.
              </p>
            </div>

            <div className="slider-group">
              <div className="slider-top-row">
                <label className="slider-label">
                  Maksimum Toleransi Akurasi GPS
                </label>
                <span className="slider-badge-val">&plusmn;{gpsAccuracy} meter</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={gpsAccuracy}
                onChange={(e) => setGpsAccuracy(parseInt(e.target.value))}
                className="slider-range-input"
              />
              <p className="slider-help-note">
                Presensi akan ditolak otomatis apabila sinyal akurasi GPS perangkat penghuni bernilai lebih besar dari batas toleransi ini.
              </p>
            </div>

            <div className="pt-2">
              <label className="anti-fake-gps-box">
                <input
                  type="checkbox"
                  checked={antiFakeGps}
                  onChange={(e) => setAntiFakeGps(e.target.checked)}
                  className="rounded text-emerald-800 focus:ring-emerald-700 h-4 w-4 mt-0.5"
                />
                <div>
                  <h4 className="anti-fake-title">Deteksi Manipulasi Fake GPS / Mock Location</h4>
                  <p className="anti-fake-desc">
                    Otomatis blokir percobaan manipulasi koordinat lokasi dan rekayasa sinyal GPS dari perangkat penghuni demi integritas data.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="settings-submit-row">
          <button
            type="submit"
            disabled={saving}
            className="btn-save-settings"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Simpan Konfigurasi</span>
          </button>
        </div>
      </form>
    </div>
  );
}
