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
exports.IzinService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let IzinService = class IzinService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto, buktiFile) {
        const izin = await this.prisma.izin.create({
            data: {
                jenis_izin: dto.jenis_izin,
                keterangan: dto.keterangan,
                bukti: buktiFile ? `/uploads/bukti/${buktiFile.filename}` : null,
                tanggal_mulai: new Date(dto.tanggal_mulai),
                tanggal_selesai: new Date(dto.tanggal_selesai),
                user_id: userId,
            },
            include: {
                user: {
                    select: { nama: true, nim: true },
                },
            },
        });
        return {
            message: 'Izin berhasil diajukan',
            izin,
        };
    }
    async findAll(userId) {
        const where = userId ? { user_id: userId } : {};
        return this.prisma.izin.findMany({
            where,
            include: {
                user: {
                    select: { nama: true, nim: true, nomor_kamar: true },
                },
                approver: {
                    select: { nama: true },
                },
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async findOne(id) {
        const izin = await this.prisma.izin.findUnique({
            where: { id },
            include: {
                user: {
                    select: { nama: true, nim: true, nomor_kamar: true },
                },
                approver: {
                    select: { nama: true },
                },
            },
        });
        if (!izin) {
            throw new common_1.NotFoundException('Izin tidak ditemukan');
        }
        return izin;
    }
    async updateStatus(id, fasilId, dto) {
        await this.findOne(id);
        const izin = await this.prisma.izin.update({
            where: { id },
            data: {
                status: dto.status,
                approved_by: fasilId,
            },
            include: {
                user: {
                    select: { nama: true, nim: true },
                },
                approver: {
                    select: { nama: true },
                },
            },
        });
        return {
            message: `Izin berhasil di-${dto.status.toLowerCase()}`,
            izin,
        };
    }
};
exports.IzinService = IzinService;
exports.IzinService = IzinService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IzinService);
//# sourceMappingURL=izin.service.js.map