import { KamarService } from './kamar.service';
import { CreateKamarDto } from './dto/create-kamar.dto';
export declare class KamarController {
    private readonly kamarService;
    constructor(kamarService: KamarService);
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
    findAll(id_gedung?: string): Promise<({
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
