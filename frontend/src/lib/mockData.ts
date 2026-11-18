import type { User, Gedung, Kamar, Presensi, PengajuanIzin, AttendanceSetting, AuditLog } from '../types';

const STORAGE_KEY = 'asrama_mock_db_v4';

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
      id: 'user-penghuni-0',
      name: 'Mahasiswa Asrama',
      nim: '2311522040',
      asal: 'Padang',
      jenisKelamin: 'LAKI_LAKI',
      email: '2311522040@student.unand.ac.id',
      role: 'PENGHUNI',
      isActive: true,
      mustChangePassword: false,
      gedungId: 'gedung-g',
      kamarId: 'kamar-g-101',
      gedung: { id: 'gedung-g', kode: 'G', nama: 'Hijau', kategori: 'PUTRA' },
      kamar: { id: 'kamar-g-101', nama: 'Kamar G-101', nomorLantai: 1 },
      createdAt: '2024-02-01T08:00:00Z',
    },
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
        { id: 'cg-1', gedung: { id: 'gedung-g', nama: 'Hijau' } },
        { id: 'cg-2', gedung: { id: 'gedung-f', nama: 'Orange' } },
        { id: 'cg-3', gedung: { id: 'gedung-h', nama: 'PUPERA H (Putra)' } },
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
      gedungId: 'gedung-g',
      kamarId: 'kamar-g-102',
      gedung: { id: 'gedung-g', kode: 'G', nama: 'Hijau', kategori: 'PUTRA' },
      kamar: { id: 'kamar-g-102', nama: 'Kamar G-102', nomorLantai: 1 },
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
      gedungId: 'gedung-a',
      kamarId: 'kamar-a-101',
      gedung: { id: 'gedung-a', kode: 'A', nama: 'RPX', kategori: 'PUTRI' },
      kamar: { id: 'kamar-a-101', nama: 'Kamar A-101', nomorLantai: 1 },
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
      gedungId: 'gedung-f',
      kamarId: 'kamar-f-201',
      gedung: { id: 'gedung-f', kode: 'F', nama: 'Orange', kategori: 'PUTRA' },
      kamar: { id: 'kamar-f-201', nama: 'Kamar F-201', nomorLantai: 2 },
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
      gedungId: 'gedung-c',
      kamarId: 'kamar-c-302',
      gedung: { id: 'gedung-c', kode: 'C', nama: 'PUPERA C (Putri)', kategori: 'PUTRI' },
      kamar: { id: 'kamar-c-302', nama: 'Kamar C-302', nomorLantai: 3 },
      createdAt: '2024-02-02T08:00:00Z',
    },
  ],

  buildings: [
    {
      id: 'gedung-a',
      kode: 'A',
      nama: 'RPX',
      kategori: 'PUTRI',
      gender: 'PEREMPUAN',
      latitude: -0.9148,
      longitude: 100.4530,
      radiusPresensi: 150,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      _count: { kamar: 16, users: 48 },
    },
    {
      id: 'gedung-b',
      kode: 'B',
      nama: 'Rusunawa',
      kategori: 'PUTRI',
      gender: 'PEREMPUAN',
      latitude: -0.9155,
      longitude: 100.4535,
      radiusPresensi: 150,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      _count: { kamar: 20, users: 60 },
    },
    {
      id: 'gedung-c',
      kode: 'C',
      nama: 'PUPERA C (Putri)',
      kategori: 'PUTRI',
      gender: 'PEREMPUAN',
      latitude: -0.9162,
      longitude: 100.4540,
      radiusPresensi: 150,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      _count: { kamar: 18, users: 54 },
    },
    {
      id: 'gedung-d',
      kode: 'D',
      nama: 'Menpera',
      kategori: 'PUTRI',
      gender: 'PEREMPUAN',
      latitude: -0.9168,
      longitude: 100.4532,
      radiusPresensi: 150,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      _count: { kamar: 16, users: 48 },
    },
    {
      id: 'gedung-e',
      kode: 'E',
      nama: 'Roesma M. Sjaaf',
      kategori: 'PUTRI',
      gender: 'PEREMPUAN',
      latitude: -0.9172,
      longitude: 100.4545,
      radiusPresensi: 150,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      _count: { kamar: 14, users: 42 },
    },
    {
      id: 'gedung-f',
      kode: 'F',
      nama: 'Orange',
      kategori: 'PUTRA',
      gender: 'LAKI_LAKI',
      latitude: -0.9170,
      longitude: 100.4535,
      radiusPresensi: 200,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      _count: { kamar: 18, users: 54 },
    },
    {
      id: 'gedung-g',
      kode: 'G',
      nama: 'Hijau',
      kategori: 'PUTRA',
      gender: 'LAKI_LAKI',
      latitude: -0.9169,
      longitude: 100.4533,
      radiusPresensi: 200,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      _count: { kamar: 16, users: 48 },
    },
    {
      id: 'gedung-h',
      kode: 'H',
      nama: 'PUPERA H (Putra)',
      kategori: 'PUTRA',
      gender: 'LAKI_LAKI',
      latitude: -0.9171,
      longitude: 100.4531,
      radiusPresensi: 200,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      _count: { kamar: 16, users: 48 },
    },
  ],

  rooms: [
    {
      id: 'kamar-g-101',
      nama: 'Kamar G-101',
      nomorLantai: 1,
      kapasitas: 4,
      gedungId: 'gedung-g',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      gedung: { id: 'gedung-g', nama: 'Hijau' },
      _count: { users: 3 },
    },
    {
      id: 'kamar-g-102',
      nama: 'Kamar G-102',
      nomorLantai: 1,
      kapasitas: 4,
      gedungId: 'gedung-g',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      gedung: { id: 'gedung-g', nama: 'Hijau' },
      _count: { users: 4 },
    },
    {
      id: 'kamar-f-201',
      nama: 'Kamar F-201',
      nomorLantai: 2,
      kapasitas: 4,
      gedungId: 'gedung-f',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      gedung: { id: 'gedung-f', nama: 'Orange' },
      _count: { users: 2 },
    },
    {
      id: 'kamar-a-101',
      nama: 'Kamar A-101',
      nomorLantai: 1,
      kapasitas: 4,
      gedungId: 'gedung-a',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      gedung: { id: 'gedung-a', nama: 'RPX' },
      _count: { users: 3 },
    },
    {
      id: 'kamar-c-301',
      nama: 'Kamar C-301',
      nomorLantai: 3,
      kapasitas: 3,
      gedungId: 'gedung-c',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      gedung: { id: 'gedung-c', nama: 'PUPERA C (Putri)' },
      _count: { users: 3 },
    },
    {
      id: 'kamar-c-302',
      nama: 'Kamar C-302',
      nomorLantai: 3,
      kapasitas: 3,
      gedungId: 'gedung-c',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      gedung: { id: 'gedung-c', nama: 'PUPERA C (Putri)' },
      _count: { users: 4 },
 },
    {
      id: 'kamar-c-302',
      nama: 'Kamar C-302',
      nomorLantai: 3,
      kapasitas: 3,
      gedungId: 'gedung-c',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      gedung: { id: 'gedung-c', nama: 'PUPERA C (Putri)' },
      _count: { users: 4 },
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
        gedung: { nama: 'Hijau' },
        kamar: { nama: 'Kamar G-102' },
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
        gedung: { nama: 'Orange' },
        kamar: { nama: 'Kamar F-201' },
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
    // Purge older mock database keys
    try {
      localStorage.removeItem('asrama_mock_db_v1');
      localStorage.removeItem('asrama_mock_db_v2');
    } catch {}

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDb));
      return initialDb;
    }
    const parsed: MockDatabase = JSON.parse(raw);
    const isOutdated =
      !parsed.buildings ||
      parsed.buildings.length < 8 ||
      parsed.buildings.some((b) => b.nama?.includes('Limau Manis') || b.nama?.includes('Menara Hijau') || b.nama?.includes('Pulau Belakang')) ||
      parsed.users?.some((u) => u.gedung?.nama?.includes('Limau Manis') || u.gedung?.nama?.includes('Menara Hijau'));

    if (isOutdated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDb));
      return initialDb;
    }
    return parsed;
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
