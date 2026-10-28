import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GedungService } from './gedung.service';
import { CreateGedungDto } from './dto/create-gedung.dto';

@Controller('gedung')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class GedungController {
  constructor(private readonly gedungService: GedungService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateGedungDto) {
    return this.gedungService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.FASIL)
  findAll() {
    return this.gedungService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.FASIL)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gedungService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateGedungDto>,
  ) {
    return this.gedungService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gedungService.remove(id);
  }
}
