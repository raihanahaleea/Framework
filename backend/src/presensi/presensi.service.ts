// src/presensi/presensi.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CreatePresensiDto } from './dto/create-presensi.dto';
import { Presensi, StatusPresensi } from '@prisma/client';
import { GeolocationHelper } from './helpers/geolocation.helper';

@Injectable()
export class PresensiService {
  private readonly centerLat: number;
  private readonly centerLong: number;
  private readonly maxRadius: number;

  constructor(private prisma: PrismaService, private config: ConfigService) {
    this.centerLat = Number(this.config.get('ASRAMA_LAT'));
    this.centerLong = Number(this.config.get('ASRAMA_LONG'));
    this.maxRadius = Number(this.config.get('ASRAMA_MAX_RADIUS_METERS'));
  }

  async create(dto: CreatePresensiDto, fotoPath: string): Promise<Presensi> {
    const distance = GeolocationHelper.distanceMeters(
      dto.lat,
      dto.long,
      this.centerLat,
      this.centerLong,
    );

    // Rule: HADIR must be within radius
    if (dto.status === StatusPresensi.HADIR && distance > this.maxRadius) {
      throw new BadRequestException(
        `Anda berada di luar area Asrama Unand (jarak: ${distance.toFixed(2)} m). Maksimal ${this.maxRadius} m.`,
      );
    }

    // Rule: IZIN / SAKIT require keterangan
    if (
      (dto.status === StatusPresensi.IZIN || dto.status === StatusPresensi.SAKIT) &&
      (!dto.keterangan || dto.keterangan.trim() === '')
    ) {
      throw new BadRequestException('Keterangan wajib diisi untuk status IZIN atau SAKIT');
    }

    // Prevent duplicate HADIR per day
    if (dto.status === StatusPresensi.HADIR) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const existing = await this.prisma.presensi.findFirst({
        where: {
          user_id: dto.user_id,
          status: StatusPresensi.HADIR,
          tanggal: { gte: todayStart },
        },
      });
      if (existing) {
        throw new BadRequestException('Presensi HADIR sudah dilakukan hari ini');
      }
    }

    const now = new Date();
    return this.prisma.presensi.create({
      data: {
        user_id: dto.user_id,
        tanggal: now,
        waktu: now,
        lat: dto.lat,
        long: dto.long,
        jarak_meter: distance,
        status: dto.status,
        foto_wajah: fotoPath,
        keterangan: dto.keterangan,
      },
    });
  }

  async findAll() {
    return this.prisma.presensi.findMany({ include: { user: true } });
  }

  async findOne(id: string) {
    const presensi = await this.prisma.presensi.findUnique({ where: { id } });
    if (!presensi) throw new NotFoundException('Presensi not found');
    return presensi;
  }
}

