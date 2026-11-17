// src/kamar/dto/create-kamar.dto.ts
import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateKamarDto {
  @IsString()
  @IsNotEmpty()
  no_kamar: string; // e.g., "A-101"

  @IsInt()
  lantai: number;

  @IsString()
  @IsNotEmpty()
  gedung_id: string; // UUID of Gedung
}

