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
exports.GedungService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let GedungService = class GedungService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const gedung = await this.prisma.gedung.create({
            data: dto,
            include: {
                user: {
                    select: { nama: true, nim: true },
                },
            },
        });
        return {
            message: 'Gedung berhasil ditambahkan',
            gedung,
        };
    }
    async findAll() {
        return this.prisma.gedung.findMany({
            include: {
                user: {
                    select: { nama: true },
                },
                kamar: true,
            },
        });
    }
    async findOne(id) {
        const gedung = await this.prisma.gedung.findUnique({
            where: { id },
            include: {
                user: {
                    select: { nama: true },
                },
                kamar: true,
            },
        });
        if (!gedung) {
            throw new common_1.NotFoundException('Gedung tidak ditemukan');
        }
        return gedung;
    }
    async update(id, dto) {
        await this.findOne(id);
        const gedung = await this.prisma.gedung.update({
            where: { id },
            data: dto,
            include: {
                user: {
                    select: { nama: true },
                },
            },
        });
        return {
            message: 'Gedung berhasil diupdate',
            gedung,
        };
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.gedung.delete({ where: { id } });
        return { message: 'Gedung berhasil dihapus' };
    }
};
exports.GedungService = GedungService;
exports.GedungService = GedungService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GedungService);
//# sourceMappingURL=gedung.service.js.map