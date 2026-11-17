import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePresensiDto {
  @IsNotEmpty()
  @IsNumber()
  lat: number;

  @IsNotEmpty()
  @IsNumber()
  long: number;

  @IsOptional()
  @IsString()
  foto_wajah?: string;

  @IsOptional()
  @IsString()
  keterangan?: string;
}
