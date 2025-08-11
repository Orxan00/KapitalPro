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
exports.NetworksService = void 0;
const common_1 = require("@nestjs/common");
const admin = require("firebase-admin");
const config_service_1 = require("../../config/config.service");
let NetworksService = class NetworksService {
    configService;
    db;
    constructor(configService) {
        this.configService = configService;
        if (!admin.apps.length) {
            const { projectId, privateKey, clientEmail } = this.configService.firebaseConfig;
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    privateKey,
                    clientEmail,
                }),
            });
        }
        this.db = admin.firestore();
    }
    async getNetworks() {
        try {
            const networks = await this.db.collection('networks').get();
            const data = networks.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            if (data.length === 0) {
                return { success: true, data: this.getFallbackNetworks() };
            }
            return { success: true, data };
        }
        catch (error) {
            return { success: true, data: this.getFallbackNetworks() };
        }
    }
    getFallbackNetworks() {
        return [
            {
                id: 'usdt-trc20',
                name: 'Tron (TRC20) - USDT',
                symbol: 'USDT',
                address: 'TXvKyQxfDoQiAG2uHdBn3GGPrL5wqFoyuB',
                icon: '💎',
                type: 'deposit',
                isActive: true
            },
            {
                id: 'usdt-bep20',
                name: 'BNB (BEP20) - USDT',
                symbol: 'USDT',
                address: '0x25d2be7148dee80d3d8797403ec8026b709d2ced',
                icon: '🟡',
                type: 'deposit',
                isActive: true
            },
            {
                id: 'usdt-arbitrum',
                name: 'Arbitrum One - USDT',
                symbol: 'USDT',
                address: '0x25d2be7148dee80d3d8797403ec8026b709d2ced',
                icon: '🔵',
                type: 'deposit',
                isActive: true
            },
            {
                id: 'usdt-aptos',
                name: 'Aptos USDT',
                symbol: 'USDT',
                address: '0x2c7249a069c427ec6d2c00f3e0223586942205a0eeefbaa48753bab7256f1b8a',
                icon: '🟣',
                type: 'deposit',
                isActive: true
            },
            {
                id: 'usdt-trc20-withdraw',
                name: 'Tron (TRC20) - USDT',
                symbol: 'USDT',
                icon: '💎',
                type: 'withdrawal',
                isActive: true
            },
            {
                id: 'usdt-bep20-withdraw',
                name: 'BNB (BEP20) - USDT',
                symbol: 'USDT',
                icon: '🟡',
                type: 'withdrawal',
                isActive: true
            },
            {
                id: 'usdt-arbitrum-withdraw',
                name: 'Arbitrum One - USDT',
                symbol: 'USDT',
                icon: '🔵',
                type: 'withdrawal',
                isActive: true
            },
            {
                id: 'usdt-aptos-withdraw',
                name: 'Aptos USDT',
                symbol: 'USDT',
                icon: '🟣',
                type: 'withdrawal',
                isActive: true
            }
        ];
    }
};
exports.NetworksService = NetworksService;
exports.NetworksService = NetworksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], NetworksService);
//# sourceMappingURL=networks.service.js.map