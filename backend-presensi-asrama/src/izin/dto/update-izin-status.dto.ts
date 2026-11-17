import { IsEnum, IsNotEmpty } from 'class-validator';
import { StatusIzin } from '@prisma/client';

export class UpdateIzinStatusDto {
  @IsNotEmpty()
  @IsEnum(StatusIzin)
  status: StatusIzin;
}
