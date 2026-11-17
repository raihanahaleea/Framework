// src/gedung/dto/create-gedung.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateGedungDto {
  @IsString()
  @IsNotEmpty()
  nama: string;

  // optional pengurus (user id) – must be a valid User id (UUID)
  @IsOptional()
  @IsString()
  id_user?: string;
}

