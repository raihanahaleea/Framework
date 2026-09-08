import { PrismaService } from '../prisma/prisma.service';
import { CreateKamarDto } from './dto/create-kamar.dto';
export declare class KamarService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateKamarDto): Promise<{
        message: string;
        kamar: {
            gedung: {
                nama: string;
            };
        } & {
            no_kamar: string;
            lantai: number;
            id_gedung: number;
        };
    }>;
    findAll(id_gedung?: number): Promise<({
        gedung: {
            nama: string;
        };
    } & {
        no_kamar: string;
        lantai: number;
        id_gedung: number;
    })[]>;
    findOne(no_kamar: string): Promise<{
        gedung: {
            nama: string;
        };
    } & {
        no_kamar: string;
        lantai: number;
        id_gedung: number;
    }>;
    update(no_kamar: string, dto: Partial<CreateKamarDto>): Promise<{
        message: string;
        kamar: {
            gedung: {
                nama: string;
            };
        } & {
            no_kamar: string;
            lantai: number;
            id_gedung: number;
        };
    }>;
    remove(no_kamar: string): Promise<{
        message: string;
    }>;
}
