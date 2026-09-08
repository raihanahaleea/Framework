import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { JenisKelamin, Role } from '@prisma/client';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  nama: string;

  @IsNotEmpty()
  @IsString()
  nim: string;

  @IsNotEmpty()
  @IsString()
  asal: string;

  @IsOptional()
  @IsString()
  nomor_kamar?: string;

  @IsNotEmpty()
  @IsEnum(JenisKelamin)
  jekel: JenisKelamin;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
