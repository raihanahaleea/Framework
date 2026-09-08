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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../prisma/prisma.service");
let UserService = class UserService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const existing = await this.prisma.user.findFirst({
            where: {
                OR: [{ email: dto.email }, { nim: dto.nim }],
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Email atau NIM sudah terdaftar');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                ...dto,
                password: hashedPassword,
            },
            select: {
                id: true,
                nama: true,
                nim: true,
                asal: true,
                nomor_kamar: true,
                jekel: true,
                email: true,
                role: true,
                created_at: true,
            },
        });
        return {
            message: 'User berhasil ditambahkan',
            user,
        };
    }
    async findAll(role) {
        const where = role ? { role: role } : {};
        return this.prisma.user.findMany({
            where,
            select: {
                id: true,
                nama: true,
                nim: true,
                asal: true,
                nomor_kamar: true,
                jekel: true,
                email: true,
                role: true,
                created_at: true,
            },
            orderBy: { nama: 'asc' },
        });
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                nama: true,
                nim: true,
                asal: true,
                nomor_kamar: true,
                jekel: true,
                email: true,
                role: true,
                created_at: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User tidak ditemukan');
        }
        return user;
    }
    async update(id, dto) {
        await this.findOne(id);
        const data = { ...dto };
        if (dto.password) {
            data.password = await bcrypt.hash(dto.password, 10);
        }
        const user = await this.prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                nama: true,
                nim: true,
                asal: true,
                nomor_kamar: true,
                jekel: true,
                email: true,
                role: true,
                created_at: true,
            },
        });
        return {
            message: 'User berhasil diupdate',
            user,
        };
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.user.delete({ where: { id } });
        return { message: 'User berhasil dihapus' };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map