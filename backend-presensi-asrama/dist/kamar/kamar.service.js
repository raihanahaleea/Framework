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
exports.KamarService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let KamarService = class KamarService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const existing = await this.prisma.kamar.findUnique({
            where: { no_kamar: dto.no_kamar },
        });
        if (existing) {
            throw new common_1.ConflictException(`Kamar ${dto.no_kamar} sudah terdaftar`);
        }
        const gedung = await this.prisma.gedung.findUnique({
            where: { id: dto.id_gedung },
        });
        if (!gedung) {
            throw new common_1.NotFoundException('Gedung tidak ditemukan');
        }
        const kamar = await this.prisma.kamar.create({
            data: dto,
            include: {
                gedung: {
                    select: { nama: true },
                },
            },
        });
        return {
            message: 'Kamar berhasil ditambahkan',
            kamar,
        };
    }
    async findAll(id_gedung) {
        const where = id_gedung ? { id_gedung } : {};
        return this.prisma.kamar.findMany({
            where,
            include: {
                gedung: {
                    select: { nama: true },
                },
            },
            orderBy: { no_kamar: 'asc' },
        });
    }
    async findOne(no_kamar) {
        const kamar = await this.prisma.kamar.findUnique({
            where: { no_kamar },
            include: {
                gedung: {
                    select: { nama: true },
                },
            },
        });
        if (!kamar) {
            throw new common_1.NotFoundException('Kamar tidak ditemukan');
        }
        return kamar;
    }
    async update(no_kamar, dto) {
        await this.findOne(no_kamar);
        const { no_kamar: _, ...updateData } = dto;
        const kamar = await this.prisma.kamar.update({
            where: { no_kamar },
            data: updateData,
            include: {
                gedung: {
                    select: { nama: true },
                },
            },
        });
        return {
            message: 'Kamar berhasil diupdate',
            kamar,
        };
    }
    async remove(no_kamar) {
        await this.findOne(no_kamar);
        await this.prisma.kamar.delete({ where: { no_kamar } });
        return { message: 'Kamar berhasil dihapus' };
    }
};
exports.KamarService = KamarService;
exports.KamarService = KamarService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KamarService);
//# sourceMappingURL=kamar.service.js.map