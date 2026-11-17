import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIzinDto } from './dto/create-izin.dto';
import { UpdateIzinStatusDto } from './dto/update-izin-status.dto';

@Injectable()
export class IzinService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    dto: CreateIzinDto,
    buktiFile?: Express.Multer.File,
  ) {
    const izin = await this.prisma.izin.create({
      data: {
        jenis_izin: dto.jenis_izin,
        keterangan: dto.keterangan,
        bukti: buktiFile ? `/uploads/bukti/${buktiFile.filename}` : null,
        tanggal_mulai: new Date(dto.tanggal_mulai),
        tanggal_selesai: new Date(dto.tanggal_selesai),
        user_id: userId,
      },
      include: {
        user: {
          select: { nama: true, nim: true },
        },
      },
    });

    return {
      message: 'Izin berhasil diajukan',
      izin,
    };
  }

  async findAll(userId?: number) {
    const where = userId ? { user_id: userId } : {};

    return this.prisma.izin.findMany({
      where,
      include: {
        user: {
          select: { nama: true, nim: true, nomor_kamar: true },
        },
        approver: {
          select: { nama: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    const izin = await this.prisma.izin.findUnique({
      where: { id },
      include: {
        user: {
          select: { nama: true, nim: true, nomor_kamar: true },
        },
        approver: {
          select: { nama: true },
        },
      },
    });

    if (!izin) {
      throw new NotFoundException('Izin tidak ditemukan');
    }

    return izin;
  }

  async updateStatus(
    id: number,
    fasilId: number,
    dto: UpdateIzinStatusDto,
  ) {
    await this.findOne(id); // Pastikan izin ada

    const izin = await this.prisma.izin.update({
      where: { id },
      data: {
        status: dto.status,
        approved_by: fasilId,
      },
      include: {
        user: {
          select: { nama: true, nim: true },
        },
        approver: {
          select: { nama: true },
        },
      },
    });

    return {
      message: `Izin berhasil di-${dto.status.toLowerCase()}`,
      izin,
    };
  }
}
