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
exports.NetworksController = void 0;
const common_1 = require("@nestjs/common");
const networks_service_1 = require("./networks.service");
let NetworksController = class NetworksController {
    networksService;
    constructor(networksService) {
        this.networksService = networksService;
    }
    async getNetworks() {
        return await this.networksService.getNetworks();
    }
};
exports.NetworksController = NetworksController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NetworksController.prototype, "getNetworks", null);
exports.NetworksController = NetworksController = __decorate([
    (0, common_1.Controller)('networks'),
    __metadata("design:paramtypes", [networks_service_1.NetworksService])
], NetworksController);
//# sourceMappingURL=networks.controller.js.map