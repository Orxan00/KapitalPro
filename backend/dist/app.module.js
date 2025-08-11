"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("./config/config.service");
const health_controller_1 = require("./health.controller");
const users_module_1 = require("./modules/users/users.module");
const transactions_module_1 = require("./modules/transactions/transactions.module");
const networks_module_1 = require("./modules/networks/networks.module");
const subscriptions_module_1 = require("./modules/subscriptions/subscriptions.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            users_module_1.UsersModule,
            transactions_module_1.TransactionsModule,
            networks_module_1.NetworksModule,
            subscriptions_module_1.SubscriptionsModule,
        ],
        controllers: [health_controller_1.HealthController],
        providers: [config_service_1.ConfigService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map