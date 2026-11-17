// src/gedung/gedung.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGedungDto } from './dto/create-gedung.dto';
import { UpdateGedungDto } from './dto/update-gedung.dto';

@Injectable()
export class GedungService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateGedungDto) {
    return this.prisma.gedung.create({ data: dto as any });
  }

  async findAll(params?: { skip?: number; take?: number }) {
    return this.prisma.gedung.findMany(params);
  }

  async findOne(id: string) {
    const gedung = await this.prisma.gedung.findUnique({ where: { id } });
    if (!gedung) throw new NotFoundException('Gedung not found');
    return gedung;
  }

  async update(id: string, dto: UpdateGedungDto) {
    return this.prisma.gedung.update({ where: { id }, data: dto as any });
  }

  async remove(id: string) {
    return this.prisma.gedung.delete({ where: { id } });
  }
}

