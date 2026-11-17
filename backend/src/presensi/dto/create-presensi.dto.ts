// src/presensi/dto/create-presensi.dto.ts
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsLatitude, IsLongitude } from 'class-validator';
import { StatusPresensi } from '@prisma/client';

export class CreatePresensiDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsLatitude()
  lat: number;

  @IsLongitude()
  long: number;

  @IsEnum(StatusPresensi)
  status: StatusPresensi;

  @IsOptional()
  @IsString()
  keterangan?: string; // required for IZIN/SAKIT – validated in service
}

