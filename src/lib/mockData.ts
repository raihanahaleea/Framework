import type { User, Gedung, Kamar, Presensi, PengajuanIzin, AttendanceSetting, AuditLog } from '../types';

const STORAGE_KEY = 'asrama_mock_db_v1';

export interface MockDatabase {
  users: User[];
  buildings: Gedung[];
  rooms: Kamar[];
  presensi: Presensi[];
  leaveRequests: PengajuanIzin[];
  settings: AttendanceSetting[];
  auditLogs: AuditLog[];
}

const initialDb: MockDatabase = {
  users: [
    {
      id: 'user-admin-1',
      name: 'Dr. Hendra Wijaya, M.Kom',
      email: 'admin@unand.ac.id',
      role: 'ADMIN',
      isActive: true,
      mustChangePassword: false,
      createdAt: '2024-01-01T08:00:00Z',
    },
    {
      id: 'user-fasil-1',
      name: 'Rahmat Hidayat, S.T.',
      email: 'fasil@unand.ac.id',
      role: 'FASIL',
      isActive: true,
      mustChangePassword: false,
      cakupanGedung: [
        { id: 'cg-1', gedung: { id: 'gedung-1', nama: 'Asrama Menara Hijau' } },
        { id: 'cg-2', gedung: { id: 'gedung-2', nama: 'Asrama Pulau Belakang' } },
      ],
      createdAt: '2024-01-05T08:00:00Z',
    },
    {
      id: 'user-penghuni-1',
      name: 'Ahmad Fauzi',
      nim: '2111012345',
      asal: 'Padang Panjang',
      jenisKelamin: 'LAKI_LAKI',
      email: 'penghuni@unand.ac.id',
      role: 'PENGHUNI',
      isActive: true,
      mustChangePassword: false,
      gedungId: 'gedung-1',
      kamarId: 'kamar-102',
      gedung: { id: 'gedung-1', nama: 'Asrama Menara Hijau' },
      kamar: { id: 'kamar-102', nama: 'Kamar 102', nomorLantai: 1 },
      createdAt: '2024-02-01T08:00:00Z',
    },
    {
      id: 'user-penghuni-2',
      name: 'Siti Rahmawati',
      nim: '2111012346',
      asal: 'Bukittinggi',
      jenisKelamin: 'PEREMPUAN',
      email: 'siti@unand.ac.id',
      role: 'PENGHUNI',
      isActive: true,
      mustChangePassword: false,
      gedungId: 'gedung-3',
      kamarId: 'kamar-301',
      gedung: { id: 'gedung-3', nama: 'Asrama Putri Limau Manis' },
      kamar: { id: 'kamar-301', nama: 'Kamar 301', nomorLantai: 3 },
      createdAt: '2024-02-01T08:00:00Z',
    },
    {
      id: 'user-penghuni-3',
      name: 'Budi Pratama',
      nim: '2111012347',
      asal: 'Payakumbuh',
      jenisKelamin: 'LAKI_LAKI',
      email: 'budi@unand.ac.id',
      role: 'PENGHUNI',
      isActive: true,
      mustChangePassword: false,
      gedungId: 'gedung-1',
      kamarId: 'kamar-101',
      gedung: { id: 'gedung-1', nama: 'Asrama Menara Hijau' },
      kamar: { id: 'kamar-101', nama: 'Kamar 101', nomorLantai: 1 },
      createdAt: '2024-02-02T08:00:00Z',
    },
    {
      id: 'user-penghuni-4',
      name: 'Dinda Lestari',
      nim: '2111012348',
      asal: 'Solok',
      jenisKelamin: 'PEREMPUAN',
      email: 'dinda@unand.ac.id',
      role: 'PENGHUNI',
      isActive: true,
      mustChangePassword: false,
      gedungId: 'gedung-3',
      kamarId: 'kamar-302',
      gedung: { id: 'gedung-3', nama: 'Asrama Putri Limau Manis' },
      kamar: { id: 'kamar-302', nama: 'Kamar 302', nomorLantai: 3 },
      createdAt: '2024-02-02T08:00:00Z',
    },
  ],

  buildings: [
    {
      id: 'gedung-1',
      nama: 'Asrama Menara Hijau',
      latitude: -0.9152,
      longitude: 100.4612,
      radiusPresensi: 100,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      _count: { kamar: 12, users: 34 },
    },
    {
      id: 'gedung-2',
      nama: 'Asrama Pulau Belakang',
      latitude: -0.9160,
      longitude: 100.4625,
      radiusPresensi: 100,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      _count: { kamar: 10, users: 28 },
    },
    {
      id: 'gedung-3',
      nama: 'Asrama Putri Limau Manis',
      latitude: -0.9145,
      longitude: 100.4600,
      radiusPresensi: 120,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      _count: { kamar: 15, users: 42 },
    },
  ],

  rooms: [
    {
      id: 'kamar-101',
      nama: 'Kamar 101',
      nomorLantai: 1,
      kapasitas: 4,
      gedungId: 'gedung-1',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      gedung: { id: 'gedung-1', nama: 'Asrama Menara Hijau' },
      _count: { users: 3 },
    },
    {
      id: 'kamar-102',
      nama: 'Kamar 102',
      nomorLantai: 1,
      kapasitas: 4,
      gedungId: 'gedung-1',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      gedung: { id: 'gedung-1', nama: 'Asrama Menara Hijau' },
      _count: { users: 4 },
    },
    {
      id: 'kamar-201',
      nama: 'Kamar 201',
      nomorLantai: 2,
      kapasitas: 4,
      gedungId: 'gedung-1',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      gedung: { id: 'gedung-1', nama: 'Asrama Menara Hijau' },
      _count: { users: 2 },
    },
    {
      id: 'kamar-301',
      nama: 'Kamar 301',
      nomorLantai: 3,
      kapasitas: 3,
      gedungId: 'gedung-3',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      gedung: { id: 'gedung-3', nama: 'Asrama Putri Limau Manis' },
      _count: { users: 3 },
    },
  ],

  presensi: [
    {
      id: 'p-1',
      userId: 'user-penghuni-1',
      tanggalPresensi: new Date().toISOString().split('T')[0],
      jenisPresensi: 'SUBUH',
      waktu: '2026-10-27T05:15:00Z',
      latitude: -0.91522,
      longitude: 100.46118,
      accuracy: 12,
      status: 'HADIR',
      createdAt: '2026-10-27T05:15:00Z',
      user: {
        id: 'user-penghuni-1',
        name: 'Ahmad Fauzi',
        nim: '2111012345',
        gedung: { nama: 'Asrama Menara Hijau' },
        kamar: { nama: 'Kamar 102' },
      },
    },
    {
      id: 'p-2',
      userId: 'user-penghuni-3',
      tanggalPresensi: new Date().toISOString().split('T')[0],
      jenisPresensi: 'SUBUH',
      waktu: '2026-10-27T05:22:00Z',
      latitude: -0.91525,
      longitude: 100.46125,
      accuracy: 15,
      status: 'HADIR',
      createdAt: '2026-10-27T05:22:00Z',
      user: {
        id: 'user-penghuni-3',
        name: 'Budi Pratama',
        nim: '2111012347',
        gedung: { nama: 'Asrama Menara Hijau' },
        kamar: { nama: 'Kamar 101' },
      },
    },
  ],

  leaveRequests: [
    {
      id: 'lr-1',
      userId: 'user-penghuni-1',
      jenisIzin: 'Keperluan Keluarga',
      tanggalMulai: '2026-10-28',
      tanggalSelesai: '2026-10-30',
      alasan: 'Menghadiri pernikahan kakak kandung di kampung halaman.',
      keterangan: 'Sudah izin juga ke orang tua dan ketua lorong.',
      status: 'MENUNGGU',
      createdAt: '2026-10-26T14:20:00Z',
      updatedAt: '2026-10-26T14:20:00Z',
      user: { id: 'user-penghuni-1', name: 'Ahmad Fauzi', nim: '2111012345' },
    },
    {
      id: 'lr-2',
      userId: 'user-penghuni-2',
      jenisIzin: 'Sakit',
      tanggalMulai: '2026-10-20',
      tanggalSelesai: '2026-10-22',
      alasan: 'Demam tinggi dan istirahat di klinik.',
      status: 'DISETUJUI',
      catatanFasil: 'Disetujui. Semoga lekas sembuh.',
      diprosesOleh: 'user-fasil-1',
      waktuKeputusan: '2026-10-20T10:00:00Z',
      createdAt: '2026-10-20T08:30:00Z',
      updatedAt: '2026-10-20T10:00:00Z',
      user: { id: 'user-penghuni-2', name: 'Siti Rahmawati', nim: '2111012346' },
      fasil: { id: 'user-fasil-1', name: 'Rahmat Hidayat, S.T.' },
    },
  ],

  settings: [
    {
      id: 'set-subuh',
      jenisPresensi: 'SUBUH',
      jamMulai: '04:30',
      jamSelesai: '07:00',
      timezone: 'Asia/Jakarta',
      isActive: true,
    },
    {
      id: 'set-malam',
      jenisPresensi: 'MALAM',
      jamMulai: '21:00',
      jamSelesai: '23:00',
      timezone: 'Asia/Jakarta',
      isActive: true,
    },
  ],

  auditLogs: [
    {
      id: 'log-1',
      actorUserId: 'user-admin-1',
      action: 'UPDATE_BUILDING',
      entityType: 'Gedung',
      entityId: 'gedung-1',
      details: { field: 'radiusPresensi', old: 80, new: 100 },
      ipAddress: '192.168.1.10',
      createdAt: '2026-10-26T10:30:00Z',
      actor: { id: 'user-admin-1', name: 'Dr. Hendra Wijaya, M.Kom', email: 'admin@unand.ac.id' },
    },
    {
      id: 'log-2',
      actorUserId: 'user-fasil-1',
      action: 'APPROVE_LEAVE',
      entityType: 'PengajuanIzin',
      entityId: 'lr-2',
      details: { status: 'DISETUJUI' },
      ipAddress: '192.168.1.15',
      createdAt: '2026-10-20T10:00:00Z',
      actor: { id: 'user-fasil-1', name: 'Rahmat Hidayat, S.T.', email: 'fasil@unand.ac.id' },
    },
  ],
};

export function getMockDb(): MockDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDb));
      return initialDb;
    }
    return JSON.parse(raw);
  } catch {
    return initialDb;
  }
}

export function saveMockDb(db: MockDatabase) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Failed to save mock db to localStorage', err);
  }
}
