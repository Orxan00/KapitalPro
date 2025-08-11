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
exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const transactions_service_1 = require("./transactions.service");
const dto_1 = require("./dto");
let TransactionsController = class TransactionsController {
    transactionsService;
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    async createDeposit(depositData) {
        console.log('📥 Received deposit request:', depositData);
        const result = await this.transactionsService.createDeposit(depositData);
        console.log('📤 Deposit result:', result);
        return result;
    }
    async createWithdrawal(withdrawalData) {
        return await this.transactionsService.createWithdrawal(withdrawalData);
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Post)('deposits'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateDepositDto]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "createDeposit", null);
__decorate([
    (0, common_1.Post)('withdrawals'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateWithdrawalDto]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "createWithdrawal", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionsController);
//# sourceMappingURL=transactions.controller.js.map