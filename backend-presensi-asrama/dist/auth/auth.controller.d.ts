import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getProfile(req: any): Promise<{
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
}
