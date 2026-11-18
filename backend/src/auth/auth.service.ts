// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwt: JwtService) {}

  async validateUser(identifier: string, password: string) {
    const user = await this.usersService.findByIdentifier(identifier);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(dto: LoginDto) {
    const identifier = (dto.identifier || dto.email || '').trim();
    if (!identifier) {
      throw new UnauthorizedException('Email atau NIM wajib diisi');
    }
    const user = await this.validateUser(identifier, dto.password);
    if (!user) throw new UnauthorizedException('Kredensial tidak valid. Silakan periksa kembali email/NIM dan kata sandi Anda.');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwt.sign(payload);

    const kodeMap: Record<string, { kode: string; nama: string; kategori: 'PUTRA' | 'PUTRI' }> = {
      'gedung-a': { kode: 'A', nama: 'RPX', kategori: 'PUTRI' },
      'gedung-b': { kode: 'B', nama: 'Rusunawa', kategori: 'PUTRI' },
      'gedung-c': { kode: 'C', nama: 'PUPERA C (Putri)', kategori: 'PUTRI' },
      'gedung-d': { kode: 'D', nama: 'Menpera', kategori: 'PUTRI' },
      'gedung-e': { kode: 'E', nama: 'Roesma M. Sjaaf', kategori: 'PUTRI' },
      'gedung-f': { kode: 'F', nama: 'Orange', kategori: 'PUTRA' },
      'gedung-g': { kode: 'G', nama: 'Hijau', kategori: 'PUTRA' },
      'gedung-h': { kode: 'H', nama: 'PUPERA H (Putra)', kategori: 'PUTRA' },
    };

    const gedungInfo =
      user.kamar?.gedung_id && kodeMap[user.kamar.gedung_id]
        ? kodeMap[user.kamar.gedung_id]
        : user.jekel === 'PEREMPUAN'
        ? { kode: 'A', nama: 'RPX', kategori: 'PUTRI' as const }
        : { kode: 'G', nama: 'Hijau', kategori: 'PUTRA' as const };

    return {
      access_token: token,
      accessToken: token,
      refreshToken: token,
      user: {
        id: user.id,
        name: user.nama,
        email: user.email,
        nim: user.nim,
        asal: user.asal,
        role: user.role === 'PENGURUS' ? 'FASIL' : user.role,
        jenisKelamin: user.jekel,
        isActive: true,
        mustChangePassword: false,
        gedung: {
          id: user.kamar?.gedung_id || (gedungInfo.kode === 'A' ? 'gedung-a' : 'gedung-g'),
          nama: gedungInfo.nama,
          kode: gedungInfo.kode,
          kategori: gedungInfo.kategori,
        },
        kamar: user.kamar
          ? { id: user.kamar.no_kamar, nama: `Kamar ${user.kamar.no_kamar}`, nomorLantai: user.kamar.lantai }
          : { id: `kamar-${gedungInfo.kode.toLowerCase()}-101`, nama: `Kamar ${gedungInfo.kode}-101`, nomorLantai: 1 },
      },
    };
  }

  async getProfile(userId: string) {
    const user = (await this.usersService.findByIdentifier(userId)) || (await this.usersService.findOne(userId));
    const kodeMap: Record<string, { kode: string; nama: string; kategori: 'PUTRA' | 'PUTRI' }> = {
      'gedung-a': { kode: 'A', nama: 'RPX', kategori: 'PUTRI' },
      'gedung-b': { kode: 'B', nama: 'Rusunawa', kategori: 'PUTRI' },
      'gedung-c': { kode: 'C', nama: 'PUPERA C (Putri)', kategori: 'PUTRI' },
      'gedung-d': { kode: 'D', nama: 'Menpera', kategori: 'PUTRI' },
      'gedung-e': { kode: 'E', nama: 'Roesma M. Sjaaf', kategori: 'PUTRI' },
      'gedung-f': { kode: 'F', nama: 'Orange', kategori: 'PUTRA' },
      'gedung-g': { kode: 'G', nama: 'Hijau', kategori: 'PUTRA' },
      'gedung-h': { kode: 'H', nama: 'PUPERA H (Putra)', kategori: 'PUTRA' },
    };

    const gedungInfo =
      user.kamar?.gedung_id && kodeMap[user.kamar.gedung_id]
        ? kodeMap[user.kamar.gedung_id]
        : user.jekel === 'PEREMPUAN'
        ? { kode: 'A', nama: 'RPX', kategori: 'PUTRI' as const }
        : { kode: 'G', nama: 'Hijau', kategori: 'PUTRA' as const };

    return {
      id: user.id,
      name: user.nama,
      email: user.email,
      nim: user.nim,
      asal: user.asal,
      role: user.role === 'PENGURUS' ? 'FASIL' : user.role,
      jenisKelamin: user.jekel,
      isActive: true,
      mustChangePassword: false,
      gedung: {
        id: user.kamar?.gedung_id || (gedungInfo.kode === 'A' ? 'gedung-a' : 'gedung-g'),
        nama: gedungInfo.nama,
        kode: gedungInfo.kode,
        kategori: gedungInfo.kategori,
      },
      kamar: user.kamar
        ? { id: user.kamar.no_kamar, nama: `Kamar ${user.kamar.no_kamar}`, nomorLantai: user.kamar.lantai }
        : { id: `kamar-${gedungInfo.kode.toLowerCase()}-101`, nama: `Kamar ${gedungInfo.kode}-101`, nomorLantai: 1 },
    };
  }

  async register(dto: RegisterDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    const created = await this.usersService.create({ ...dto, password: hash } as any);
    const { password, ...result } = created;
    return result;
  }
}

