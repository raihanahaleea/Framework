import { Module } from '@nestjs/common';
import { KamarController } from './kamar.controller';
import { KamarService } from './kamar.service';

@Module({
  controllers: [KamarController],
  providers: [KamarService],
})
export class KamarModule {}
