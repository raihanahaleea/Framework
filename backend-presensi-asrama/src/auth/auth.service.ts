import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Cek apakah email atau NIM sudah terdaftar
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { nim: dto.nim }],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email atau NIM sudah terdaftar');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Buat user baru
    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
    });

    // Generate JWT token
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      message: 'Registrasi berhasil',
      user: {
        id: user.id,
        nama: user.nama,
        nim: user.nim,
        email: user.email,
        role: user.role,
      },
      access_token: token,
    };
  }

  async login(dto: LoginDto) {
    // Cari user berdasarkan email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Generate JWT token
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      message: 'Login berhasil',
      user: {
        id: user.id,
        nama: user.nama,
        nim: user.nim,
        email: user.email,
        role: user.role,
      },
      access_token: token,
    };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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

    return user;
  }

  private generateToken(userId: number, email: string, role: string): string {
    const payload = { sub: userId, email, role };
    return this.jwtService.sign(payload);
  }
}
