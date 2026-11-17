import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateKamarDto {
  @IsNotEmpty()
  @IsString()
  no_kamar: string;

  @IsNotEmpty()
  @IsNumber()
  lantai: number;

  @IsNotEmpty()
  @IsNumber()
  id_gedung: number;
}
