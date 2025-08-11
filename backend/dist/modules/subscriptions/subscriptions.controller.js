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
exports.SubscriptionsController = void 0;
const common_1 = require("@nestjs/common");
const subscriptions_service_1 = require("./subscriptions.service");
const dto_1 = require("./dto");
let SubscriptionsController = class SubscriptionsController {
    subscriptionsService;
    constructor(subscriptionsService) {
        this.subscriptionsService = subscriptionsService;
    }
    async createSubscription(createSubscriptionDto) {
        try {
            const result = await this.subscriptionsService.createSubscription(createSubscriptionDto);
            if (result.success) {
                return {
                    success: true,
                    message: result.message,
                    subscription_id: result.subscription_id
                };
            }
            else {
                return {
                    success: false,
                    message: result.message,
                    currentBalance: result.currentBalance,
                    requiredAmount: result.requiredAmount
                };
            }
        }
        catch (error) {
            return {
                success: false,
                message: 'Internal server error',
                error: error.message
            };
        }
    }
    async getUserSubscriptions(userId) {
        try {
            const subscriptions = await this.subscriptionsService.getUserSubscriptions(userId);
            return {
                success: true,
                data: subscriptions,
                count: subscriptions.length
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Error fetching subscriptions',
                error: error.message
            };
        }
    }
    async getSubscriptionById(subscriptionId) {
        try {
            const subscription = await this.subscriptionsService.getSubscriptionById(subscriptionId);
            if (subscription) {
                return {
                    success: true,
                    data: subscription
                };
            }
            else {
                return {
                    success: false,
                    message: 'Subscription not found'
                };
            }
        }
        catch (error) {
            return {
                success: false,
                message: 'Error fetching subscription',
                error: error.message
            };
        }
    }
};
exports.SubscriptionsController = SubscriptionsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateSubscriptionDto]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "createSubscription", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getUserSubscriptions", null);
__decorate([
    (0, common_1.Get)(':subscriptionId'),
    __param(0, (0, common_1.Param)('subscriptionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getSubscriptionById", null);
exports.SubscriptionsController = SubscriptionsController = __decorate([
    (0, common_1.Controller)('subscriptions'),
    __metadata("design:paramtypes", [subscriptions_service_1.SubscriptionsService])
], SubscriptionsController);
//# sourceMappingURL=subscriptions.controller.js.map