export declare class AppController {
    healthCheck(): {
        status: string;
        message: string;
        timestamp: string;
        endpoints: {
            auth: string;
            user: string;
            presensi: string;
            izin: string;
            gedung: string;
            kamar: string;
        };
    };
}
