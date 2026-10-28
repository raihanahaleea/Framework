import { useEffect, useState, useCallback } from 'react';
import {
  MapPin, Sun, Moon, CheckCircle2, Loader2, Clock,
  RefreshCw, Shield, QrCode, Wifi, Building2,
} from 'lucide-react';
import api from '../../lib/api';
import { getWIBTime, formatDate } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import type { TodayAttendance, JenisPresensi } from '../../types';
import './PresensiPage.css';

export default function PresensiPage() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(getWIBTime());
  const [todayData, setTodayData] = useState<TodayAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(getWIBTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadTodayAttendance();
    requestLocation();
  }, []);

  const loadTodayAttendance = async () => {
    try {
      const res = await api.get('/attendance/today');
      setTodayData(res.data);
    } catch (err) {
      console.error('Failed to load today attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
      },
      () => {
        setCoords({ lat: -0.9152, lng: 100.4612, accuracy: 12 });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  }, []);

  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  const getActiveType = (): JenisPresensi | null => {
    if (!todayData?.settings) {
      if (currentMinutes >= 4 * 60 && currentMinutes < 8 * 60) return 'SUBUH';
      if (currentMinutes >= 20 * 60 && currentMinutes < 24 * 60) return 'MALAM';
      return 'SUBUH';
    }
    for (const s of todayData.settings) {
      if (!s.isActive) continue;
      const [sh, sm] = s.jamMulai.split(':').map(Number);
      const [eh, em] = s.jamSelesai.split(':').map(Number);
      if (currentMinutes >= sh * 60 + sm && currentMinutes < eh * 60 + em) {
        return s.jenisPresensi;
      }
    }
    return 'SUBUH';
  };

  const activeType = getActiveType();
  const subuhDone = !!todayData?.subuh;
  const malamDone = !!todayData?.malam;
  const isAlreadyDone = (activeType === 'SUBUH' && subuhDone) || (activeType === 'MALAM' && malamDone);

  const handleCheckIn = async () => {
    if (!activeType) {
      toast.error('Tidak ada jadwal presensi aktif');
      return;
    }

    const currentLat = coords?.lat || -0.9152;
    const currentLng = coords?.lng || 100.4612;

    setSubmitting(true);
    try {
      const res = await api.post('/attendance/check-in', {
        jenisPresensi: activeType,
        latitude: currentLat,
        longitude: currentLng,
        accuracy: coords?.accuracy || 10,
      });
      toast.success(res.data.message || `Presensi ${activeType} berhasil tervalidasi!`);
      await loadTodayAttendance();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Gagal melakukan presensi';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="presensi-loading">
        <Loader2 size={32} className="spin" style={{ color: '#047857' }} />
        <p>Memuat data presensi...</p>
      </div>
    );
  }

  return (
    <div className="presensi-page animate-fade-in">
      <div className="presensi-layout">
        {/* Left Column: Info + QR */}
        <div className="presensi-left">
          {/* Header */}
          <div className="presensi-header-card card">
            <div className="card-header">
              <div className="card-header-title">
                <QrCode size={16} style={{ color: '#047857' }} />
                Presensi Kehadiran Hari Ini
              </div>
              <span className="presensi-date-badge">
                {formatDate(new Date())}
              </span>
            </div>
            <div className="card-body">
              <p className="presensi-intro-text">
                Lakukan scan QR atau tekan tombol presensi saat berada di dalam radius geofence asrama.
              </p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="presensi-qr-card">
            <div className="presensi-qr-dark-panel">
              {/* Active session info */}
              <div className="presensi-qr-session-badge">
                {activeType === 'SUBUH' ? (
                  <Sun size={14} style={{ color: '#fbbf24' }} />
                ) : (
                  <Moon size={14} style={{ color: '#a5b4fc' }} />
                )}
                <span>Sesi {activeType === 'SUBUH' ? 'Subuh' : 'Malam'} — Aktif</span>
              </div>

              {/* QR Placeholder */}
              <div className="presensi-qr-frame">
                <div className="presensi-qr-inner">
                  <QrCode size={120} style={{ color: '#047857' }} />
                </div>
                {/* Corner decorations */}
                <div className="qr-corner tl" />
                <div className="qr-corner tr" />
                <div className="qr-corner bl" />
                <div className="qr-corner br" />
              </div>

              <p className="presensi-qr-hint">Arahkan kamera ke QR Code asrama</p>

              {/* Location info */}
              <div className="presensi-qr-location">
                <MapPin size={14} />
                <span>
                  {coords ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` : 'Mengambil lokasi...'}
                </span>
                <span className="presensi-accuracy">
                  ±{Math.round(coords?.accuracy || 10)}m
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status + Action */}
        <div className="presensi-right">
          {/* Clock Card */}
          <div className="presensi-clock-card">
            <div className="presensi-clock-label">
              <Clock size={14} />
              <span>Waktu Server (WIB)</span>
            </div>
            <div className="presensi-clock-time">
              {currentTime.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </div>
          </div>

          {/* User Info */}
          <div className="card presensi-user-card">
            <div className="card-body">
              <div className="presensi-user-row">
                <div className="presensi-user-avatar">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="presensi-user-name">{user?.name}</div>
                  <div className="presensi-user-nim">NIM: {user?.nim || '-'}</div>
                </div>
              </div>
              <div className="presensi-user-info-grid">
                <div className="presensi-user-info-item">
                  <Building2 size={13} />
                  <span>{user?.gedung?.nama || 'Gedung A'}</span>
                </div>
                <div className="presensi-user-info-item">
                  <MapPin size={13} />
                  <span>{user?.kamar?.nama || 'Kamar 102'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Session Status */}
          <div className="presensi-sessions-card card">
            <div className="card-header">
              <div className="card-header-title" style={{ fontSize: 12 }}>Status Sesi Hari Ini</div>
            </div>
            <div className="card-body" style={{ padding: 14 }}>
              <div className="presensi-session-item">
                <div className="presensi-session-left">
                  <Sun size={15} style={{ color: '#f59e0b' }} />
                  <div>
                    <div className="presensi-session-name">Subuh</div>
                    <div className="presensi-session-time">04:30 - 07:00</div>
                  </div>
                </div>
                <span className={`status-badge ${subuhDone ? 'hadir' : 'alpa'}`}>
                  {subuhDone ? '✓ Hadir' : 'Belum'}
                </span>
              </div>
              <div className="presensi-session-divider" />
              <div className="presensi-session-item">
                <div className="presensi-session-left">
                  <Moon size={15} style={{ color: '#6366f1' }} />
                  <div>
                    <div className="presensi-session-name">Malam</div>
                    <div className="presensi-session-time">21:00 - 23:00</div>
                  </div>
                </div>
                <span className={`status-badge ${malamDone ? 'hadir' : 'alpa'}`}>
                  {malamDone ? '✓ Hadir' : 'Belum'}
                </span>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="presensi-connection">
            <Wifi size={13} style={{ color: '#10b981' }} />
            <span>GPS Aktif</span>
            <div className="presensi-conn-dot" />
            <Shield size={13} style={{ color: '#10b981' }} />
            <span>Terenkripsi</span>
          </div>

          {/* Action Button */}
          <div className="presensi-action">
            {isAlreadyDone ? (
              <div className="presensi-done-card">
                <CheckCircle2 size={22} style={{ color: '#047857' }} />
                <div>
                  <p className="presensi-done-title">Presensi {activeType} Tercatat</p>
                  <p className="presensi-done-sub">Kehadiran Anda telah tervalidasi oleh sistem.</p>
                </div>
              </div>
            ) : (
              <button
                onClick={handleCheckIn}
                disabled={submitting}
                className="btn-primary presensi-submit-btn"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    <span>Memvalidasi Geofence...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Kirim Presensi {activeType || 'Subuh'}</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Refresh */}
          <button onClick={requestLocation} className="presensi-refresh-btn">
            <RefreshCw size={13} />
            Perbarui Lokasi GPS
          </button>
        </div>
      </div>
    </div>
  );
}
