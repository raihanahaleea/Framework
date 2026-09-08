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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IzinController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const izin_service_1 = require("./izin.service");
const create_izin_dto_1 = require("./dto/create-izin.dto");
const update_izin_status_dto_1 = require("./dto/update-izin-status.dto");
const buktiStorage = (0, multer_1.diskStorage)({
    destination: './uploads/bukti',
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `bukti-${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
    },
});
let IzinController = class IzinController {
    constructor(izinService) {
        this.izinService = izinService;
    }
    create(req, dto, file) {
        return this.izinService.create(req.user.id, dto, file);
    }
    findAll(req) {
        if (req.user.role === client_1.Role.PENGHUNI) {
            return this.izinService.findAll(req.user.id);
        }
        return this.izinService.findAll();
    }
    findOne(id) {
        return this.izinService.findOne(id);
    }
    updateStatus(id, req, dto) {
        return this.izinService.updateStatus(id, req.user.id, dto);
    }
};
exports.IzinController = IzinController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.PENGHUNI),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('bukti', {
        storage: buktiStorage,
        fileFilter: (_req, file, cb) => {
            const allowedMimes = [
                'image/jpeg',
                'image/jpg',
                'image/png',
                'application/pdf',
            ];
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new Error('File harus berformat JPG, PNG, atau PDF'), false);
            }
        },
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_izin_dto_1.CreateIzinDto, Object]),
    __metadata("design:returntype", void 0)
], IzinController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.Role.PENGHUNI, client_1.Role.FASIL, client_1.Role.ADMIN),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IzinController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.PENGHUNI, client_1.Role.FASIL, client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], IzinController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(client_1.Role.FASIL),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, update_izin_status_dto_1.UpdateIzinStatusDto]),
    __metadata("design:returntype", void 0)
], IzinController.prototype, "updateStatus", null);
exports.IzinController = IzinController = __decorate([
    (0, common_1.Controller)('izin'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [izin_service_1.IzinService])
], IzinController);
//# sourceMappingURL=izin.controller.js.map