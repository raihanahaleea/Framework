import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, StorageEngine } from 'multer';
import { extname } from 'path';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { IzinService } from './izin.service';
import { CreateIzinDto } from './dto/create-izin.dto';
import { UpdateIzinStatusDto } from './dto/update-izin-status.dto';

const buktiStorage: StorageEngine = diskStorage({
  destination: './uploads/bukti',
  filename: (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `bukti-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('izin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class IzinController {
  constructor(private readonly izinService: IzinService) {}

  @Post()
  @Roles(Role.PENGHUNI)
  @UseInterceptors(
    FileInterceptor('bukti', {
      storage: buktiStorage,
      fileFilter: (
        _req: Express.Request,
        file: Express.Multer.File,
        cb: (error: Error | null, acceptFile: boolean) => void,
      ) => {
        // Hanya terima JPG, JPEG, PNG, PDF
        const allowedMimes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'application/pdf',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('File harus berformat JPG, PNG, atau PDF'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  create(
    @Request() req: any,
    @Body() dto: CreateIzinDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.izinService.create(req.user.id, dto, file);
  }

  @Get()
  @Roles(Role.PENGHUNI, Role.FASIL, Role.ADMIN)
  findAll(@Request() req: any) {
    // Penghuni hanya lihat izin sendiri
    if (req.user.role === Role.PENGHUNI) {
      return this.izinService.findAll(req.user.id);
    }
    // Fasil & Admin lihat semua
    return this.izinService.findAll();
  }

  @Get(':id')
  @Roles(Role.PENGHUNI, Role.FASIL, Role.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.izinService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(Role.FASIL)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() dto: UpdateIzinStatusDto,
  ) {
    return this.izinService.updateStatus(id, req.user.id, dto);
  }
}
