// ===== ENUMS =====
export type Role = 'PENGHUNI' | 'FASIL' | 'ADMIN';
export type JenisPresensi = 'SUBUH' | 'MALAM';
export type StatusPresensi = 'HADIR' | 'IZIN' | 'ALPA';
export type StatusPengajuanIzin = 'MENUNGGU' | 'DISETUJUI' | 'DITOLAK';
export type JenisKelamin = 'LAKI_LAKI' | 'PEREMPUAN';

// ===== USER =====
export interface User {
  id: string;
  name: string;
  nim?: string | null;
  asal?: string | null;
  jenisKelamin?: JenisKelamin | null;
  email: string;
  role: Role;
  isActive: boolean;
  mustChangePassword: boolean;
  gedungId?: string | null;
  kamarId?: string | null;
  gedung?: { id: string; nama: string } | null;
  kamar?: { id: string; nama: string; nomorLantai?: number } | null;
  cakupanGedung?: { id: string; gedung: { id: string; nama: string } }[];
  createdAt: string;
  updatedAt?: string;
}

// ===== AUTH =====
export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

// ===== GEDUNG =====
export interface Gedung {
  id: string;
  nama: string;
  latitude: number;
  longitude: number;
  radiusPresensi: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { kamar: number; users: number };
  kamar?: Kamar[];
}

// ===== KAMAR =====
export interface Kamar {
  id: string;
  nama: string;
  nomorLantai: number;
  kapasitas: number;
  gedungId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  gedung?: { id: string; nama: string };
  _count?: { users: number };
  users?: User[];
}

// ===== PRESENSI =====
export interface Presensi {
  id: string;
  userId: string;
  tanggalPresensi: string;
  jenisPresensi: JenisPresensi;
  waktu: string;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  status: StatusPresensi;
  keterangan?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    nim?: string;
    gedung?: { nama: string };
    kamar?: { nama: string };
  };
}

export interface TodayAttendance {
  subuh: Presensi | null;
  malam: Presensi | null;
  tanggal: string;
  settings: AttendanceSetting[];
}

export interface CheckInRequest {
  jenisPresensi: JenisPresensi;
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// ===== PENGAJUAN IZIN =====
export interface PengajuanIzin {
  id: string;
  userId: string;
  jenisIzin: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  alasan: string;
  keterangan?: string | null;
  status: StatusPengajuanIzin;
  catatanFasil?: string | null;
  diprosesOleh?: string | null;
  waktuKeputusan?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; nim?: string };
  fasil?: { id: string; name: string };
  lampiran?: LampiranIzin[];
}

export interface LampiranIzin {
  id: string;
  pengajuanIzinId: string;
  namaAsli: string;
  namaFile: string;
  mimeType: string;
  ukuranFile: number;
  createdAt: string;
}

// ===== SETTINGS =====
export interface AttendanceSetting {
  id: string;
  jenisPresensi: JenisPresensi;
  jamMulai: string;
  jamSelesai: string;
  timezone: string;
  isActive: boolean;
}

// ===== AUDIT LOG =====
export interface AuditLog {
  id: string;
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, any> | null;
  ipAddress?: string | null;
  createdAt: string;
  actor?: { id: string; name: string; email: string };
}

// ===== DASHBOARD =====
export interface DashboardPenghuni {
  user: User;
  todayAttendance: TodayAttendance;
  monthSummary: { hadir: number; izin: number; alpa: number; total: number };
  recentAttendance: Presensi[];
  recentLeaveRequests: PengajuanIzin[];
}

export interface DashboardFasil {
  totalPenghuni: number;
  todayAttendance: { hadir: number; izin: number; alpa: number };
  pendingLeaveRequests: number;
  recentAttendance: Presensi[];
  attendanceTrend: { date: string; hadir: number; izin: number; alpa: number }[];
}

export interface DashboardAdmin {
  totalPenghuni: number;
  totalFasil: number;
  totalGedung: number;
  totalKamar: number;
  todayAttendance: { hadir: number; izin: number; alpa: number };
  pendingLeaveRequests: number;
  attendanceTrend: { date: string; hadir: number; izin: number; alpa: number }[];
  recentActivity: AuditLog[];
}

// ===== API =====
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
