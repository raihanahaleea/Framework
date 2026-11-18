// src/presensi/presensi.service.ts
import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CreatePresensiDto } from './dto/create-presensi.dto';
import { Presensi, StatusPresensi } from '@prisma/client';
import { GeolocationHelper } from './helpers/geolocation.helper';

@Injectable()
export class PresensiService {
  private readonly logger = new Logger(PresensiService.name);

  constructor(private prisma: PrismaService, private config: ConfigService) {}

  // ===================== KONFIGURASI KOORDINAT & RADIUS =====================

  // 1. Presensi Malam (Asrama Universitas Andalas)
  getAsramaLat(): number {
    const raw = this.config.get('ASRAMA_LAT') ?? process.env.ASRAMA_LAT;
    return raw !== undefined && raw !== null && raw !== '' ? Number(raw) : -0.9169337875669057;
  }

  getAsramaLong(): number {
    const raw = this.config.get('ASRAMA_LONG') ?? process.env.ASRAMA_LONG;
    return raw !== undefined && raw !== null && raw !== '' ? Number(raw) : 100.45326630992055;
  }

  getAsramaRadius(): number {
    const raw = this.config.get('ASRAMA_MAX_RADIUS_METERS') ?? process.env.ASRAMA_MAX_RADIUS_METERS;
    return raw !== undefined && raw !== null && raw !== '' ? Number(raw) : 200;
  }

  // 2. Presensi Subuh (Masjid Nurul Ilmi Universitas Andalas - MNI)
  getMniLat(): number {
    const raw = this.config.get('MNI_LAT') ?? process.env.MNI_LAT;
    return raw !== undefined && raw !== null && raw !== '' ? Number(raw) : -0.9171644577225563;
  }

  getMniLong(): number {
    const raw = this.config.get('MNI_LONG') ?? process.env.MNI_LONG;
    return raw !== undefined && raw !== null && raw !== '' ? Number(raw) : 100.45761395254097;
  }

  getMniRadius(): number {
    const raw = this.config.get('MNI_MAX_RADIUS_METERS') ?? process.env.MNI_MAX_RADIUS_METERS;
    return raw !== undefined && raw !== null && raw !== '' ? Number(raw) : 100;
  }

  // Toleransi Akurasi GPS
  getMaxAccuracy(): number {
    const raw = this.config.get('ASRAMA_MAX_ACCURACY_METERS') ?? process.env.ASRAMA_MAX_ACCURACY_METERS;
    return raw !== undefined && raw !== null && raw !== '' ? Number(raw) : 50;
  }

  // ===================== WAKTU & JADWAL WIB (ASIA/JAKARTA) =====================

  getWIBDate(date: Date = new Date()): Date {
    const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
    return new Date(utcMs + 7 * 3600000);
  }

  getWIBTimeDetails(date: Date = new Date()) {
    const wib = this.getWIBDate(date);
    const hours = wib.getHours();
    const minutes = wib.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timeStr = `${pad(hours)}:${pad(minutes)} WIB`;
    const dateStr = `${wib.getFullYear()}-${pad(wib.getMonth() + 1)}-${pad(wib.getDate())}`;
    return { hours, minutes, totalMinutes, timeStr, dateStr, wibDate: wib };
  }

  getActiveSession(date: Date = new Date()): 'SUBUH' | 'MALAM' | null {
    const { totalMinutes } = this.getWIBTimeDetails(date);
    // Subuh: 04:30 (270) s/d 07:00 (420)
    if (totalMinutes >= 270 && totalMinutes <= 420) return 'SUBUH';
    // Malam: 21:00 (1260) s/d 23:00 (1380)
    if (totalMinutes >= 1260 && totalMinutes <= 1380) return 'MALAM';
    return null;
  }

