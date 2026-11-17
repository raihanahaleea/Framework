import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateIzinDto {
  @IsNotEmpty()
  @IsString()
  jenis_izin: string;

  @IsNotEmpty()
  @IsString()
  keterangan: string;

  @IsNotEmpty()
  @IsDateString()
  tanggal_mulai: string;

  @IsNotEmpty()
  @IsDateString()
  tanggal_selesai: string;
}
