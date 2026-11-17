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
exports.KamarController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const kamar_service_1 = require("./kamar.service");
const create_kamar_dto_1 = require("./dto/create-kamar.dto");
let KamarController = class KamarController {
    constructor(kamarService) {
        this.kamarService = kamarService;
    }
    create(dto) {
        return this.kamarService.create(dto);
    }
    findAll(id_gedung) {
        return this.kamarService.findAll(id_gedung ? parseInt(id_gedung) : undefined);
    }
    findOne(no_kamar) {
        return this.kamarService.findOne(no_kamar);
    }
    update(no_kamar, dto) {
        return this.kamarService.update(no_kamar, dto);
    }
    remove(no_kamar) {
        return this.kamarService.remove(no_kamar);
    }
};
exports.KamarController = KamarController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_kamar_dto_1.CreateKamarDto]),
    __metadata("design:returntype", void 0)
], KamarController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.FASIL),
    __param(0, (0, common_1.Query)('id_gedung')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], KamarController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':no_kamar'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.FASIL),
    __param(0, (0, common_1.Param)('no_kamar')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], KamarController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':no_kamar'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('no_kamar')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], KamarController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':no_kamar'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('no_kamar')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], KamarController.prototype, "remove", null);
exports.KamarController = KamarController = __decorate([
    (0, common_1.Controller)('kamar'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [kamar_service_1.KamarService])
], KamarController);
//# sourceMappingURL=kamar.controller.js.map