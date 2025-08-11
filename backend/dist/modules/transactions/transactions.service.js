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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const admin = require("firebase-admin");
const config_service_1 = require("../../config/config.service");
const telegram_notification_service_1 = require("../../lib/telegram-notification.service");
let TransactionsService = class TransactionsService {
    configService;
    telegramNotificationService;
    db;
    constructor(configService, telegramNotificationService) {
        this.configService = configService;
        this.telegramNotificationService = telegramNotificationService;
        if (!admin.apps.length) {
            const { projectId, privateKey, clientEmail } = this.configService.firebaseConfig;
            if (!projectId || !privateKey || !clientEmail) {
                console.error('❌ Firebase configuration missing:', {
                    projectId: !!projectId,
                    privateKey: !!privateKey,
                    clientEmail: !!clientEmail
                });
                throw new Error('Firebase configuration is incomplete');
            }
            console.log('🔧 Initializing Firebase with project:', projectId);
            try {
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        privateKey,
                        clientEmail,
                    }),
                });
                console.log('✅ Firebase initialized successfully');
            }
            catch (error) {
                console.error('❌ Firebase initialization failed:', error);
                throw error;
            }
        }
        this.db = admin.firestore();
    }
    async createDeposit(depositData) {
        try {
            console.log('🔍 Creating deposit with data:', depositData);
            const depositRef = this.db.collection('deposits').doc();
            const depositDoc = {
                user_id: depositData.user_id,
                user_username: depositData.user_username || '',
                user_first_name: depositData.user_first_name || '',
                user_last_name: depositData.user_last_name || '',
                amount: depositData.amount,
                status: 'pending',
                transaction_ref: depositData.transaction_ref,
                network: depositData.network,
                network_name: depositData.network_name,
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
                processed_at: null
            };
            await depositRef.set(depositDoc);
            try {
                await this.telegramNotificationService.sendDepositNotification(depositData, depositRef.id);
            }
            catch (notificationError) {
                console.warn('⚠️ Failed to send admin notification:', notificationError);
            }
            return {
                success: true,
                message: 'Deposit created successfully',
                transaction_id: depositRef.id
            };
        }
        catch (error) {
            console.error('❌ Error creating deposit:', error);
            return { success: false, message: 'Error creating deposit', error: error.message };
        }
    }
    async createWithdrawal(withdrawalData) {
        try {
            const userDoc = await this.db.collection('users').doc(withdrawalData.user_id).get();
            if (!userDoc.exists) {
                return { success: false, message: 'User not found' };
            }
            const userData = userDoc.data();
            const currentBalance = userData?.balance || 0;
            const withdrawalAmount = parseFloat(withdrawalData.amount);
            if (withdrawalAmount > currentBalance) {
                return {
                    success: false,
                    message: 'Insufficient balance',
                    currentBalance,
                    requestedAmount: withdrawalAmount
                };
            }
            const withdrawalRef = this.db.collection('withdrawals').doc();
            const withdrawalDoc = {
                user_id: withdrawalData.user_id,
                user_username: withdrawalData.user_username || '',
                user_first_name: withdrawalData.user_first_name || '',
                user_last_name: withdrawalData.user_last_name || '',
                status: 'pending',
                amount: withdrawalData.amount,
                network: withdrawalData.network,
                network_name: withdrawalData.network_name,
                withdrawal_address: withdrawalData.withdrawal_address,
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
            };
            await withdrawalRef.set(withdrawalDoc);
            try {
                await this.telegramNotificationService.sendWithdrawalNotification(withdrawalData, withdrawalRef.id);
            }
            catch (notificationError) {
                console.warn('⚠️ Failed to send withdrawal notification:', notificationError);
            }
            return {
                success: true,
                message: 'Withdrawal created successfully',
                transaction_id: withdrawalRef.id
            };
        }
        catch (error) {
            return { success: false, message: 'Error creating withdrawal', error: error.message };
        }
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService,
        telegram_notification_service_1.TelegramNotificationService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map