import { IzinService } from './izin.service';
import { CreateIzinDto } from './dto/create-izin.dto';
import { UpdateIzinStatusDto } from './dto/update-izin-status.dto';
export declare class IzinController {
    private readonly izinService;
    constructor(izinService: IzinService);
    create(req: any, dto: CreateIzinDto, file?: Express.Multer.File): Promise<{
        message: string;
        izin: {
            user: {
                nama: string;
                nim: string;
            };
        } & {
            id: number;
            created_at: Date;
            keterangan: string;
            status: import(".prisma/client").$Enums.StatusIzin;
            user_id: number;
            jenis_izin: string;
            tanggal_mulai: Date;
            tanggal_selesai: Date;
            bukti: string | null;
            approved_by: number | null;
        };
    }>;
    findAll(req: any): Promise<({
        user: {
            nama: string;
            nim: string;
            nomor_kamar: string | null;
        };
        approver: {
            nama: string;
        } | null;
    } & {
        id: number;
        created_at: Date;
        keterangan: string;
        status: import(".prisma/client").$Enums.StatusIzin;
        user_id: number;
        jenis_izin: string;
        tanggal_mulai: Date;
        tanggal_selesai: Date;
        bukti: string | null;
        approved_by: number | null;
    })[]>;
    findOne(id: number): Promise<{
        user: {
            nama: string;
            nim: string;
            nomor_kamar: string | null;
        };
        approver: {
            nama: string;
        } | null;
    } & {
        id: number;
        created_at: Date;
        keterangan: string;
        status: import(".prisma/client").$Enums.StatusIzin;
        user_id: number;
        jenis_izin: string;
        tanggal_mulai: Date;
        tanggal_selesai: Date;
        bukti: string | null;
        approved_by: number | null;
    }>;
    updateStatus(id: number, req: any, dto: UpdateIzinStatusDto): Promise<{
        message: string;
        izin: {
            user: {
                nama: string;
                nim: string;
            };
            approver: {
                nama: string;
            } | null;
        } & {
            id: number;
            created_at: Date;
            keterangan: string;
            status: import(".prisma/client").$Enums.StatusIzin;
            user_id: number;
            jenis_izin: string;
            tanggal_mulai: Date;
            tanggal_selesai: Date;
            bukti: string | null;
            approved_by: number | null;
        };
    }>;
}
