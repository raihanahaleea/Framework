// src/users/dto/create-user.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Jekel, Role } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  nama: string;

  @IsString()
  @IsNotEmpty()
  nim: string;

  @IsString()
  @IsNotEmpty()
  asal: string;

  @IsOptional()
  @IsString()
  nomor_kamar?: string;

  @IsEnum(Jekel)
  jekel: Jekel;

  @IsEmail()
  email: string;

  @IsString()
  password: string; // hashed by AuthService before persisting

  @IsEnum(Role)
  role: Role;
}

