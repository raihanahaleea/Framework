import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    // Cek duplikasi email/NIM
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { nim: dto.nim }],
      },
    });

    if (existing) {
      throw new ConflictException('Email atau NIM sudah terdaftar');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
      select: {
        id: true,
        nama: true,
        nim: true,
        asal: true,
        nomor_kamar: true,
        jekel: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    return {
      message: 'User berhasil ditambahkan',
      user,
    };
  }

  async findAll(role?: string) {
    const where = role ? { role: role as any } : {};

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        nama: true,
        nim: true,
        asal: true,
        nomor_kamar: true,
        jekel: true,
        email: true,
        role: true,
        created_at: true,
      },
      orderBy: { nama: 'asc' },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nama: true,
        nim: true,
        asal: true,
        nomor_kamar: true,
        jekel: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id); // Pastikan user ada

    const data: any = { ...dto };

    // Hash password jika diupdate
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        nama: true,
        nim: true,
        asal: true,
        nomor_kamar: true,
        jekel: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    return {
      message: 'User berhasil diupdate',
      user,
    };
  }

  async remove(id: number) {
    await this.findOne(id); // Pastikan user ada

    await this.prisma.user.delete({ where: { id } });

    return { message: 'User berhasil dihapus' };
  }
}