  getConfig() {
    const now = new Date();
    const { timeStr, dateStr } = this.getWIBTimeDetails(now);
    const activeSession = this.getActiveSession(now);

    const subuhConfig = {
      jenisPresensi: 'SUBUH',
      nama: 'Presensi Subuh',
      lokasiNama: 'Masjid Nurul Ilmi Universitas Andalas',
      centerLat: this.getMniLat(),
      centerLong: this.getMniLong(),
      maxRadiusMeters: this.getMniRadius(),
      jamMulai: '04:30',
      jamSelesai: '07:00',
      jadwalStr: '04.30–07.00 WIB',
    };

    const malamConfig = {
      jenisPresensi: 'MALAM',
      nama: 'Presensi Malam',
      lokasiNama: 'Asrama Universitas Andalas',
      centerLat: this.getAsramaLat(),
      centerLong: this.getAsramaLong(),
      maxRadiusMeters: this.getAsramaRadius(),
      jamMulai: '21:00',
      jamSelesai: '23:00',
      jadwalStr: '21.00–23.00 WIB',
    };

    return {
      // Legacy flat fields for backward compatibility
      centerLat: this.getAsramaLat(),
      centerLong: this.getAsramaLong(),
      maxRadiusMeters: this.getAsramaRadius(),
      maxAccuracyMeters: this.getMaxAccuracy(),
      lokasiNama: 'Kompleks Asrama Mahasiswa Universitas Andalas',
      // Multi-session configuration
      subuh: subuhConfig,
      malam: malamConfig,
      sessions: [subuhConfig, malamConfig],
      activeSession,
      serverTimeWIB: timeStr,
      serverDateWIB: dateStr,
    };
  }

  // ===================== PROSES PENGAJUAN / PENGAMBILAN PRESENSI =====================

