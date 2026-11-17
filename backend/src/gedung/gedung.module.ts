// src/gedung/gedung.module.ts
import { Module } from '@nestjs/common';
import { GedungService } from './gedung.service';
import { GedungController } from './gedung.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PrismaModule, UsersModule],
  providers: [GedungService],
  controllers: [GedungController],
  exports: [GedungService],
})
export class GedungModule {}

