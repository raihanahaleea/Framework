import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePresensiDto } from './dto/create-presensi.dto';
import { StatusPresensi } from '@prisma/client';

@Injectable()
export class PresensiService {
  // Koordinat default asrama (bisa diubah sesuai lokasi asrama sebenarnya)
  private readonly ASRAMA_LAT = -6.2;
  private readonly ASRAMA_LONG = 106.8;
  private readonly RADIUS_METER = 100; // Toleransi 100 meter

  constructor(private prisma: PrismaService) {}

  async createPresensi(userId: number, dto: CreatePresensiDto) {
    const now = new Date();

    // Konversi ke WIB (UTC+7)
    const wibOffset = 7 * 60 * 60 * 1000;
    const wibTime = new Date(now.getTime() + wibOffset);
    const hours = wibTime.getUTCHours();
    const minutes = wibTime.getUTCMinutes();
    const timeInMinutes = hours * 60 + minutes;

    // Validasi waktu presensi
    const subuhStart = 4 * 60; // 04:00
    const subuhEnd = 6 * 60; // 06:00
    const malamStart = 18 * 60; // 18:00
    const malamEnd = 20 * 60 + 30; // 20:30

    const isSubuh = timeInMinutes >= subuhStart && timeInMinutes <= subuhEnd;
    const isMalam = timeInMinutes >= malamStart && timeInMinutes <= malamEnd;

    if (!isSubuh && !isMalam) {
      throw new BadRequestException(
        'Presensi hanya bisa dilakukan pada waktu Subuh (04:00-06:00) atau Malam (18:00-20:30) WIB',
      );
    }

    // Validasi lokasi - hitung jarak dari asrama
    const distance = this.calculateDistance(
      dto.lat,
      dto.long,
      this.ASRAMA_LAT,
      this.ASRAMA_LONG,
    );

    if (distance > this.RADIUS_METER) {
      throw new ForbiddenException(
        `Anda berada di luar area asrama. Jarak: ${Math.round(distance)} meter (maks ${this.RADIUS_METER} meter)`,
      );
    }

    // Cek apakah sudah presensi hari ini untuk sesi yang sama
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingPresensi = await this.prisma.presensi.findFirst({
      where: {
        user_id: userId,
        tanggal: today,
        waktu: {
          gte: isSubuh
            ? new Date(today.getTime() + subuhStart * 60 * 1000 - wibOffset)
            : new Date(today.getTime() + malamStart * 60 * 1000 - wibOffset),
          lte: isSubuh
            ? new Date(today.getTime() + subuhEnd * 60 * 1000 - wibOffset)
            : new Date(today.getTime() + malamEnd * 60 * 1000 - wibOffset),
        },
      },
    });

    if (existingPresensi) {
      throw new BadRequestException(
        `Anda sudah melakukan presensi ${isSubuh ? 'Subuh' : 'Malam'} hari ini`,
      );
    }

    // Tentukan status
    const status: StatusPresensi = StatusPresensi.HADIR;

    const sesi = isSubuh ? 'Subuh' : 'Malam';

    const presensi = await this.prisma.presensi.create({
      data: {
        waktu: now,
        lat: dto.lat,
        long: dto.long,
        status,
        foto_wajah: dto.foto_wajah || null,
        keterangan: dto.keterangan || `Presensi ${sesi}`,
        tanggal: today,
        user_id: userId,
      },
      include: {
        user: {
          select: { nama: true, nim: true },
        },
      },
    });

    return {
      message: `Presensi ${sesi} berhasil`,
      presensi,
    };
  }

  async getRiwayat(userId: number, startDate?: string, endDate?: string) {
    const where: any = { user_id: userId };

    if (startDate && endDate) {
      where.tanggal = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    return this.prisma.presensi.findMany({
      where,
      include: {
        user: {
          select: { nama: true, nim: true },
        },
      },
      orderBy: { waktu: 'desc' },
    });
  }

  async getRiwayatByUser(
    userId: number,
    startDate?: string,
    endDate?: string,
  ) {
    return this.getRiwayat(userId, startDate, endDate);
  }

  async getAllRiwayat(startDate?: string, endDate?: string) {
    const where: any = {};

    if (startDate && endDate) {
      where.tanggal = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    return this.prisma.presensi.findMany({
      where,
      include: {
        user: {
          select: { nama: true, nim: true, nomor_kamar: true },
        },
      },
      orderBy: { waktu: 'desc' },
    });
  }

  /**
   * Menghitung jarak antara dua titik koordinat menggunakan rumus Haversine
   * @returns jarak dalam meter
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371000; // Radius bumi dalam meter
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
