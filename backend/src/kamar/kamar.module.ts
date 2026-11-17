// src/kamar/kamar.module.ts
import { Module } from '@nestjs/common';
import { KamarService } from './kamar.service';
import { KamarController } from './kamar.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [KamarService],
  controllers: [KamarController],
  exports: [KamarService],
})
export class KamarModule {}

