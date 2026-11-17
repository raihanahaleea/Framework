"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresensiService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let PresensiService = class PresensiService {
    constructor(prisma) {
        this.prisma = prisma;
        this.ASRAMA_LAT = -6.2;
        this.ASRAMA_LONG = 106.8;
        this.RADIUS_METER = 100;
    }
    async createPresensi(userId, dto) {
        const now = new Date();
        const wibOffset = 7 * 60 * 60 * 1000;
        const wibTime = new Date(now.getTime() + wibOffset);
        const hours = wibTime.getUTCHours();
        const minutes = wibTime.getUTCMinutes();
        const timeInMinutes = hours * 60 + minutes;
        const subuhStart = 4 * 60;
        const subuhEnd = 6 * 60;
        const malamStart = 18 * 60;
        const malamEnd = 20 * 60 + 30;
        const isSubuh = timeInMinutes >= subuhStart && timeInMinutes <= subuhEnd;
        const isMalam = timeInMinutes >= malamStart && timeInMinutes <= malamEnd;
        if (!isSubuh && !isMalam) {
            throw new common_1.BadRequestException('Presensi hanya bisa dilakukan pada waktu Subuh (04:00-06:00) atau Malam (18:00-20:30) WIB');
        }
        const distance = this.calculateDistance(dto.lat, dto.long, this.ASRAMA_LAT, this.ASRAMA_LONG);
        if (distance > this.RADIUS_METER) {
            throw new common_1.ForbiddenException(`Anda berada di luar area asrama. Jarak: ${Math.round(distance)} meter (maks ${this.RADIUS_METER} meter)`);
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const existingPresensi = await this.prisma.presensi.findFirst({
            where: {
                user_id: userId,
                tanggal: today,
                waktu: {
                    gte: isSubuh
                        ? new Date(today.getTime() + subuhStart * 60 * 1000 - wibOffset)
                        : new Date(today.getTime() + malamStart * 60 * 1000 - wibOffset),
                    lte: isSubuh
                        ? new Date(today.getTime() + subuhEnd * 60 * 1000 - wibOffset)
                        : new Date(today.getTime() + malamEnd * 60 * 1000 - wibOffset),
                },
            },
        });
        if (existingPresensi) {
            throw new common_1.BadRequestException(`Anda sudah melakukan presensi ${isSubuh ? 'Subuh' : 'Malam'} hari ini`);
        }
        const status = client_1.StatusPresensi.HADIR;
        const sesi = isSubuh ? 'Subuh' : 'Malam';
        const presensi = await this.prisma.presensi.create({
            data: {
                waktu: now,
                lat: dto.lat,
                long: dto.long,
                status,
                foto_wajah: dto.foto_wajah || null,
                keterangan: dto.keterangan || `Presensi ${sesi}`,
                tanggal: today,
                user_id: userId,
            },
            include: {
                user: {
                    select: { nama: true, nim: true },
                },
            },
        });
        return {
            message: `Presensi ${sesi} berhasil`,
            presensi,
        };
    }
    async getRiwayat(userId, startDate, endDate) {
        const where = { user_id: userId };
        if (startDate && endDate) {
            where.tanggal = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }
        return this.prisma.presensi.findMany({
            where,
            include: {
                user: {
                    select: { nama: true, nim: true },
                },
            },
            orderBy: { waktu: 'desc' },
        });
    }
    async getRiwayatByUser(userId, startDate, endDate) {
        return this.getRiwayat(userId, startDate, endDate);
    }
    async getAllRiwayat(startDate, endDate) {
        const where = {};
        if (startDate && endDate) {
            where.tanggal = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }
        return this.prisma.presensi.findMany({
            where,
            include: {
                user: {
                    select: { nama: true, nim: true, nomor_kamar: true },
                },
            },
            orderBy: { waktu: 'desc' },
        });
    }
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000;
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) *
                Math.cos(this.toRad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    toRad(deg) {
        return deg * (Math.PI / 180);
    }
};
exports.PresensiService = PresensiService;
exports.PresensiService = PresensiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PresensiService);
//# sourceMappingURL=presensi.service.js.map