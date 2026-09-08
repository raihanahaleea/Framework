import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PresensiService } from './presensi.service';
import { CreatePresensiDto } from './dto/create-presensi.dto';

@Controller('presensi')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PresensiController {
  constructor(private readonly presensiService: PresensiService) {}

  @Post()
  @Roles(Role.PENGHUNI)
  create(@Request() req: any, @Body() dto: CreatePresensiDto) {
    return this.presensiService.createPresensi(req.user.id, dto);
  }

  @Get('riwayat')
  @Roles(Role.PENGHUNI, Role.FASIL)
  getRiwayat(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Penghuni hanya bisa lihat riwayat sendiri
    if (req.user.role === Role.PENGHUNI) {
      return this.presensiService.getRiwayat(req.user.id, startDate, endDate);
    }
    // Fasil bisa lihat semua
    return this.presensiService.getAllRiwayat(startDate, endDate);
  }

  @Get('riwayat/:userId')
  @Roles(Role.FASIL, Role.ADMIN)
  getRiwayatByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.presensiService.getRiwayatByUser(userId, startDate, endDate);
  }
}
