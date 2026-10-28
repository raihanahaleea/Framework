import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  healthCheck() {
    return {
      status: 'ok',
      message: 'Backend Presensi Asrama API is running',
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: '/api/auth (login, register, profile)',
        user: '/api/user (CRUD penghuni/fasil)',
        presensi: '/api/presensi (absen & riwayat)',
        izin: '/api/izin (pengajuan & approval)',
        gedung: '/api/gedung (CRUD gedung)',
        kamar: '/api/kamar (CRUD kamar)',
      },
    };
  }
}
