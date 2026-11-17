// src/presensi/presensi.controller.ts
import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname, join } from 'path';
import { PresensiService } from './presensi.service';
import { CreatePresensiDto } from './dto/create-presensi.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('presensi')
export class PresensiController {
  constructor(private readonly presensiService: PresensiService) {}

  @Post()
  @Roles(Role.PENGHUNI)
  @UseInterceptors(
    FileInterceptor('foto_wajah', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = process.env.UPLOAD_DIR || 'uploads/presensi';
          cb(null, join(process.cwd(), uploadPath));
        },
        filename: (_, file, cb) => {
          const unique = `${Date.now()}-${uuidv4()}${extname(file.originalname)}`;
          cb(null, unique);
        },
      }),
      fileFilter: (_, file, cb) => {
        if (!file.mimetype.match(/image\/(jpeg|png|webp|jpg)/)) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  )
  async create(@UploadedFile() file: Express.Multer.File, @Body() dto: CreatePresensiDto) {
    if (!file) throw new BadRequestException('Foto wajah diperlukan');
    const fotoPath = `/uploads/${file.filename}`; // served statically
    return this.presensiService.create(dto, fotoPath);
  }
}

