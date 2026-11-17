import { PresensiService } from './presensi.service';
import { CreatePresensiDto } from './dto/create-presensi.dto';
export declare class PresensiController {
    private readonly presensiService;
    constructor(presensiService: PresensiService);
    create(req: any, dto: CreatePresensiDto): Promise<{
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
    getRiwayat(req: any, startDate?: string, endDate?: string): Promise<({
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
}
