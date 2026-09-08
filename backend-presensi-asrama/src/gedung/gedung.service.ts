import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGedungDto } from './dto/create-gedung.dto';

@Injectable()
export class GedungService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateGedungDto) {
    const gedung = await this.prisma.gedung.create({
      data: dto,
      include: {
        user: {
          select: { nama: true, nim: true },
        },
      },
    });

    return {
      message: 'Gedung berhasil ditambahkan',
      gedung,
    };
  }

  async findAll() {
    return this.prisma.gedung.findMany({
      include: {
        user: {
          select: { nama: true },
        },
        kamar: true,
      },
    });
  }

  async findOne(id: number) {
    const gedung = await this.prisma.gedung.findUnique({
      where: { id },
      include: {
        user: {
          select: { nama: true },
        },
        kamar: true,
      },
    });

    if (!gedung) {
      throw new NotFoundException('Gedung tidak ditemukan');
    }

    return gedung;
  }

  async update(id: number, dto: Partial<CreateGedungDto>) {
    await this.findOne(id);

    const gedung = await this.prisma.gedung.update({
      where: { id },
      data: dto,
      include: {
        user: {
          select: { nama: true },
        },
      },
    });

    return {
      message: 'Gedung berhasil diupdate',
      gedung,
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.gedung.delete({ where: { id } });
    return { message: 'Gedung berhasil dihapus' };
  }
}
