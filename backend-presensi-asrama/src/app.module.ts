import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PresensiModule } from './presensi/presensi.module';
import { IzinModule } from './izin/izin.module';
import { GedungModule } from './gedung/gedung.module';
import { KamarModule } from './kamar/kamar.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    PresensiModule,
    IzinModule,
    GedungModule,
    KamarModule,
  ],
})
export class AppModule {}
