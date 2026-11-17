// src/kamar/kamar.controller.ts
import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { KamarService } from './kamar.service';
import { CreateKamarDto } from './dto/create-kamar.dto';
import { UpdateKamarDto } from './dto/update-kamar.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('kamar')
export class KamarController {
    constructor(private readonly kamarService: KamarService) { }

    @Post()
    @Roles(Role.ADMIN, Role.PENGURUS)
    create(@Body() dto: CreateKamarDto) {
        return this.kamarService.create(dto);
    }

    @Get()
    @Roles(Role.ADMIN, Role.PENGURUS, Role.PENGHUNI)
    findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
        const opts = {
            skip: skip ? Number(skip) : undefined,
            take: take ? Number(take) : undefined,
        };
        return this.kamarService.findAll(opts);
    }

    @Get(':no_kamar')
    @Roles(Role.ADMIN, Role.PENGURUS, Role.PENGHUNI)
    findOne(@Param('no_kamar') no_kamar: string) {
        return this.kamarService.findOne(no_kamar);
    }

    @Post(':no_kamar')
    @Roles(Role.ADMIN, Role.PENGURUS)
    update(@Param('no_kamar') no_kamar: string, @Body() dto: UpdateKamarDto) {
        return this.kamarService.update(no_kamar, dto);
    }

    @Post(':no_kamar/delete')
    @Roles(Role.ADMIN, Role.PENGURUS)
    remove(@Param('no_kamar') no_kamar: string) {
        return this.kamarService.remove(no_kamar);
    }
}