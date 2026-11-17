import type { StatusPresensi, StatusPengajuanIzin, JenisKelamin, Role } from '../types';

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  });
}

export function getStatusPresensiLabel(status: StatusPresensi): string {
  const map: Record<StatusPresensi, string> = {
    HADIR: 'Hadir',
    IZIN: 'Izin',
    ALPA: 'Alpa',
  };
  return map[status] || status;
}

export function getStatusIzinLabel(status: StatusPengajuanIzin): string {
  const map: Record<StatusPengajuanIzin, string> = {
    MENUNGGU: 'Menunggu',
    DISETUJUI: 'Disetujui',
    DITOLAK: 'Ditolak',
  };
  return map[status] || status;
}

export function getJenisKelaminLabel(jk: JenisKelamin): string {
  return jk === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan';
}

export function getRoleLabel(role: Role): string {
  const map: Record<Role, string> = {
    PENGHUNI: 'Penghuni',
    FASIL: 'Fasil',
    ADMIN: 'Admin',
  };
  return map[role] || role;
}

export function getStatusBadgeClass(status: string): string {
  const lower = status.toLowerCase();
  if (['hadir', 'disetujui', 'active'].includes(lower)) return 'badge-hadir';
  if (['izin', 'menunggu'].includes(lower)) return 'badge-menunggu';
  if (['alpa', 'ditolak', 'inactive'].includes(lower)) return 'badge-alpa';
  return 'badge-menunggu';
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getWIBTime(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
}

export function getCurrentWIBDateString(): string {
  const now = getWIBTime();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
