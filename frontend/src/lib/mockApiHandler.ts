import { getMockDb, saveMockDb } from './mockData';
import { getStoredUser, setStoredUser } from './auth';

// Helper to simulate network latency
export const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export async function handleMockApi(url: string, method: string, data?: any, params?: any): Promise<any> {
  const db = getMockDb();
  const cleanUrl = url.replace(/^\/api/, '').split('?')[0];
  let currentUser = getStoredUser();

  // If currentUser has stale/cached data, sync with latest fresh definition from db.users
  if (currentUser) {
    const fresh = db.users.find(
      (u) =>
        u.id === currentUser?.id ||
        (u.email && currentUser?.email && u.email.toLowerCase() === currentUser.email.toLowerCase()) ||
        (u.nim && currentUser?.nim && u.nim === currentUser.nim)
    );
    if (fresh) {
      currentUser = { ...currentUser, ...fresh };
      setStoredUser(currentUser);
    }
  } else {
    currentUser = db.users[0];
  }

  // ===== AUTH =====
  if (cleanUrl === '/auth/login' && method.toUpperCase() === 'POST') {
    const { identifier } = data || {};
    // Match by email or nim
    const found = db.users.find(
      (u) =>
        (u.email && identifier && u.email.toLowerCase() === identifier.toLowerCase()) ||
        (u.nim && u.nim === identifier)
    );

    if (!found) {
      const err: any = new Error('Email atau NIM tidak ditemukan');
      err.response = { status: 401, data: { message: 'Email atau NIM tidak terdaftar' } };
      throw err;
    }

    setStoredUser(found);

    return {
      data: {
        accessToken: 'mock-jwt-token-' + found.id,
        refreshToken: 'mock-refresh-token-' + found.id,
        user: found,
      },
    };
  }

  if (cleanUrl === '/auth/me' && method.toUpperCase() === 'GET') {
    const userFromDb = db.users.find(
      (u) =>
        u.id === currentUser?.id ||
        (u.email && currentUser?.email && u.email.toLowerCase() === currentUser.email.toLowerCase()) ||
        (u.nim && currentUser?.nim && u.nim === currentUser.nim)
    ) || currentUser;
    if (userFromDb) {
      setStoredUser(userFromDb);
    }
    return { data: userFromDb };
  }

  if (cleanUrl === '/auth/logout' && method.toUpperCase() === 'POST') {
    return { data: { success: true } };
  }

  if (cleanUrl === '/auth/change-password' && method.toUpperCase() === 'POST') {
    return { data: { message: 'Password berhasil diperbarui' } };
  }

  // ===== DASHBOARDS =====
  if (cleanUrl === '/dashboard/resident' && method.toUpperCase() === 'GET') {
    const todayStr = new Date().toISOString().split('T')[0];
    const userPresensi = db.presensi.filter((p) => p.userId === currentUser.id);
    const todaySubuh = userPresensi.find((p) => p.tanggalPresensi === todayStr && p.jenisPresensi === 'SUBUH') || null;
    const todayMalam = userPresensi.find((p) => p.tanggalPresensi === todayStr && p.jenisPresensi === 'MALAM') || null;

    const hadirCount = userPresensi.filter((p) => p.status === 'HADIR').length;
    const izinCount = userPresensi.filter((p) => p.status === 'IZIN').length;
    const alpaCount = userPresensi.filter((p) => p.status === 'ALPA').length;

    const userLeaves = db.leaveRequests.filter((l) => l.userId === currentUser.id);

    const payload: any = {
      user: currentUser,
      todayAttendance: {
        subuh: todaySubuh,
        malam: todayMalam,
        tanggal: todayStr,
        settings: db.settings,
      },
      monthSummary: {
        hadir: hadirCount,
        izin: izinCount,
        alpa: alpaCount,
        total: hadirCount + izinCount + alpaCount,
      },
      recentAttendance: userPresensi.slice(0, 5),
      recentLeaveRequests: userLeaves.slice(0, 5),
    };
    return { data: payload };
  }

  if (cleanUrl === '/dashboard/facilitator' && method.toUpperCase() === 'GET') {
    const totalPenghuni = db.users.filter((u) => u.role === 'PENGHUNI').length;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayP = db.presensi.filter((p) => p.tanggalPresensi === todayStr);

    const hadir = todayP.filter((p) => p.status === 'HADIR').length;
    const izin = todayP.filter((p) => p.status === 'IZIN').length;
    const alpa = Math.max(0, totalPenghuni - hadir - izin);
    const pendingLeaveRequests = db.leaveRequests.filter((l) => l.status === 'MENUNGGU').length;

    const payload: any = {
      totalPenghuni,
      todayAttendance: { hadir, izin, alpa },
      pendingLeaveRequests,
      recentAttendance: db.presensi.slice(0, 10),
      attendanceTrend: [
        { date: '21 Okt', hadir: 32, izin: 2, alpa: 1 },
        { date: '22 Okt', hadir: 34, izin: 1, alpa: 0 },
        { date: '23 Okt', hadir: 33, izin: 2, alpa: 0 },
        { date: '24 Okt', hadir: 30, izin: 3, alpa: 2 },
        { date: '25 Okt', hadir: 35, izin: 0, alpa: 0 },
        { date: '26 Okt', hadir: 33, izin: 1, alpa: 1 },
        { date: '27 Okt', hadir: hadir || 34, izin: izin || 1, alpa: alpa || 0 },
      ],
    };
    return { data: payload };
  }

  if (cleanUrl === '/dashboard/admin' && method.toUpperCase() === 'GET') {
    const totalPenghuni = db.users.filter((u) => u.role === 'PENGHUNI').length;
    const totalFasil = db.users.filter((u) => u.role === 'FASIL').length;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayP = db.presensi.filter((p) => p.tanggalPresensi === todayStr);
    const hadir = todayP.filter((p) => p.status === 'HADIR').length;
    const izin = todayP.filter((p) => p.status === 'IZIN').length;
    const alpa = Math.max(0, totalPenghuni - hadir - izin);
    const pendingLeaveRequests = db.leaveRequests.filter((l) => l.status === 'MENUNGGU').length;

    const payload: any = {
      totalPenghuni,
      totalFasil,
      totalGedung: db.buildings.length,
      totalKamar: db.rooms.length,
      todayAttendance: { hadir, izin, alpa },
      pendingLeaveRequests,
      attendanceTrend: [
        { date: '21 Okt', hadir: 32, izin: 2, alpa: 1 },
        { date: '22 Okt', hadir: 34, izin: 1, alpa: 0 },
        { date: '23 Okt', hadir: 33, izin: 2, alpa: 0 },
        { date: '24 Okt', hadir: 30, izin: 3, alpa: 2 },
        { date: '25 Okt', hadir: 35, izin: 0, alpa: 0 },
        { date: '26 Okt', hadir: 33, izin: 1, alpa: 1 },
        { date: '27 Okt', hadir: hadir || 34, izin: izin || 1, alpa: alpa || 0 },
      ],
      recentActivity: db.auditLogs.slice(0, 6),
    };
    return { data: payload };
  }

  // ===== ATTENDANCE =====
  if (cleanUrl === '/attendance/today' && method.toUpperCase() === 'GET') {
    const todayStr = new Date().toISOString().split('T')[0];
    const userPresensi = db.presensi.filter((p) => p.userId === currentUser.id);
    const subuh = userPresensi.find((p) => p.tanggalPresensi === todayStr && p.jenisPresensi === 'SUBUH') || null;
    const malam = userPresensi.find((p) => p.tanggalPresensi === todayStr && p.jenisPresensi === 'MALAM') || null;

    return {
      data: {
        subuh,
        malam,
        tanggal: todayStr,
        settings: db.settings,
      },
    };
  }

  if ((cleanUrl === '/attendance/config' || cleanUrl === '/presensi/config') && method.toUpperCase() === 'GET') {
    return {
      data: {
        centerLat: -0.9169337875669057,
        centerLong: 100.45326630992055,
        maxRadiusMeters: 200,
        maxAccuracyMeters: 50,
        lokasiNama: 'Kompleks Asrama Mahasiswa Universitas Andalas',
      },
    };
  }

  if ((cleanUrl === '/attendance/check-in' || cleanUrl === '/presensi') && method.toUpperCase() === 'POST') {
    let jenisPresensi = 'SUBUH';
    let latitude = -0.91533;
    let longitude = 100.46095;
    let accuracy = 15;
    let fotoWajah = '';

    if (data instanceof FormData) {
      jenisPresensi = (data.get('jenisPresensi') as string) || 'SUBUH';
      latitude = Number(data.get('latitude') || data.get('lat') || -0.91533);
      longitude = Number(data.get('longitude') || data.get('long') || 100.46095);
      accuracy = Number(data.get('accuracy') || 15);
      const fotoFile = data.get('foto_wajah') || data.get('foto');
      if (fotoFile && typeof fotoFile === 'object' && 'name' in fotoFile) {
        fotoWajah = URL.createObjectURL(fotoFile as Blob);
      } else {
        fotoWajah = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
      }
    } else if (data) {
      jenisPresensi = data.jenisPresensi || 'SUBUH';
      latitude = Number(data.latitude || data.lat || -0.91533);
      longitude = Number(data.longitude || data.long || 100.46095);
      accuracy = Number(data.accuracy || 15);
      fotoWajah = data.fotoWajah || data.foto_wajah || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
    }

    // Geofencing Haversine validation
    const centerLat = -0.9169337875669057;
    const centerLong = 100.45326630992055;
    const maxRadius = 200;
    const maxAccuracy = 50;

    // Requirement 6: Validate GPS Accuracy
    if (accuracy > maxAccuracy) {
      const err: any = new Error(`Akurasi sinyal GPS perangkat Anda terlalu rendah (±${Math.round(accuracy)} m, toleransi maksimal: ${maxAccuracy} m).`);
      err.response = {
        status: 400,
        data: {
          statusCode: 400,
          message: `Akurasi sinyal GPS perangkat Anda terlalu rendah (±${Math.round(accuracy)} m, toleransi maksimal: ${maxAccuracy} m). Silakan perbarui lokasi GPS Anda di ruang terbuka.`,
          error: 'Bad Request',
        },
      };
      throw err;
    }

    // Haversine formula (exact)
    const R = 6371000;
    const toRad = (x: number) => (x * Math.PI) / 180;
    const phi1 = toRad(latitude);
    const phi2 = toRad(centerLat);
    const dLat = toRad(centerLat - latitude);
    const dLon = toRad(centerLong - longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(phi1) * Math.cos(phi2) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceMeters = Math.round(R * c);

    // Requirement 4 & 5: Validate distance
    if (distanceMeters > maxRadius) {
      const err: any = new Error(`Presensi ditolak! Anda berada di luar radius area asrama (jarak: ${distanceMeters} m dari titik pusat asrama, batas maksimal: ${maxRadius} m).`);
      err.response = {
        status: 400,
        data: {
          statusCode: 400,
          message: `Presensi ditolak! Anda berada di luar radius area asrama (jarak: ${distanceMeters} m dari titik pusat asrama, batas maksimal: ${maxRadius} m).`,
          error: 'Bad Request',
        },
      };
      throw err;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const newPresensi: any = {
      id: 'p-' + Date.now(),
      userId: currentUser.id,
      tanggalPresensi: todayStr,
      jenisPresensi,
      waktu: new Date().toISOString(),
      latitude,
      longitude,
      accuracy,
      jarakMeter: distanceMeters,
      jarak_meter: distanceMeters,
      fotoWajah,
      foto_wajah: fotoWajah,
      status: 'HADIR',
      createdAt: new Date().toISOString(),
      user: {
        id: currentUser.id,
        name: currentUser.name,
        nim: currentUser.nim,
        gedung: currentUser.gedung,
        kamar: currentUser.kamar,
      },
    };

    db.presensi.unshift(newPresensi);
    saveMockDb(db);

    return {
      data: {
        message: `Presensi ${jenisPresensi} berhasil dicatat (Jarak: ${distanceMeters}m)!`,
        presensi: newPresensi,
      },
    };
  }

  if (cleanUrl === '/attendance/me' && method.toUpperCase() === 'GET') {
    const page = Number(params?.page || 1);
    const limit = Number(params?.limit || 10);
    let list = db.presensi.filter((p) => p.userId === currentUser.id);

    if (params?.jenisPresensi) {
      list = list.filter((p) => p.jenisPresensi === params.jenisPresensi);
    }
    if (params?.tanggalMulai) {
      list = list.filter((p) => p.tanggalPresensi >= params.tanggalMulai);
    }
    if (params?.tanggalSelesai) {
      list = list.filter((p) => p.tanggalPresensi <= params.tanggalSelesai);
    }

    const total = list.length;
    const paginated = list.slice((page - 1) * limit, page * limit);

    return {
      data: {
        data: paginated,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    };
  }

  if (cleanUrl === '/attendance' && method.toUpperCase() === 'GET') {
    const page = Number(params?.page || 1);
    const limit = Number(params?.limit || 10);
    let list = [...db.presensi];

    if (params?.search) {
      const s = params.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.user?.name.toLowerCase().includes(s) ||
          p.user?.nim?.toLowerCase().includes(s)
      );
    }
    if (params?.status) {
      list = list.filter((p) => p.status === params.status);
    }
    if (params?.jenisPresensi) {
      list = list.filter((p) => p.jenisPresensi === params.jenisPresensi);
    }

    const total = list.length;
    const paginated = list.slice((page - 1) * limit, page * limit);

    return {
      data: {
        data: paginated,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    };
  }

  // ===== LEAVE REQUESTS =====
  if (cleanUrl === '/leave-requests/me' && method.toUpperCase() === 'GET') {
    const page = Number(params?.page || 1);
    const limit = Number(params?.limit || 10);
    const list = db.leaveRequests.filter((l) => l.userId === currentUser.id);
    const total = list.length;
    const paginated = list.slice((page - 1) * limit, page * limit);

    return {
      data: {
        data: paginated,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    };
  }

  if (cleanUrl === '/leave-requests' && method.toUpperCase() === 'POST') {
    // Handle FormData or JSON
    let jenisIzin = '';
    let tanggalMulai = '';
    let tanggalSelesai = '';
    let alasan = '';
    let keterangan = '';

    if (data instanceof FormData) {
      jenisIzin = data.get('jenisIzin') as string;
      tanggalMulai = data.get('tanggalMulai') as string;
      tanggalSelesai = data.get('tanggalSelesai') as string;
      alasan = data.get('alasan') as string;
      keterangan = (data.get('keterangan') as string) || '';
    } else {
      jenisIzin = data?.jenisIzin;
      tanggalMulai = data?.tanggalMulai;
      tanggalSelesai = data?.tanggalSelesai;
      alasan = data?.alasan;
      keterangan = data?.keterangan || '';
    }

    const newLeave: any = {
      id: 'lr-' + Date.now(),
      userId: currentUser.id,
      jenisIzin,
      tanggalMulai,
      tanggalSelesai,
      alasan,
      keterangan,
      status: 'MENUNGGU',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: { id: currentUser.id, name: currentUser.name, nim: currentUser.nim },
    };

    db.leaveRequests.unshift(newLeave);
    saveMockDb(db);

    return { data: { message: 'Pengajuan izin berhasil dikirim', data: newLeave } };
  }

  if (cleanUrl === '/leave-requests' && method.toUpperCase() === 'GET') {
    const page = Number(params?.page || 1);
    const limit = Number(params?.limit || 10);
    let list = [...db.leaveRequests];

    if (params?.status) {
      list = list.filter((l) => l.status === params.status);
    }

    const total = list.length;
    const paginated = list.slice((page - 1) * limit, page * limit);

    return {
      data: {
        data: paginated,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    };
  }

  const leaveStatusMatch = cleanUrl.match(/^\/leave-requests\/([^/]+)\/status$/);
  if (leaveStatusMatch && (method.toUpperCase() === 'PATCH' || method.toUpperCase() === 'PUT')) {
    const id = leaveStatusMatch[1];
    const index = db.leaveRequests.findIndex((l) => l.id === id);
    if (index !== -1) {
      db.leaveRequests[index] = {
        ...db.leaveRequests[index],
        status: data.status,
        catatanFasil: data.catatanFasil || null,
        diprosesOleh: currentUser.id,
        waktuKeputusan: new Date().toISOString(),
        fasil: { id: currentUser.id, name: currentUser.name },
      };
      saveMockDb(db);
      return { data: db.leaveRequests[index] };
    }
  }

  // ===== BUILDINGS =====
  if (cleanUrl === '/buildings' && method.toUpperCase() === 'GET') {
    return { data: db.buildings };
  }

  if (cleanUrl === '/buildings' && method.toUpperCase() === 'POST') {
    const newB: any = {
      id: 'gedung-' + Date.now(),
      nama: data.nama,
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      radiusPresensi: Number(data.radiusPresensi || 100),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { kamar: 0, users: 0 },
    };
    db.buildings.push(newB);
    saveMockDb(db);
    return { data: newB };
  }

  const buildingIdMatch = cleanUrl.match(/^\/buildings\/([^/]+)$/);
  if (buildingIdMatch && method.toUpperCase() === 'PATCH') {
    const id = buildingIdMatch[1];
    const idx = db.buildings.findIndex((b) => b.id === id);
    if (idx !== -1) {
      db.buildings[idx] = { ...db.buildings[idx], ...data, updatedAt: new Date().toISOString() };
      saveMockDb(db);
      return { data: db.buildings[idx] };
    }
  }

  const buildingStatusMatch = cleanUrl.match(/^\/buildings\/([^/]+)\/status$/);
  if (buildingStatusMatch && method.toUpperCase() === 'PATCH') {
    const id = buildingStatusMatch[1];
    const idx = db.buildings.findIndex((b) => b.id === id);
    if (idx !== -1) {
      db.buildings[idx].isActive = data.isActive;
      saveMockDb(db);
      return { data: db.buildings[idx] };
    }
  }

  // ===== ROOMS =====
  if (cleanUrl === '/rooms' && method.toUpperCase() === 'GET') {
    let list = [...db.rooms];
    if (params?.gedungId) {
      list = list.filter((r) => r.gedungId === params.gedungId);
    }
    return { data: { data: list, meta: { total: list.length, page: 1, limit: 100, totalPages: 1 } } };
  }

  if (cleanUrl === '/rooms' && method.toUpperCase() === 'POST') {
    const g = db.buildings.find((b) => b.id === data.gedungId);
    const newR: any = {
      id: 'kamar-' + Date.now(),
      nama: data.nama,
      nomorLantai: Number(data.nomorLantai),
      kapasitas: Number(data.kapasitas),
      gedungId: data.gedungId,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      gedung: g ? { id: g.id, nama: g.nama } : undefined,
      _count: { users: 0 },
    };
    db.rooms.push(newR);
    saveMockDb(db);
    return { data: newR };
  }

  const roomIdMatch = cleanUrl.match(/^\/rooms\/([^/]+)$/);
  if (roomIdMatch && method.toUpperCase() === 'PATCH') {
    const id = roomIdMatch[1];
    const idx = db.rooms.findIndex((r) => r.id === id);
    if (idx !== -1) {
      db.rooms[idx] = { ...db.rooms[idx], ...data, updatedAt: new Date().toISOString() };
      saveMockDb(db);
      return { data: db.rooms[idx] };
    }
  }

  const roomStatusMatch = cleanUrl.match(/^\/rooms\/([^/]+)\/status$/);
  if (roomStatusMatch && method.toUpperCase() === 'PATCH') {
    const id = roomStatusMatch[1];
    const idx = db.rooms.findIndex((r) => r.id === id);
    if (idx !== -1) {
      db.rooms[idx].isActive = data.isActive;
      saveMockDb(db);
      return { data: db.rooms[idx] };
    }
  }

  // ===== USERS =====
  if (cleanUrl === '/users' && method.toUpperCase() === 'GET') {
    const page = Number(params?.page || 1);
    const limit = Number(params?.limit || 10);
    let list = [...db.users];

    if (params?.role) {
      list = list.filter((u) => u.role === params.role);
    }
    if (params?.search) {
      const s = params.search.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          (u.nim && u.nim.toLowerCase().includes(s))
      );
    }

    const total = list.length;
    const paginated = list.slice((page - 1) * limit, page * limit);

    return {
      data: {
        data: paginated,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    };
  }

  if (cleanUrl === '/users' && method.toUpperCase() === 'POST') {
    const g = db.buildings.find((b) => b.id === data.gedungId);
    const k = db.rooms.find((r) => r.id === data.kamarId);

    const newUser: any = {
      id: 'user-' + Date.now(),
      name: data.name,
      email: data.email,
      nim: data.nim || null,
      asal: data.asal || null,
      jenisKelamin: data.jenisKelamin || null,
      role: data.role || 'PENGHUNI',
      isActive: true,
      mustChangePassword: false,
      gedungId: data.gedungId || null,
      kamarId: data.kamarId || null,
      gedung: g ? { id: g.id, nama: g.nama } : null,
      kamar: k ? { id: k.id, nama: k.nama, nomorLantai: k.nomorLantai } : null,
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    saveMockDb(db);
    return { data: newUser };
  }

  const userIdMatch = cleanUrl.match(/^\/users\/([^/]+)$/);
  if (userIdMatch && method.toUpperCase() === 'PATCH') {
    const id = userIdMatch[1];
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      const g = db.buildings.find((b) => b.id === data.gedungId);
      const k = db.rooms.find((r) => r.id === data.kamarId);
      db.users[idx] = {
        ...db.users[idx],
        ...data,
        gedung: g ? { id: g.id, nama: g.nama } : db.users[idx].gedung,
        kamar: k ? { id: k.id, nama: k.nama, nomorLantai: k.nomorLantai } : db.users[idx].kamar,
      };
      saveMockDb(db);
      return { data: db.users[idx] };
    }
  }

  // ===== SETTINGS =====
  if (cleanUrl === '/settings' && method.toUpperCase() === 'GET') {
    return { data: db.settings };
  }

  const settingIdMatch = cleanUrl.match(/^\/settings\/([^/]+)$/);
  if (settingIdMatch && method.toUpperCase() === 'PATCH') {
    const id = settingIdMatch[1];
    const idx = db.settings.findIndex((s) => s.id === id);
    if (idx !== -1) {
      db.settings[idx] = { ...db.settings[idx], ...data };
      saveMockDb(db);
      return { data: db.settings[idx] };
    }
  }

  // ===== AUDIT LOGS =====
  if (cleanUrl === '/audit-logs' && method.toUpperCase() === 'GET') {
    const page = Number(params?.page || 1);
    const limit = Number(params?.limit || 10);
    const total = db.auditLogs.length;
    const paginated = db.auditLogs.slice((page - 1) * limit, page * limit);
    return {
      data: {
        data: paginated,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
      },
    };
  }

  // Fallback default
  return { data: [] };
}
