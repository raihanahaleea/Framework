// src/gedung/gedung.controller.ts
import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { GedungService } from './gedung.service';
import { CreateGedungDto } from './dto/create-gedung.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('gedung')
export class GedungController {
  constructor(private readonly gedungService: GedungService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PENGURUS)
  create(@Body() dto: CreateGedungDto) {
    return this.gedungService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.PENGURUS, Role.PENGHUNI)
  findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    const options = {
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
    };
    return this.gedungService.findAll(options);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.PENGURUS, Role.PENGHUNI)
  findOne(@Param('id') id: string) {
    return this.gedungService.findOne(id);
  }
}

