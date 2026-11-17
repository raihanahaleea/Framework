import { JenisKelamin, Role } from '@prisma/client';
export declare class RegisterDto {
    nama: string;
    nim: string;
    asal: string;
    nomor_kamar?: string;
    jekel: JenisKelamin;
    email: string;
    password: string;
    role?: Role;
}
