import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        message: string;
        user: {
            id: number;
            nama: string;
            nim: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
        access_token: string;
    }>;
    login(dto: LoginDto): Promise<{
        message: string;
        user: {
            id: number;
            nama: string;
            nim: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
        access_token: string;
    }>;
    getProfile(userId: number): Promise<{
        nama: string;
        nim: string;
        asal: string;
        nomor_kamar: string | null;
        jekel: import(".prisma/client").$Enums.JenisKelamin;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        id: number;
        created_at: Date;
    } | null>;
    private generateToken;
}
