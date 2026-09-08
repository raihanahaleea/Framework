import { JenisKelamin, Role } from '@prisma/client';
export declare class CreateUserDto {
    nama: string;
    nim: string;
    asal: string;
    nomor_kamar?: string;
    jekel: JenisKelamin;
    email: string;
    password: string;
    role: Role;
}
