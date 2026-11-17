import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(dto: CreateUserDto): Promise<{
        message: string;
        user: {
            nama: string;
            nim: string;
            asal: string;
            nomor_kamar: string | null;
            jekel: import(".prisma/client").$Enums.JenisKelamin;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            id: number;
            created_at: Date;
        };
    }>;
    findAll(role?: string): Promise<{
        nama: string;
        nim: string;
        asal: string;
        nomor_kamar: string | null;
        jekel: import(".prisma/client").$Enums.JenisKelamin;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        id: number;
        created_at: Date;
    }[]>;
    findOne(id: number): Promise<{
        nama: string;
        nim: string;
        asal: string;
        nomor_kamar: string | null;
        jekel: import(".prisma/client").$Enums.JenisKelamin;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        id: number;
        created_at: Date;
    }>;
    update(id: number, dto: UpdateUserDto): Promise<{
        message: string;
        user: {
            nama: string;
            nim: string;
            asal: string;
            nomor_kamar: string | null;
            jekel: import(".prisma/client").$Enums.JenisKelamin;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            id: number;
            created_at: Date;
        };
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
