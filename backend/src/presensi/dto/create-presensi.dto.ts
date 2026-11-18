// src/presensi/dto/create-presensi.dto.ts
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { StatusPresensi } from '@prisma/client';

export class CreatePresensiDto {
  @IsOptional()
  @IsString()
  user_id?: string;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  lat?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  long?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  latitude?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  longitude?: number;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== null ? parseFloat(value) : undefined))
  accuracy?: number;

  @IsOptional()
  @IsEnum(StatusPresensi)
  status?: StatusPresensi;

  @IsOptional()
  @IsString()
  jenisPresensi?: string;

  @IsOptional()
  @IsString()
  jenis_presensi?: string;

  @IsOptional()
  @IsString()
  lokasi?: string;

  @IsOptional()
  @IsString()
  keterangan?: string; // required for IZIN/SAKIT – validated in service
}
