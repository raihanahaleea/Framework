import { PrismaService } from '../prisma/prisma.service';
import { CreateGedungDto } from './dto/create-gedung.dto';
export declare class GedungService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateGedungDto): Promise<{
        message: string;
        gedung: {
            user: {
                nama: string;
                nim: string;
            };
        } & {
            nama: string;
            id: number;
            lat: number | null;
            long: number | null;
            id_user: number;
        };
    }>;
    findAll(): Promise<({
        user: {
            nama: string;
        };
        kamar: {
            no_kamar: string;
            lantai: number;
            id_gedung: number;
        }[];
    } & {
        nama: string;
        id: number;
        lat: number | null;
        long: number | null;
        id_user: number;
    })[]>;
    findOne(id: number): Promise<{
        user: {
            nama: string;
        };
        kamar: {
            no_kamar: string;
            lantai: number;
            id_gedung: number;
        }[];
    } & {
        nama: string;
        id: number;
        lat: number | null;
        long: number | null;
        id_user: number;
    }>;
    update(id: number, dto: Partial<CreateGedungDto>): Promise<{
        message: string;
        gedung: {
            user: {
                nama: string;
            };
        } & {
            nama: string;
            id: number;
            lat: number | null;
            long: number | null;
            id_user: number;
        };
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