  async create(dto: CreatePresensiDto, fotoPath: string, authUserId?: string): Promise<Presensi> {
    const userId = dto.user_id || authUserId;
    if (!userId) {
      throw new BadRequestException('Identitas penghuni (user_id) diperlukan');
    }

    const userLat = Number(dto.lat ?? dto.latitude);
    const userLong = Number(dto.long ?? dto.longitude);
    const accuracy =
      dto.accuracy !== undefined && dto.accuracy !== null && !isNaN(Number(dto.accuracy))
        ? Number(dto.accuracy)
        : null;

    if (isNaN(userLat) || isNaN(userLong)) {
      throw new BadRequestException('Koordinat latitude dan longitude tidak valid');
    }

    const now = new Date();
    const { totalMinutes, timeStr, dateStr } = this.getWIBTimeDetails(now);

    // 1. Tentukan Jenis Presensi (SUBUH / MALAM)
    const rawJenis = (dto.jenisPresensi || dto.jenis_presensi || '').toUpperCase();
    let jenis: 'SUBUH' | 'MALAM';

    if (rawJenis === 'SUBUH' || rawJenis === 'MALAM') {
      jenis = rawJenis;
    } else {
      const detected = this.getActiveSession(now);
      if (detected) {
        jenis = detected;
      } else {
        throw new BadRequestException(
          `Saat ini di luar jadwal presensi resmi (Waktu server: ${timeStr}). Jadwal Subuh: 04.30–07.00 WIB, Jadwal Malam: 21.00–23.00 WIB.`,
        );
      }
    }

    const status = dto.status || StatusPresensi.HADIR;

    // 2. Validasi Jadwal Presensi (WIB) untuk status HADIR
    if (status === StatusPresensi.HADIR) {
      if (jenis === 'SUBUH') {
        if (totalMinutes < 270 || totalMinutes > 420) {
          throw new BadRequestException(
            `Presensi Subuh hanya dapat dilakukan pada jadwal pukul 04.30–07.00 WIB (Waktu server saat ini: ${timeStr}).`,
          );
        }
      } else if (jenis === 'MALAM') {
        if (totalMinutes < 1260 || totalMinutes > 1380) {
          throw new BadRequestException(
            `Presensi Malam hanya dapat dilakukan pada jadwal pukul 21.00–23.00 WIB (Waktu server saat ini: ${timeStr}).`,
          );
        }
      }
    }

    // 3. Tentukan Koordinat Pusat, Radius, dan Nama Lokasi sesuai Jenis Presensi
    let targetLat: number;
    let targetLong: number;
    let targetRadius: number;
    let targetLokasi: string;

    if (jenis === 'SUBUH') {
      targetLat = this.getMniLat();
      targetLong = this.getMniLong();
      targetRadius = this.getMniRadius(); // 100 m
      targetLokasi = 'Masjid Nurul Ilmi Universitas Andalas';
    } else {
      targetLat = this.getAsramaLat();
      targetLong = this.getAsramaLong();
      targetRadius = this.getAsramaRadius(); // 200 m
      targetLokasi = 'Asrama Universitas Andalas';
    }

    const maxAccuracy = this.getMaxAccuracy();

    // 4. Hitung Jarak Geodesik dengan Rumus Haversine
    const distance = GeolocationHelper.distanceMeters(
      userLat,
      userLong,
      targetLat,
      targetLong,
    );

    // Logging terstruktur untuk auditing & monitoring
    this.logger.log(`==================== [VALIDASI PRESENSI ${jenis}] ====================`);
    this.logger.log(`Waktu Server (WIB) : ${timeStr} | Tanggal: ${dateStr}`);
    this.logger.log(`Penghuni / User ID : ${userId}`);
    this.logger.log(`Sesi Presensi      : ${jenis} (${targetLokasi})`);
    this.logger.log(`Koordinat Perangkat: Lat = ${userLat.toFixed(6)}, Long = ${userLong.toFixed(6)}`);
    this.logger.log(`Akurasi Sinyal GPS : ${accuracy !== null ? accuracy.toFixed(1) + ' meter' : 'Tidak terdeteksi'}`);
    this.logger.log(`Titik Pusat Lokasi : Lat = ${targetLat.toFixed(6)}, Long = ${targetLong.toFixed(6)}`);
    this.logger.log(`Batas Maks Radius  : ${targetRadius} meter (Toleransi Akurasi: ${maxAccuracy} meter)`);
    this.logger.log(`Jarak Terhitung    : ${distance.toFixed(2)} meter`);
    this.logger.log(`Status Validasi    : ${distance <= targetRadius ? 'VALID (DALAM RADIUS)' : 'DITOLAK (LUAR RADIUS)'}`);
    this.logger.log(`========================================================================`);

    // 5. Validasi Akurasi GPS
    if (status === StatusPresensi.HADIR && accuracy !== null && accuracy > maxAccuracy) {
      this.logger.warn(`[Presensi Ditolak] Akurasi GPS perangkat terlalu rendah: ${accuracy.toFixed(1)} m > toleransi ${maxAccuracy} m`);
      throw new BadRequestException(
        `Akurasi sinyal GPS perangkat Anda terlalu rendah (±${Math.round(accuracy)} meter, toleransi maksimal: ${maxAccuracy} meter). Silakan perbarui lokasi GPS Anda di ruang terbuka.`,
      );
    }

    // 6. Validasi Geofencing Radius
    if (status === StatusPresensi.HADIR && distance > targetRadius) {
      this.logger.warn(`[Presensi Ditolak] Lokasi di luar radius ${targetLokasi}: ${distance.toFixed(2)} m > ${targetRadius} m`);
      throw new BadRequestException(
        `Presensi ${jenis} ditolak! Anda berada di luar radius ${targetLokasi} (jarak: ${Math.round(distance)} meter, batas maksimal: ${targetRadius} meter).`,
      );
    }

    // 7. Validasi Keterangan untuk IZIN / SAKIT
    if (
      (status === StatusPresensi.IZIN || status === StatusPresensi.SAKIT) &&
      (!dto.keterangan || dto.keterangan.trim() === '')
    ) {
      throw new BadRequestException('Keterangan wajib diisi untuk status IZIN atau SAKIT');
    }

    // 8. Pencegahan Presensi Ganda pada Sesi yang Sama di Hari yang Sama (WIB)
    const wibDate = this.getWIBDate(now);
    const todayStart = new Date(Date.UTC(wibDate.getFullYear(), wibDate.getMonth(), wibDate.getDate(), 0, 0, 0));
    const todayEnd = new Date(Date.UTC(wibDate.getFullYear(), wibDate.getMonth(), wibDate.getDate(), 23, 59, 59, 999));

    if (status === StatusPresensi.HADIR) {
      const existing = await this.prisma.presensi.findFirst({
        where: {
          user_id: userId,
          status: StatusPresensi.HADIR,
          waktu: { gte: todayStart, lte: todayEnd },
          keterangan: { contains: `[${jenis}]` },
        },
      });
      if (existing) {
        throw new BadRequestException(
          `Presensi HADIR sesi ${jenis === 'SUBUH' ? 'Subuh (Masjid Nurul Ilmi)' : 'Malam (Asrama)'} sudah dilakukan hari ini.`,
        );
      }
    }

    const sessionTag = `[${jenis}]`;
    const lokasiTag = `[Lokasi: ${targetLokasi}]`;
    const fullKeterangan = [sessionTag, lokasiTag, dto.keterangan].filter(Boolean).join(' ').trim();

    return this.prisma.presensi.create({
      data: {
        user_id: userId,
        tanggal: todayStart,
        waktu: now,
        lat: userLat,
        long: userLong,
        jarak_meter: Math.round(distance),
        status,
        foto_wajah: fotoPath,
        keterangan: fullKeterangan,
      },
    });
  }

