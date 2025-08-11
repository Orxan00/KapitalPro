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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const admin = require("firebase-admin");
const config_service_1 = require("../../config/config.service");
let UsersService = class UsersService {
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
    async getUser(userId) {
        try {
            const userDoc = await this.db.collection('users').doc(userId).get();
            if (userDoc.exists) {
                return { success: true, data: userDoc.data() };
            }
            return { success: false, message: 'User not found' };
        }
        catch (error) {
            return { success: false, message: 'Error fetching user', error: error.message };
        }
    }
    async getUserBalance(userId) {
        try {
            const userDoc = await this.db.collection('users').doc(userId).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                return {
                    success: true,
                    balance: userData?.balance || 0,
                    userId: userId
                };
            }
            return { success: false, message: 'User not found', balance: 0 };
        }
        catch (error) {
            return { success: false, message: 'Error fetching balance', error: error.message, balance: 0 };
        }
    }
    async updateUserBalance(userId, newBalance) {
        try {
            const userRef = this.db.collection('users').doc(userId);
            await userRef.update({
                balance: newBalance,
                updated_at: admin.firestore.FieldValue.serverTimestamp()
            });
            return {
                success: true,
                message: 'Balance updated successfully',
                balance: newBalance,
                userId: userId
            };
        }
        catch (error) {
            return { success: false, message: 'Error updating balance', error: error.message };
        }
    }
    async getUserDeposits(userId) {
        try {
            const depositsRef = this.db.collection('deposits');
            const query = depositsRef.where('user_id', '==', userId);
            const querySnapshot = await query.get();
            const deposits = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            deposits.sort((a, b) => {
                const dateA = a.created_at?.toDate?.() || new Date(a.created_at);
                const dateB = b.created_at?.toDate?.() || new Date(b.created_at);
                return dateB.getTime() - dateA.getTime();
            });
            return { success: true, data: deposits };
        }
        catch (error) {
            return { success: false, message: 'Error fetching deposits', error: error.message };
        }
    }
    async getUserWithdrawals(userId) {
        try {
            const withdrawalsRef = this.db.collection('withdrawals');
            const query = withdrawalsRef.where('user_id', '==', userId);
            const querySnapshot = await query.get();
            const withdrawals = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            withdrawals.sort((a, b) => {
                const dateA = a.created_at?.toDate?.() || new Date(a.created_at);
                const dateB = b.created_at?.toDate?.() || new Date(b.created_at);
                return dateB.getTime() - dateA.getTime();
            });
            return { success: true, data: withdrawals };
        }
        catch (error) {
            return { success: false, message: 'Error fetching withdrawals', error: error.message };
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], UsersService);
//# sourceMappingURL=users.service.js.map