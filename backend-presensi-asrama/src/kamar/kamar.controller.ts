import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { KamarService } from './kamar.service';
import { CreateKamarDto } from './dto/create-kamar.dto';

@Controller('kamar')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class KamarController {
  constructor(private readonly kamarService: KamarService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateKamarDto) {
    return this.kamarService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.FASIL)
  findAll(@Query('id_gedung') id_gedung?: string) {
    return this.kamarService.findAll(
      id_gedung ? parseInt(id_gedung) : undefined,
    );
  }

  @Get(':no_kamar')
  @Roles(Role.ADMIN, Role.FASIL)
  findOne(@Param('no_kamar') no_kamar: string) {
    return this.kamarService.findOne(no_kamar);
  }

  @Patch(':no_kamar')
  @Roles(Role.ADMIN)
  update(
    @Param('no_kamar') no_kamar: string,
    @Body() dto: Partial<CreateKamarDto>,
  ) {
    return this.kamarService.update(no_kamar, dto);
  }

  @Delete(':no_kamar')
  @Roles(Role.ADMIN)
  remove(@Param('no_kamar') no_kamar: string) {
    return this.kamarService.remove(no_kamar);
  }
}