  // ===================== DATA PRESENSI HARI INI & RIWAYAT =====================

  async getToday(userId: string) {
    const now = new Date();
    const { timeStr, dateStr } = this.getWIBTimeDetails(now);
    const activeSession = this.getActiveSession(now);

    const wibDate = this.getWIBDate(now);
    const todayStart = new Date(Date.UTC(wibDate.getFullYear(), wibDate.getMonth(), wibDate.getDate(), 0, 0, 0));
    const todayEnd = new Date(Date.UTC(wibDate.getFullYear(), wibDate.getMonth(), wibDate.getDate(), 23, 59, 59, 999));

    const records = await this.prisma.presensi.findMany({
      where: {
        user_id: userId,
        waktu: { gte: todayStart, lte: todayEnd },
      },
      orderBy: { waktu: 'desc' },
    });

    const subuhRaw = records.find((r) => r.keterangan?.includes('[SUBUH]')) || null;
    const malamRaw = records.find((r) => r.keterangan?.includes('[MALAM]')) || null;

    const formatItem = (item: any) => {
      if (!item) return null;
      const isMalam = item.keterangan?.includes('[MALAM]');
      return {
        ...item,
        latitude: item.lat,
        longitude: item.long,
        jarakMeter: item.jarak_meter,
        fotoWajah: item.foto_wajah,
        jenisPresensi: isMalam ? 'MALAM' : 'SUBUH',
        jenis_presensi: isMalam ? 'MALAM' : 'SUBUH',
        lokasi: isMalam ? 'Asrama Universitas Andalas' : 'Masjid Nurul Ilmi Universitas Andalas',
        tanggalPresensi: item.tanggal ? item.tanggal.toISOString().split('T')[0] : dateStr,
      };
    };

    return {
      subuh: formatItem(subuhRaw),
      malam: formatItem(malamRaw),
      tanggal: dateStr,
      totalToday: records.length,
      activeSession,
      serverTimeWIB: timeStr,
      sessions: [
        {
          jenisPresensi: 'SUBUH',
          nama: 'Presensi Subuh',
          lokasiNama: 'Masjid Nurul Ilmi Universitas Andalas',
          jamMulai: '04:30',
          jamSelesai: '07:00',
          radius: this.getMniRadius(),
          isDone: !!subuhRaw,
        },
        {
          jenisPresensi: 'MALAM',
          nama: 'Presensi Malam',
          lokasiNama: 'Asrama Universitas Andalas',
          jamMulai: '21:00',
          jamSelesai: '23:00',
          radius: this.getAsramaRadius(),
          isDone: !!malamRaw,
        },
      ],
    };
  }

