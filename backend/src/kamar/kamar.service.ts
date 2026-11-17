// src/kamar/kamar.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKamarDto } from './dto/create-kamar.dto';
import { UpdateKamarDto } from './dto/update-kamar.dto';

@Injectable()
export class KamarService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateKamarDto) {
    return this.prisma.kamar.create({ data: dto as any });
  }

  async findAll(params?: { skip?: number; take?: number }) {
    return this.prisma.kamar.findMany(params);
  }

  async findOne(no_kamar: string) {
    const kamar = await this.prisma.kamar.findUnique({ where: { no_kamar } });
    if (!kamar) throw new NotFoundException('Kamar not found');
    return kamar;
  }

  async update(no_kamar: string, dto: UpdateKamarDto) {
    return this.prisma.kamar.update({ where: { no_kamar }, data: dto as any });
  }

  async remove(no_kamar: string) {
    return this.prisma.kamar.delete({ where: { no_kamar } });
  }
}

