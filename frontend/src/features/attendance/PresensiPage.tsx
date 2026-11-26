import { useEffect, useState, useCallback, useRef } from 'react';
import {
  MapPin, Sun, Moon, CheckCircle2, Loader2, Clock,
  RefreshCw, Shield, Wifi, Building2, Camera, RotateCcw,
  AlertTriangle, Navigation, Check
} from 'lucide-react';
import api from '../../lib/api';
import { getWIBTime, formatDate } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import type { TodayAttendance, JenisPresensi } from '../../types';
import './PresensiPage.css';

// Haversine formula to compute geodesic distance in meters between two coordinates
function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Mean Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

interface SessionConfig {
  jenisPresensi: JenisPresensi;
  nama: string;
  lokasiNama: string;
  centerLat: number;
  centerLong: number;
  maxRadiusMeters: number;
  jamMulai: string;
  jamSelesai: string;
  startMinutes: number;
  endMinutes: number;
}

export default function PresensiPage() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(getWIBTime());
  const [todayData, setTodayData] = useState<TodayAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Default two locations & schedules
  const [sessionsConfig, setSessionsConfig] = useState<{
    malam: SessionConfig;
    subuh: SessionConfig;
    maxAccuracyMeters: number;
  }>({
    malam: {
      jenisPresensi: 'MALAM',
      nama: 'Presensi Malam',
      lokasiNama: 'Asrama Universitas Andalas',
      centerLat: -0.9169337875669057,
      centerLong: 100.45326630992055,
      maxRadiusMeters: 200,
      jamMulai: '21:00',
      jamSelesai: '23:00',
      startMinutes: 21 * 60, // 1260
      endMinutes: 23 * 60,   // 1380
    },
    subuh: {
      jenisPresensi: 'SUBUH',
      nama: 'Presensi Subuh',
      lokasiNama: 'Masjid Nurul Ilmi Universitas Andalas',
      centerLat: -0.9171644577225563,
      centerLong: 100.45761395254097,
      maxRadiusMeters: 100,
      jamMulai: '04:30',
      jamSelesai: '07:00',
      startMinutes: 4 * 60 + 30, // 270
      endMinutes: 7 * 60,        // 420
    },
    maxAccuracyMeters: 50,
  });

  // Calculate WIB time minutes
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  // Detect active session based on WIB time
  const isSubuhActiveTime = currentMinutes >= 270 && currentMinutes <= 420;   // 04:30 - 07:00
  const isMalamActiveTime = currentMinutes >= 1260 && currentMinutes <= 1380; // 21:00 - 23:00


  // Selected session tab (defaults to active session, or whichever is nearest)
  const [selectedSession, setSelectedSession] = useState<JenisPresensi>(() => {
    const initMin = getWIBTime().getHours() * 60 + getWIBTime().getMinutes();
    if (initMin >= 270 && initMin <= 420) return 'SUBUH';
    if (initMin >= 1260 && initMin <= 1380) return 'MALAM';
    return initMin < 12 * 60 ? 'SUBUH' : 'MALAM';
  });

  // Active target parameters based on selectedSession
  const activeSessionConfig =
    selectedSession === 'SUBUH' ? sessionsConfig.subuh : sessionsConfig.malam;

  const targetLocationName =
    selectedSession === 'MALAM' && user?.gedung?.nama
      ? `Asrama ${user.gedung.nama}`
      : activeSessionConfig.lokasiNama;

  const targetLat = activeSessionConfig.centerLat;
  const targetLng = activeSessionConfig.centerLong;
  const maxRadiusMeters = activeSessionConfig.maxRadiusMeters;
  const maxAccuracyMeters = sessionsConfig.maxAccuracyMeters;

  // Check if current selected session is within its valid schedule window
  const isSelectedSessionInSchedule =
    selectedSession === 'SUBUH' ? isSubuhActiveTime : isMalamActiveTime;

  // GPS state
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<
    'LOCATING' | 'VALID' | 'OUT_OF_BOUNDS' | 'LOW_ACCURACY' | 'DENIED' | 'UNAVAILABLE'
  >('LOCATING');
  const [gpsErrorMsg, setGpsErrorMsg] = useState('');
  const [distance, setDistance] = useState<number | null>(null);

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Fetch active multi-session configuration from backend
  const loadGeofenceConfig = useCallback(async () => {
    try {
      const res = await api.get('/attendance/config');
      const d = res.data;
      if (d) {
        setSessionsConfig((prev) => ({
          maxAccuracyMeters: Number(d.maxAccuracyMeters ?? 50),
          malam: {
            ...prev.malam,
            centerLat: Number(d.malam?.centerLat ?? d.centerLat ?? prev.malam.centerLat),
            centerLong: Number(d.malam?.centerLong ?? d.centerLong ?? prev.malam.centerLong),
            maxRadiusMeters: Number(d.malam?.maxRadiusMeters ?? d.maxRadiusMeters ?? 200),
            lokasiNama: d.malam?.lokasiNama || prev.malam.lokasiNama,
          },
          subuh: {
            ...prev.subuh,
            centerLat: Number(d.subuh?.centerLat ?? prev.subuh.centerLat),
            centerLong: Number(d.subuh?.centerLong ?? prev.subuh.centerLong),
            maxRadiusMeters: Number(d.subuh?.maxRadiusMeters ?? 100),
            lokasiNama: d.subuh?.lokasiNama || prev.subuh.lokasiNama,
          },
        }));

        if (d.activeSession) {
          setSelectedSession(d.activeSession);
        }
      }
    } catch (err) {
      console.warn('Menggunakan default konfigurasi dua lokasi asrama & MNI:', err);
    }
  }, []);

  // Clock ticker in WIB
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(getWIBTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Load today's attendance
  const loadTodayAttendance = useCallback(async () => {
    try {
      const res = await api.get('/attendance/today');
      setTodayData(res.data);
    } catch (err) {
      console.error('Failed to load today attendance:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Evaluate location with current target coordinates
  const evaluateLocation = useCallback(
    (lat: number, lng: number, acc: number, tLat: number, tLng: number, maxRadius: number, maxAcc: number) => {
      const dist = haversineDistanceMeters(lat, lng, tLat, tLng);
      setDistance(dist);

      if (acc > maxAcc) {
        setGpsStatus('LOW_ACCURACY');
        setGpsErrorMsg(
          `Akurasi sinyal GPS perangkat terlalu rendah (±${acc} m). Toleransi maksimal adalah ${maxAcc} meter. Silakan perbarui lokasi di tempat terbuka.`
        );
        return;
      }

      if (dist <= maxRadius) {
        setGpsStatus('VALID');
        setGpsErrorMsg('');
      } else {
        setGpsStatus('OUT_OF_BOUNDS');
        setGpsErrorMsg(
          `Lokasi di luar radius ${targetLocationName}. Jarak Anda: ${dist} m (Batas maksimal: ${maxRadius} m). Presensi ditolak.`
        );
      }
    },
    [targetLocationName]
  );

  // Request GPS Location
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus('UNAVAILABLE');
      setGpsErrorMsg('Browser Anda tidak mendukung Geolocation API');
      return;
    }

    setGpsStatus('LOCATING');
    setGpsErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy);
        setCoords({ lat: userLat, lng: userLng, accuracy: acc });
        evaluateLocation(userLat, userLng, acc, targetLat, targetLng, maxRadiusMeters, maxAccuracyMeters);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsStatus('DENIED');
          setGpsErrorMsg('Izin akses lokasi GPS ditolak oleh browser. Harap izinkan akses lokasi pada browser Anda.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGpsStatus('UNAVAILABLE');
          setGpsErrorMsg('Sinyal lokasi tidak dapat diperoleh. Pastikan fitur GPS / Lokasi pada perangkat aktif.');
        } else if (err.code === err.TIMEOUT) {
          setGpsStatus('UNAVAILABLE');
          setGpsErrorMsg('Waktu permintaan lokasi GPS habis (timeout). Silakan periksa koneksi dan coba lagi.');
        } else {
          setGpsStatus('UNAVAILABLE');
          setGpsErrorMsg('Gagal membaca koordinat GPS: ' + (err.message || 'Error tidak diketahui'));
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [evaluateLocation, targetLat, targetLng, maxRadiusMeters, maxAccuracyMeters]);

  // Re-evaluate distance when selectedSession changes and coordinates are already available
  useEffect(() => {
    if (coords) {
      evaluateLocation(
        coords.lat,
        coords.lng,
        coords.accuracy,
        targetLat,
        targetLng,
        maxRadiusMeters,
        maxAccuracyMeters
      );
    }
  }, [selectedSession, targetLat, targetLng, maxRadiusMeters, maxAccuracyMeters, coords, evaluateLocation]);

  // Initial load
  useEffect(() => {
    loadGeofenceConfig();
    loadTodayAttendance();
    requestLocation();
  }, [loadGeofenceConfig, loadTodayAttendance, requestLocation]);

  // Check if session is already done today
  const subuhDone = !!todayData?.subuh;
  const malamDone = !!todayData?.malam;
  const isSelectedSessionDone = selectedSession === 'SUBUH' ? subuhDone : malamDone;

  // ==================== CAMERA MANAGEMENT ====================
  const startCamera = async () => {
    setCameraError('');
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Izin kamera ditolak. Berikan izin akses kamera pada browser Anda.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('Kamera tidak ditemukan pada perangkat Anda.');
      } else {
        setCameraError('Gagal mengakses kamera: ' + (err.message || 'Periksa koneksi kamera.'));
      }
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Automatically start camera if GPS is valid, in schedule, and photo hasn't been taken yet
  useEffect(() => {
    if (
      gpsStatus === 'VALID' &&
      !photoPreview &&
      !isSelectedSessionDone &&
      isSelectedSessionInSchedule &&
      !isCameraActive &&
      !cameraError
    ) {
      startCamera();
    }
  }, [
    gpsStatus,
    photoPreview,
    isSelectedSessionDone,
    isSelectedSessionInSchedule,
    isCameraActive,
    cameraError,
  ]);

  // Capture Selfie Photo from video stream to Canvas
  const handleCapturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 640;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror horizontal to match natural selfie preview
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);
    ctx.restore();

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setPhotoBlob(blob);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setPhotoPreview(dataUrl);
          stopCamera();
          toast.success('Foto selfie berhasil diambil!');
        }
      },
      'image/jpeg',
      0.85
    );
  };

  // Retake photo
  const handleRetakePhoto = () => {
    setPhotoBlob(null);
    setPhotoPreview(null);
    startCamera();
  };

  // ==================== SUBMIT ATTENDANCE ====================
  const handleCheckIn = async () => {
    if (!isSelectedSessionInSchedule) {
      toast.error(
        `Presensi ${activeSessionConfig.nama} hanya dapat dilakukan pukul ${activeSessionConfig.jamMulai}–${activeSessionConfig.jamSelesai} WIB.`
      );
      return;
    }

    if (gpsStatus === 'DENIED') {
      toast.error('Izin lokasi GPS belum diaktifkan. Harap aktifkan izin lokasi pada browser Anda.');
      return;
    }

    if (gpsStatus === 'LOW_ACCURACY') {
      toast.error(
        `Akurasi sinyal GPS perangkat terlalu rendah (±${coords?.accuracy} m, toleransi: ≤ ${maxAccuracyMeters} m). Silakan perbarui lokasi di tempat terbuka.`
      );
      return;
    }

    if (gpsStatus === 'OUT_OF_BOUNDS') {
      toast.error(
        `Presensi ditolak! Anda berada di luar radius ${targetLocationName} (Jarak: ${distance} m, batas maksimal: ${maxRadiusMeters} m).`
      );
      return;
    }

    if (!coords) {
      toast.error('Koordinat lokasi GPS belum terdeteksi. Silakan klik tombol Perbarui Lokasi.');
      return;
    }

    if (!photoBlob) {
      toast.error('Silakan ambil foto selfie langsung terlebih dahulu.');
      return;
    }

    const currentLat = coords.lat;
    const currentLng = coords.lng;
    const currentAcc = coords.accuracy;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('foto_wajah', photoBlob, `selfie_${selectedSession.toLowerCase()}_${user?.nim || 'mhs'}_${Date.now()}.jpg`);
      formData.append('latitude', currentLat.toString());
      formData.append('longitude', currentLng.toString());
      formData.append('lat', currentLat.toString());
      formData.append('long', currentLng.toString());
      formData.append('accuracy', currentAcc.toString());
      formData.append('jenisPresensi', selectedSession);
      formData.append('jenis_presensi', selectedSession);
      formData.append('lokasi', targetLocationName);
      formData.append('status', 'HADIR');
      if (distance !== null) {
        formData.append('jarakMeter', distance.toString());
      }

      const res = await api.post('/attendance/check-in', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(res.data.message || `Presensi ${selectedSession} berhasil tervalidasi!`);
      setPhotoBlob(null);
      setPhotoPreview(null);
      await loadTodayAttendance();
    } catch (err: any) {
      const resMsg = err?.response?.data?.message;
      let msg = 'Gagal melakukan presensi';
      if (typeof resMsg === 'string') {
        msg = resMsg;
      } else if (Array.isArray(resMsg)) {
        msg = resMsg.join(', ');
      } else if (resMsg && typeof resMsg === 'object') {
        msg = resMsg.message || resMsg.error || JSON.stringify(resMsg);
      }
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="presensi-loading">
        <Loader2 size={32} className="spin" style={{ color: '#047857' }} />
        <p>Memuat konfigurasi dan jadwal presensi...</p>
      </div>
    );
  }

  const isLocationValid = gpsStatus === 'VALID';
  const canSubmit =
    isLocationValid &&
    !!photoBlob &&
    !isSelectedSessionDone &&
    isSelectedSessionInSchedule &&
    !submitting;

  return (
    <div className="presensi-page animate-fade-in">
      {/* Hidden canvas used for capturing photo */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="presensi-layout">
        {/* Left Column: Camera + GPS Status */}
        <div className="presensi-left">
          {/* Header */}
          <div className="presensi-header-card card">
            <div className="card-header">
              <div className="card-header-title">
                <Camera size={16} style={{ color: '#047857' }} />
                Presensi Wajah &amp; Validasi Lokasi GPS
              </div>
              <span className="presensi-date-badge">
                {formatDate(new Date())}
              </span>
            </div>
            <div className="card-body">
              <p className="presensi-intro-text">
                Pilih sesi presensi sesuai jadwal aktif. Pastikan Anda berada dalam radius resmi lokasi tujuan (Masjid Nurul Ilmi untuk Subuh, Asrama untuk Malam) dan ambil foto selfie secara langsung.
              </p>
            </div>
          </div>

          {/* Camera Viewfinder Card */}
          <div className="presensi-camera-card">
            <div className="presensi-camera-dark-panel">
              {/* Session Selector Tabs (Ketentuan 1) */}
              <div className="presensi-session-switcher">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSession('SUBUH');
                    setPhotoBlob(null);
                    setPhotoPreview(null);
                  }}
                  className={`session-tab-btn ${selectedSession === 'SUBUH' ? 'active' : ''}`}
                >
                  <Sun size={15} style={{ color: selectedSession === 'SUBUH' ? '#ffffff' : '#f59e0b' }} />
                  <span>Sesi Subuh (MNI)</span>
                  {subuhDone ? (
                    <span className="session-tab-badge">✓ Selesai</span>
                  ) : isSubuhActiveTime ? (
                    <span className="session-tab-badge" style={{ background: '#10b981' }}>Aktif</span>
                  ) : null}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedSession('MALAM');
                    setPhotoBlob(null);
                    setPhotoPreview(null);
                  }}
                  className={`session-tab-btn ${selectedSession === 'MALAM' ? 'active night' : ''}`}
                >
                  <Moon size={15} style={{ color: selectedSession === 'MALAM' ? '#ffffff' : '#818cf8' }} />
                  <span>Sesi Malam (Asrama)</span>
                  {malamDone ? (
                    <span className="session-tab-badge">✓ Selesai</span>
                  ) : isMalamActiveTime ? (
                    <span className="session-tab-badge" style={{ background: '#10b981' }}>Aktif</span>
                  ) : null}
                </button>
              </div>

              {/* Target Location & Schedule Info Banner */}
              <div className={`session-info-banner ${selectedSession === 'SUBUH' ? 'subuh' : 'malam'}`}>
                <MapPin size={16} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div>
                    <strong>Lokasi Target:</strong> {targetLocationName} (Radius Maks: {maxRadiusMeters} m)
                  </div>
                  <div style={{ opacity: 0.9, marginTop: 2 }}>
                    <strong>Jadwal Resmi:</strong> Setiap hari pukul {activeSessionConfig.jamMulai}–{activeSessionConfig.jamSelesai} WIB
                    {isSelectedSessionInSchedule ? (
                      <span className="session-status-tag active" style={{ marginLeft: 6 }}>
                        ● Sedang Berlangsung
                      </span>
                    ) : (
                      <span className="session-status-tag inactive" style={{ marginLeft: 6 }}>
                        ○ Di Luar Jam Jadwal
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Viewport View (Video Stream or Captured Preview) */}
              <div className="camera-viewport">
                {photoPreview ? (
                  <>
                    <img
                      src={photoPreview}
                      alt="Preview Foto Selfie"
                      className="camera-preview-img"
                    />
                    <div className="camera-overlay">
                      <div className="camera-face-frame has-photo">
                        <div className="cam-corner tl" />
                        <div className="cam-corner tr" />
                        <div className="cam-corner bl" />
                        <div className="cam-corner br" />
                      </div>
                    </div>
                  </>
                ) : isCameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      autoPlay
                      className="camera-video"
                    />
                    <div className="camera-overlay">
                      <div className="camera-face-frame">
                        <div className="cam-corner tl" />
                        <div className="cam-corner tr" />
                        <div className="cam-corner bl" />
                        <div className="cam-corner br" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="camera-placeholder">
                    <div className="camera-placeholder-icon">
                      <Camera size={28} />
                    </div>
                    <p className="camera-placeholder-text">
                      {!isSelectedSessionInSchedule
                        ? `Presensi ${activeSessionConfig.nama} belum aktif (Jadwal: ${activeSessionConfig.jamMulai}–${activeSessionConfig.jamSelesai} WIB). Kamera dinonaktifkan.`
                        : gpsStatus === 'OUT_OF_BOUNDS'
                          ? `Anda berada di luar radius ${targetLocationName} (${distance !== null ? distance + ' m' : '...'}, batas: ${maxRadiusMeters} m). Kamera dinonaktifkan.`
                          : gpsStatus === 'LOW_ACCURACY'
                            ? `Akurasi sinyal GPS perangkat terlalu rendah (±${coords?.accuracy} m, toleransi: ≤ ${maxAccuracyMeters} m). Kamera dinonaktifkan.`
                            : gpsStatus === 'DENIED'
                              ? 'Izin akses lokasi ditolak. Silakan izinkan akses GPS pada browser.'
                              : 'Kamera belum aktif. Menunggu validasi lokasi GPS...'}
                    </p>
                    {isLocationValid && isSelectedSessionInSchedule && !isSelectedSessionDone && (
                      <button
                        type="button"
                        onClick={startCamera}
                        className="btn-capture-selfie"
                      >
                        <Camera size={14} />
                        Nyalakan Kamera
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Camera Error Message */}
              {cameraError && (
                <div className="camera-error-banner">
                  <AlertTriangle size={15} />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Camera Controls */}
              {!isSelectedSessionDone && isSelectedSessionInSchedule && (
                <div className="camera-controls">
                  {photoPreview ? (
                    <button
                      type="button"
                      onClick={handleRetakePhoto}
                      className="btn-retake-selfie"
                    >
                      <RotateCcw size={14} />
                      Ulangi Foto
                    </button>
                  ) : isCameraActive ? (
                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      className="btn-capture-selfie"
                    >
                      <Camera size={15} />
                      Ambil Foto Selfie
                    </button>
                  ) : null}
                </div>
              )}

              {/* Geofencing & GPS Status Panel */}
              <div className="gps-panel-container">
                {/* Status Bar */}
                <div
                  className={`gps-status-card ${gpsStatus === 'VALID'
                    ? 'valid'
                    : gpsStatus === 'OUT_OF_BOUNDS' || gpsStatus === 'DENIED' || gpsStatus === 'LOW_ACCURACY'
                      ? 'invalid'
                      : 'warning'
                    }`}
                >
                  <div className="gps-status-header">
                    <div className="gps-status-row">
                      <Navigation size={14} />
                      <span>
                        {gpsStatus === 'VALID'
                          ? `Lokasi Valid (Dalam Radius ${targetLocationName})`
                          : gpsStatus === 'OUT_OF_BOUNDS'
                            ? `Lokasi Ditolak: Di Luar Radius ${targetLocationName}`
                            : gpsStatus === 'LOW_ACCURACY'
                              ? 'Lokasi Ditolak: Akurasi GPS Terlalu Rendah'
                              : gpsStatus === 'DENIED'
                                ? 'Akses GPS Ditolak'
                                : 'Mendeteksi Koordinat GPS...'}
                      </span>
                    </div>
                    <span
                      className={`gps-pill ${gpsStatus === 'VALID'
                        ? 'valid'
                        : gpsStatus === 'OUT_OF_BOUNDS' || gpsStatus === 'DENIED' || gpsStatus === 'LOW_ACCURACY'
                          ? 'invalid'
                          : 'warning'
                        }`}
                    >
                      {gpsStatus === 'VALID' ? 'LOKASI VALID' : 'DITOLAK'}
                    </span>
                  </div>
                </div>

                {/* Separate Metric Cards for Distance and Accuracy */}
                <div className="gps-metrics-grid">
                  {/* Card 1: Jarak Sebenarnya ke Titik Pusat Lokasi Terpilih */}
                  <div
                    className={`metric-card ${distance !== null && distance <= maxRadiusMeters ? 'metric-valid' : 'metric-invalid'
                      }`}
                  >
                    <div className="metric-header">
                      <span className="metric-title">Jarak ke {selectedSession === 'SUBUH' ? 'Masjid MNI' : 'Asrama'}</span>
                      <span
                        className={`metric-badge ${distance !== null && distance <= maxRadiusMeters ? 'badge-ok' : 'badge-bad'
                          }`}
                      >
                        {distance !== null && distance <= maxRadiusMeters ? 'Dalam Radius' : 'Di Luar Radius'}
                      </span>
                    </div>
                    <div className="metric-value">
                      {distance !== null ? `${distance} m` : '...'}
                    </div>
                    <div className="metric-sub">
                      Radius maksimal: <strong>{maxRadiusMeters} meter</strong>
                    </div>
                    <div className="metric-coords">
                      Pusat: {targetLat.toFixed(5)}, {targetLng.toFixed(5)}
                    </div>
                  </div>

                  {/* Card 2: Akurasi Sinyal GPS Perangkat */}
                  <div
                    className={`metric-card ${coords && coords.accuracy <= maxAccuracyMeters ? 'metric-valid' : 'metric-warn'
                      }`}
                  >
                    <div className="metric-header">
                      <span className="metric-title">Akurasi Sinyal GPS</span>
                      <span
                        className={`metric-badge ${coords && coords.accuracy <= maxAccuracyMeters ? 'badge-ok' : 'badge-warn'
                          }`}
                      >
                        {coords && coords.accuracy <= maxAccuracyMeters ? 'Akurat' : 'Akurasi Rendah'}
                      </span>
                    </div>
                    <div className="metric-value">
                      {coords ? `±${coords.accuracy} m` : '...'}
                    </div>
                    <div className="metric-sub">
                      Syarat toleransi: <strong>≤ {maxAccuracyMeters} meter</strong>
                    </div>
                    <div className="metric-coords">
                      Perangkat: {coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : 'Mencari...'}
                    </div>
                  </div>
                </div>

                {/* Explanatory Alerts */}
                {gpsStatus === 'OUT_OF_BOUNDS' && (
                  <div className="gps-alert-box alert-error">
                    <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                    <p>
                      <strong>Presensi Ditolak (Di Luar Jangkauan):</strong> Anda terdeteksi berjarak{' '}
                      <strong>{distance} meter</strong> dari {targetLocationName}. Presensi {activeSessionConfig.nama} hanya
                      dapat dilakukan jika Anda berada dalam radius maksimal <strong>{maxRadiusMeters} meter</strong>.
                    </p>
                  </div>
                )}

                {gpsStatus === 'LOW_ACCURACY' && (
                  <div className="gps-alert-box alert-warning">
                    <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p>
                        <strong>Akurasi Sinyal GPS Terlalu Rendah (±{coords?.accuracy} meter):</strong>
                      </p>
                      <p style={{ marginTop: 2, opacity: 0.9 }}>
                        Sinyal GPS belum cukup presisi untuk memverifikasi kehadiran (maksimal toleransi{' '}
                        {maxAccuracyMeters} meter). Silakan aktifkan mode Akurasi Tinggi atau berpindah ke ruang terbuka,
                        lalu klik tombol di bawah.
                      </p>
                    </div>
                  </div>
                )}

                {gpsStatus === 'DENIED' && (
                  <div className="gps-alert-box alert-error">
                    <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                    <p>
                      <strong>Izin Lokasi Ditolak:</strong>{' '}
                      {gpsErrorMsg || 'Akses lokasi dibutuhkan oleh browser untuk memvalidasi radius kehadiran presensi.'}
                    </p>
                  </div>
                )}

                {/* Button to refresh GPS location */}
                <div className="gps-action-row">
                  <button type="button" onClick={requestLocation} className="btn-refresh-gps">
                    <RefreshCw size={12} />
                    <span>Perbarui Lokasi GPS</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status + Clock + Action */}
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
                  <span>{user?.gedung?.nama ? `Gedung ${user.gedung.nama}` : 'Asrama Unand'}</span>
                </div>
                <div className="presensi-user-info-item">
                  <MapPin size={13} />
                  <span>{user?.kamar?.nama || 'Kamar 102'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Session Status Overview */}
          <div className="presensi-sessions-card card">
            <div className="card-header">
              <div className="card-header-title" style={{ fontSize: 12 }}>Status Sesi Hari Ini</div>
            </div>
            <div className="card-body" style={{ padding: 14 }}>
              {/* Sesi Subuh */}
              <div
                className="presensi-session-item"
                style={{
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: 8,
                  background: selectedSession === 'SUBUH' ? '#f0fdf4' : 'transparent',
                }}
                onClick={() => setSelectedSession('SUBUH')}
              >
                <div className="presensi-session-left">
                  <Sun size={15} style={{ color: '#f59e0b' }} />
                  <div>
                    <div className="presensi-session-name">
                      Subuh — Masjid Nurul Ilmi {selectedSession === 'SUBUH' && '(Dipilih)'}
                    </div>
                    <div className="presensi-session-time">04:30 - 07:00 WIB (Radius: 100m)</div>
                  </div>
                </div>
                <span className={`status-badge ${subuhDone ? 'hadir' : isSubuhActiveTime ? 'warning' : 'alpa'}`}>
                  {subuhDone ? '✓ Hadir' : isSubuhActiveTime ? '● Buka' : 'Tutup'}
                </span>
              </div>

              <div className="presensi-session-divider" />

              {/* Sesi Malam */}
              <div
                className="presensi-session-item"
                style={{
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: 8,
                  background: selectedSession === 'MALAM' ? '#eff6ff' : 'transparent',
                }}
                onClick={() => setSelectedSession('MALAM')}
              >
                <div className="presensi-session-left">
                  <Moon size={15} style={{ color: '#6366f1' }} />
                  <div>
                    <div className="presensi-session-name">
                      Malam — Asrama Unand {selectedSession === 'MALAM' && '(Dipilih)'}
                    </div>
                    <div className="presensi-session-time">21:00 - 23:00 WIB (Radius: 200m)</div>
                  </div>
                </div>
                <span className={`status-badge ${malamDone ? 'hadir' : isMalamActiveTime ? 'warning' : 'alpa'}`}>
                  {malamDone ? '✓ Hadir' : isMalamActiveTime ? '● Buka' : 'Tutup'}
                </span>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="presensi-connection">
            <Wifi size={13} style={{ color: isLocationValid ? '#10b981' : '#f59e0b' }} />
            <span>GPS: {isLocationValid ? `Dalam Radius ${selectedSession}` : 'Luar Radius'}</span>
            <div className="presensi-conn-dot" />
            <Shield size={13} style={{ color: '#10b981' }} />
            <span>Validasi Selfie</span>
          </div>

          {/* Action Button & Feedback */}
          <div className="presensi-action">
            {isSelectedSessionDone ? (
              <div className="presensi-done-card">
                <CheckCircle2 size={22} style={{ color: '#047857' }} />
                <div>
                  <p className="presensi-done-title">Presensi {selectedSession} Tercatat</p>
                  <p className="presensi-done-sub">
                    Kehadiran foto selfie dan lokasi Anda di {targetLocationName} telah tervalidasi.
                  </p>
                </div>
              </div>
            ) : !isSelectedSessionInSchedule ? (
              <div className="gps-alert-box alert-warning" style={{ margin: 0 }}>
                <Clock size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontWeight: 600 }}>Di Luar Jam Jadwal Presensi {activeSessionConfig.nama}</p>
                  <p style={{ marginTop: 2, fontSize: 11, opacity: 0.9 }}>
                    Sesi {selectedSession === 'SUBUH' ? 'Subuh' : 'Malam'} hanya aktif pukul{' '}
                    <strong>{activeSessionConfig.jamMulai}–{activeSessionConfig.jamSelesai} WIB</strong> di{' '}
                    <strong>{targetLocationName}</strong>.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={handleCheckIn}
                  disabled={!canSubmit}
                  className="btn-primary presensi-submit-btn"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="spin" />
                      <span>Mengunggah Bukti &amp; Lokasi...</span>
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      <span>Kirim Presensi {selectedSession === 'SUBUH' ? 'Subuh (MNI)' : 'Malam (Asrama)'}</span>
                    </>
                  )}
                </button>

                {!isLocationValid && (
                  <p style={{ fontSize: 11, color: '#ef4444', textAlign: 'center', marginTop: 6 }}>
                    {gpsStatus === 'DENIED'
                      ? 'Izin GPS ditolak. Harap izinkan akses lokasi browser.'
                      : gpsStatus === 'LOW_ACCURACY'
                        ? `Akurasi sinyal GPS terlalu rendah (±${coords?.accuracy}m, toleransi: ≤ ${maxAccuracyMeters}m).`
                        : `Lokasi Anda di luar radius ${targetLocationName} (Jarak: ${distance !== null ? distance + 'm' : '...'}, batas: ${maxRadiusMeters}m).`}
                  </p>
                )}
                {isLocationValid && !photoBlob && (
                  <p style={{ fontSize: 11, color: '#f59e0b', textAlign: 'center', marginTop: 6 }}>
                    Silakan ambil foto selfie langsung terlebih dahulu sebelum mengirim absensi.
                  </p>
                )}
              </>
            )}
          </div>

          {/* Refresh GPS Button */}
          <button onClick={requestLocation} className="presensi-refresh-btn">
            <RefreshCw size={13} />
            Perbarui Lokasi GPS
          </button>
        </div>
      </div>
    </div>
  );
}