  async findMyPresensi(userId: string, query?: any) {
    const page = Number(query?.page || 1);
    const limit = Number(query?.limit || 10);
    const skip = (page - 1) * limit;

    const where: any = { user_id: userId };
    if (query?.jenisPresensi) {
      where.keterangan = { contains: `[${query.jenisPresensi.toUpperCase()}]` };
    }
    if (query?.status) {
      where.status = query.status;
    }
    if (query?.tanggalMulai) {
      where.tanggal = { ...where.tanggal, gte: new Date(query.tanggalMulai) };
    }
    if (query?.tanggalSelesai) {
      where.tanggal = { ...where.tanggal, lte: new Date(query.tanggalSelesai) };
    }

    const [total, data] = await Promise.all([
      this.prisma.presensi.count({ where }),
      this.prisma.presensi.findMany({
        where,
        skip,
        take: limit,
        orderBy: { waktu: 'desc' },
      }),
    ]);

    const formatted = data.map((d) => {
      const isMalam = d.keterangan?.includes('[MALAM]');
      const isSubuh = d.keterangan?.includes('[SUBUH]');
      const jenisPresensi = isMalam ? 'MALAM' : isSubuh ? 'SUBUH' : 'MALAM';
      const lokasi = isSubuh ? 'Masjid Nurul Ilmi Universitas Andalas' : 'Asrama Universitas Andalas';
      return {
        ...d,
        latitude: d.lat,
        longitude: d.long,
        jarakMeter: d.jarak_meter,
        fotoWajah: d.foto_wajah,
        jenisPresensi,
        jenis_presensi: jenisPresensi,
        lokasi,
        tanggalPresensi: d.tanggal.toISOString().split('T')[0],
      };
    });

    return {
      data: formatted,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findAll(query?: any) {
    const page = Number(query?.page || 1);
    const limit = Number(query?.limit || 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query?.status) {
      where.status = query.status;
    }
    if (query?.jenisPresensi) {
      where.keterangan = { contains: `[${query.jenisPresensi.toUpperCase()}]` };
    }

    const [total, list] = await Promise.all([
      this.prisma.presensi.count({ where }),
      this.prisma.presensi.findMany({
        where,
        skip,
        take: limit,
        include: { user: { include: { kamar: { include: { gedung: true } } } } },
        orderBy: { waktu: 'desc' },
      }),
    ]);

    const formatted = list.map((d: any) => {
      const isMalam = d.keterangan?.includes('[MALAM]');
      const isSubuh = d.keterangan?.includes('[SUBUH]');
      const jenisPresensi = isMalam ? 'MALAM' : isSubuh ? 'SUBUH' : 'MALAM';
      const lokasi = isSubuh ? 'Masjid Nurul Ilmi Universitas Andalas' : 'Asrama Universitas Andalas';
      return {
        ...d,
        latitude: d.lat,
        longitude: d.long,
        jarakMeter: d.jarak_meter,
        fotoWajah: d.foto_wajah,
        jenisPresensi,
        jenis_presensi: jenisPresensi,
        lokasi,
        tanggalPresensi: d.tanggal.toISOString().split('T')[0],
        user: {
          id: d.user?.id,
          name: d.user?.nama,
          nim: d.user?.nim,
          gedung: d.user?.kamar?.gedung ? { nama: d.user.kamar.gedung.nama } : null,
          kamar: d.user?.kamar ? { nama: d.user.kamar.no_kamar } : null,
        },
      };
    });

    return {
      data: formatted,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string) {
    const presensi = await this.prisma.presensi.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!presensi) throw new NotFoundException('Presensi not found');
    const isMalam = presensi.keterangan?.includes('[MALAM]');
    const isSubuh = presensi.keterangan?.includes('[SUBUH]');
    const jenisPresensi = isMalam ? 'MALAM' : isSubuh ? 'SUBUH' : 'MALAM';
    const lokasi = isSubuh ? 'Masjid Nurul Ilmi Universitas Andalas' : 'Asrama Universitas Andalas';
    return {
      ...presensi,
      latitude: presensi.lat,
      longitude: presensi.long,
      jarakMeter: presensi.jarak_meter,
      fotoWajah: presensi.foto_wajah,
      jenisPresensi,
      jenis_presensi: jenisPresensi,
      lokasi,
      tanggalPresensi: presensi.tanggal.toISOString().split('T')[0],
    };
  }
}
