import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKamarDto } from './dto/create-kamar.dto';

@Injectable()
export class KamarService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateKamarDto) {
    // Cek duplikasi no_kamar
    const existing = await this.prisma.kamar.findUnique({
      where: { no_kamar: dto.no_kamar },
    });

    if (existing) {
      throw new ConflictException(`Kamar ${dto.no_kamar} sudah terdaftar`);
    }

    // Cek apakah gedung ada
    const gedung = await this.prisma.gedung.findUnique({
      where: { id: dto.id_gedung },
    });

    if (!gedung) {
      throw new NotFoundException('Gedung tidak ditemukan');
    }

    const kamar = await this.prisma.kamar.create({
      data: dto,
      include: {
        gedung: {
          select: { nama: true },
        },
      },
    });

    return {
      message: 'Kamar berhasil ditambahkan',
      kamar,
    };
  }

  async findAll(id_gedung?: number) {
    const where = id_gedung ? { id_gedung } : {};

    return this.prisma.kamar.findMany({
      where,
      include: {
        gedung: {
          select: { nama: true },
        },
      },
      orderBy: { no_kamar: 'asc' },
    });
  }

  async findOne(no_kamar: string) {
    const kamar = await this.prisma.kamar.findUnique({
      where: { no_kamar },
      include: {
        gedung: {
          select: { nama: true },
        },
      },
    });

    if (!kamar) {
      throw new NotFoundException('Kamar tidak ditemukan');
    }

    return kamar;
  }

  async update(no_kamar: string, dto: Partial<CreateKamarDto>) {
    await this.findOne(no_kamar);

    // Jangan update no_kamar (PK)
    const { no_kamar: _, ...updateData } = dto;

    const kamar = await this.prisma.kamar.update({
      where: { no_kamar },
      data: updateData,
      include: {
        gedung: {
          select: { nama: true },
        },
      },
    });

    return {
      message: 'Kamar berhasil diupdate',
      kamar,
    };
  }

  async remove(no_kamar: string) {
    await this.findOne(no_kamar);
    await this.prisma.kamar.delete({ where: { no_kamar } });
    return { message: 'Kamar berhasil dihapus' };
  }
}
