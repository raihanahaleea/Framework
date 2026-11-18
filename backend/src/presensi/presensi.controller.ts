// src/presensi/presensi.controller.ts
import {
  Controller,
  Post,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Query,
  Param,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname, join } from 'path';
import * as fs from 'fs';
import { PresensiService } from './presensi.service';
import { CreatePresensiDto } from './dto/create-presensi.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(['presensi', 'attendance'])
export class PresensiController {
  constructor(private readonly presensiService: PresensiService) {}

  @Post(['', 'check-in'])
  @Roles(Role.PENGHUNI)
  @UseInterceptors(
    FileInterceptor('foto_wajah', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = process.env.UPLOAD_DIR || 'uploads/presensi';
          const fullPath = join(process.cwd(), uploadPath);
          if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
          }
          cb(null, fullPath);
        },
        filename: (_, file, cb) => {
          const unique = `${Date.now()}-${uuidv4()}${extname(file.originalname || '.jpg')}`;
          cb(null, unique);
        },
      }),
      fileFilter: (_, file, cb) => {
        if (!file.mimetype.match(/image\/(jpeg|png|webp|jpg)/)) {
          return cb(new BadRequestException('Hanya file foto gambar (JPEG/PNG/WEBP) yang diperbolehkan'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreatePresensiDto,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Foto selfie bukti presensi wajah wajib diunggah');
    }
    const fotoPath = `/uploads/presensi/${file.filename}`;
    const authUserId = req.user?.sub || req.user?.id;
    const result = await this.presensiService.create(dto, fotoPath, authUserId);
    const jenis = (dto.jenisPresensi || dto.jenis_presensi || 'HADIR').toUpperCase();
    return {
      message: `Presensi ${jenis} berhasil diverifikasi!`,
      presensi: result,
      data: result,
    };
  }

  @Get('config')
  @Roles(Role.PENGHUNI, Role.PENGURUS, Role.ADMIN)
  getConfig() {
    return this.presensiService.getConfig();
  }

  @Get('today')
  @Roles(Role.PENGHUNI, Role.PENGURUS, Role.ADMIN)
  async getToday(@Req() req: any) {
    const authUserId = req.user?.sub || req.user?.id;
    return this.presensiService.getToday(authUserId);
  }

  @Get('me')
  @Roles(Role.PENGHUNI)
  async getMyPresensi(@Req() req: any, @Query() query: any) {
    const authUserId = req.user?.sub || req.user?.id;
    return this.presensiService.findMyPresensi(authUserId, query);
  }

  @Get()
  @Roles(Role.ADMIN, Role.PENGURUS)
  async findAll(@Query() query: any) {
    return this.presensiService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.PENGURUS, Role.PENGHUNI)
  async findOne(@Param('id') id: string) {
    return this.presensiService.findOne(id);
  }
}
