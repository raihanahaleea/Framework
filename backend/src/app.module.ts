// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GedungModule } from './gedung/gedung.module';
import { KamarModule } from './kamar/kamar.module';
import { PresensiModule } from './presensi/presensi.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ServeStaticModule.forRoot(
      {
        rootPath: join(__dirname, '..', 'uploads'),
        serveRoot: '/uploads',
      },
      {
        rootPath: join(__dirname, '..', '..', 'frontend'),
        serveRoot: '/',
      },
    ),
    PrismaModule,
    AuthModule,
    UsersModule,
    GedungModule,
    KamarModule,
    PresensiModule,
  ],
})
export class AppModule {}

