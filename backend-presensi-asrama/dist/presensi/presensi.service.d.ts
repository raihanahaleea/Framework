import { PrismaService } from '../prisma/prisma.service';
import { CreatePresensiDto } from './dto/create-presensi.dto';
export declare class PresensiService {
    private prisma;
    private readonly ASRAMA_LAT;
    private readonly ASRAMA_LONG;
    private readonly RADIUS_METER;
    constructor(prisma: PrismaService);
    createPresensi(userId: number, dto: CreatePresensiDto): Promise<{
        message: string;
        presensi: {
            user: {
                nama: string;
                nim: string;
            };
        } & {
            id: number;
            created_at: Date;
            lat: number;
            long: number;
            foto_wajah: string | null;
            keterangan: string | null;
            waktu: Date;
            status: import(".prisma/client").$Enums.StatusPresensi;
            tanggal: Date;
            user_id: number;
        };
    }>;
    getRiwayat(userId: number, startDate?: string, endDate?: string): Promise<({
        user: {
            nama: string;
            nim: string;
        };
    } & {
        id: number;
        created_at: Date;
        lat: number;
        long: number;
        foto_wajah: string | null;
        keterangan: string | null;
        waktu: Date;
        status: import(".prisma/client").$Enums.StatusPresensi;
        tanggal: Date;
        user_id: number;
    })[]>;
    getRiwayatByUser(userId: number, startDate?: string, endDate?: string): Promise<({
        user: {
            nama: string;
            nim: string;
        };
    } & {
        id: number;
        created_at: Date;
        lat: number;
        long: number;
        foto_wajah: string | null;
        keterangan: string | null;
        waktu: Date;
        status: import(".prisma/client").$Enums.StatusPresensi;
        tanggal: Date;
        user_id: number;
    })[]>;
    getAllRiwayat(startDate?: string, endDate?: string): Promise<({
        user: {
            nama: string;
            nim: string;
            nomor_kamar: string | null;
        };
    } & {
        id: number;
        created_at: Date;
        lat: number;
        long: number;
        foto_wajah: string | null;
        keterangan: string | null;
        waktu: Date;
        status: import(".prisma/client").$Enums.StatusPresensi;
        tanggal: Date;
        user_id: number;
    })[]>;
    private calculateDistance;
    private toRad;
}
