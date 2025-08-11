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
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const admin = require("firebase-admin");
const config_service_1 = require("../../config/config.service");
const telegram_notification_service_1 = require("../../lib/telegram-notification.service");
let SubscriptionsService = class SubscriptionsService {
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
    async createSubscription(subscriptionData) {
        try {
            const userDoc = await this.db.collection('users').doc(subscriptionData.user_id).get();
            if (!userDoc.exists) {
                return { success: false, message: 'User not found' };
            }
            const userData = userDoc.data();
            const currentBalance = userData?.balance || 0;
            const subscriptionAmount = subscriptionData.package_price;
            if (subscriptionAmount > currentBalance) {
                return {
                    success: false,
                    message: 'Insufficient balance',
                    currentBalance,
                    requiredAmount: subscriptionAmount
                };
            }
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + subscriptionData.duration_days);
            const subscriptionRef = this.db.collection('subscriptions').doc();
            const subscriptionDoc = {
                user_id: subscriptionData.user_id,
                user_username: subscriptionData.user_username || '',
                user_first_name: subscriptionData.user_first_name || '',
                user_last_name: subscriptionData.user_last_name || '',
                package_name: subscriptionData.package_name,
                package_price: subscriptionData.package_price,
                daily_return: subscriptionData.daily_return,
                duration_days: subscriptionData.duration_days,
                total_return: subscriptionData.total_return,
                start_date: admin.firestore.Timestamp.fromDate(startDate),
                end_date: admin.firestore.Timestamp.fromDate(endDate),
                status: 'active',
                total_earned: 0,
                remaining_days: subscriptionData.duration_days,
                last_earnings_update: admin.firestore.Timestamp.fromDate(startDate),
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
            };
            await subscriptionRef.set(subscriptionDoc);
            const newBalance = currentBalance - subscriptionAmount;
            await this.db.collection('users').doc(subscriptionData.user_id).update({
                balance: newBalance,
                updated_at: admin.firestore.FieldValue.serverTimestamp()
            });
            try {
                await this.telegramNotificationService.sendSubscriptionNotification(subscriptionData, subscriptionRef.id);
            }
            catch (notificationError) {
                console.warn('⚠️ Failed to send subscription notification:', notificationError);
            }
            return {
                success: true,
                message: 'Subscription created successfully',
                subscription_id: subscriptionRef.id
            };
        }
        catch (error) {
            return { success: false, message: 'Error creating subscription', error: error.message };
        }
    }
    async getUserSubscriptions(userId) {
        try {
            const subscriptionsRef = this.db.collection('subscriptions');
            const query = subscriptionsRef.where('user_id', '==', userId);
            const querySnapshot = await query.get();
            const subscriptions = [];
            let totalEarningsToAdd = 0;
            querySnapshot.forEach((doc) => {
                const subscriptionData = doc.data();
                const now = new Date();
                const endDate = subscriptionData.end_date.toDate();
                const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
                const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const remainingDays = Math.max(0, Math.floor((endDateOnly.getTime() - nowDateOnly.getTime()) / (1000 * 60 * 60 * 24)));
                const startDate = subscriptionData.start_date.toDate();
                const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                const nowDateOnlyEarnings = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const daysPassed = Math.min(Math.max(0, Math.floor((nowDateOnlyEarnings.getTime() - startDateOnly.getTime()) / (1000 * 60 * 60 * 24))), subscriptionData.duration_days);
                const dailyEarning = (subscriptionData.package_price * parseFloat(subscriptionData.daily_return.replace('%', ''))) / 100;
                const totalEarned = Math.max(0, daysPassed * dailyEarning);
                const lastEarningsUpdate = subscriptionData.last_earnings_update ?
                    subscriptionData.last_earnings_update.toDate() : startDate;
                const lastUpdateDateOnly = new Date(lastEarningsUpdate.getFullYear(), lastEarningsUpdate.getMonth(), lastEarningsUpdate.getDate());
                const daysSinceLastUpdate = Math.max(0, Math.floor((nowDateOnlyEarnings.getTime() - lastUpdateDateOnly.getTime()) / (1000 * 60 * 60 * 24)));
                const endDateOnlyEarnings = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
                const effectiveEndDate = nowDateOnlyEarnings.getTime() > endDateOnlyEarnings.getTime() ? endDateOnlyEarnings : nowDateOnlyEarnings;
                const effectiveDaysSinceLastUpdate = Math.min(daysSinceLastUpdate, Math.max(0, Math.floor((effectiveEndDate.getTime() - lastUpdateDateOnly.getTime()) / (1000 * 60 * 60 * 24))));
                const newEarnings = effectiveDaysSinceLastUpdate * dailyEarning;
                let status = subscriptionData.status;
                if (remainingDays <= 0 && status === 'active') {
                    status = 'completed';
                    doc.ref.update({
                        status: 'completed',
                        updated_at: admin.firestore.FieldValue.serverTimestamp()
                    });
                }
                if (newEarnings > 0) {
                    totalEarningsToAdd += newEarnings;
                    doc.ref.update({
                        total_earned: totalEarned,
                        last_earnings_update: admin.firestore.Timestamp.fromDate(now),
                        updated_at: admin.firestore.FieldValue.serverTimestamp()
                    });
                }
                subscriptions.push({
                    id: doc.id,
                    user_id: subscriptionData.user_id,
                    package_name: subscriptionData.package_name,
                    package_price: subscriptionData.package_price,
                    daily_return: subscriptionData.daily_return,
                    duration_days: subscriptionData.duration_days,
                    total_return: subscriptionData.total_return,
                    start_date: subscriptionData.start_date.toDate(),
                    end_date: subscriptionData.end_date.toDate(),
                    status: status,
                    total_earned: totalEarned,
                    remaining_days: remainingDays,
                    last_earnings_update: subscriptionData.last_earnings_update ? subscriptionData.last_earnings_update.toDate() : subscriptionData.start_date.toDate(),
                    created_at: subscriptionData.created_at.toDate(),
                    updated_at: subscriptionData.updated_at.toDate(),
                });
            });
            if (totalEarningsToAdd > 0) {
                try {
                    const userRef = this.db.collection('users').doc(userId);
                    const userDoc = await userRef.get();
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        const currentBalance = userData?.balance || 0;
                        const newBalance = currentBalance + totalEarningsToAdd;
                        await userRef.update({
                            balance: newBalance,
                            updated_at: admin.firestore.FieldValue.serverTimestamp()
                        });
                        try {
                            await this.telegramNotificationService.sendAutomaticEarningsNotification(userId, totalEarningsToAdd);
                        }
                        catch (notificationError) {
                            console.warn('⚠️ Failed to send automatic earnings notification:', notificationError);
                        }
                    }
                }
                catch (balanceUpdateError) {
                    console.error('❌ Error updating user balance:', balanceUpdateError);
                }
            }
            subscriptions.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
            return subscriptions;
        }
        catch (error) {
            console.error('❌ Error fetching user subscriptions:', error);
            return [];
        }
    }
    async getSubscriptionById(subscriptionId) {
        try {
            const subscriptionRef = this.db.collection('subscriptions').doc(subscriptionId);
            const doc = await subscriptionRef.get();
            if (!doc.exists) {
                return null;
            }
            const subscriptionData = doc.data();
            if (!subscriptionData) {
                return null;
            }
            const now = new Date();
            const endDate = subscriptionData.end_date.toDate();
            const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const remainingDays = Math.max(0, Math.floor((endDateOnly.getTime() - nowDateOnly.getTime()) / (1000 * 60 * 60 * 24)));
            const startDate = subscriptionData.start_date.toDate();
            const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            const nowDateOnlyEarnings = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const daysPassed = Math.min(Math.max(0, Math.floor((nowDateOnlyEarnings.getTime() - startDateOnly.getTime()) / (1000 * 60 * 60 * 24))), subscriptionData.duration_days);
            const dailyEarning = (subscriptionData.package_price * parseFloat(subscriptionData.daily_return.replace('%', ''))) / 100;
            const totalEarned = Math.max(0, daysPassed * dailyEarning);
            const lastEarningsUpdate = subscriptionData.last_earnings_update ?
                subscriptionData.last_earnings_update.toDate() : startDate;
            const lastUpdateDateOnly = new Date(lastEarningsUpdate.getFullYear(), lastEarningsUpdate.getMonth(), lastEarningsUpdate.getDate());
            const daysSinceLastUpdate = Math.max(0, Math.floor((nowDateOnlyEarnings.getTime() - lastUpdateDateOnly.getTime()) / (1000 * 60 * 60 * 24)));
            const endDateOnlyEarnings = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            const effectiveEndDate = nowDateOnlyEarnings.getTime() > endDateOnlyEarnings.getTime() ? endDateOnlyEarnings : nowDateOnlyEarnings;
            const effectiveDaysSinceLastUpdate = Math.min(daysSinceLastUpdate, Math.max(0, Math.floor((effectiveEndDate.getTime() - lastUpdateDateOnly.getTime()) / (1000 * 60 * 60 * 24))));
            const newEarnings = effectiveDaysSinceLastUpdate * dailyEarning;
            let status = subscriptionData.status;
            if (remainingDays <= 0 && status === 'active') {
                status = 'completed';
                await subscriptionRef.update({
                    status: 'completed',
                    updated_at: admin.firestore.FieldValue.serverTimestamp()
                });
            }
            if (newEarnings > 0) {
                try {
                    const userRef = this.db.collection('users').doc(subscriptionData.user_id);
                    const userDoc = await userRef.get();
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        const currentBalance = userData?.balance || 0;
                        const newBalance = currentBalance + newEarnings;
                        await userRef.update({
                            balance: newBalance,
                            updated_at: admin.firestore.FieldValue.serverTimestamp()
                        });
                        await subscriptionRef.update({
                            total_earned: totalEarned,
                            last_earnings_update: admin.firestore.Timestamp.fromDate(now),
                            updated_at: admin.firestore.FieldValue.serverTimestamp()
                        });
                        try {
                            await this.telegramNotificationService.sendAutomaticEarningsNotification(subscriptionData.user_id, newEarnings);
                        }
                        catch (notificationError) {
                            console.warn('⚠️ Failed to send automatic earnings notification:', notificationError);
                        }
                    }
                }
                catch (balanceUpdateError) {
                    console.error('❌ Error updating user balance:', balanceUpdateError);
                }
            }
            return {
                id: doc.id,
                user_id: subscriptionData.user_id,
                package_name: subscriptionData.package_name,
                package_price: subscriptionData.package_price,
                daily_return: subscriptionData.daily_return,
                duration_days: subscriptionData.duration_days,
                total_return: subscriptionData.total_return,
                start_date: subscriptionData.start_date.toDate(),
                end_date: subscriptionData.end_date.toDate(),
                status: status,
                total_earned: totalEarned,
                remaining_days: remainingDays,
                last_earnings_update: subscriptionData.last_earnings_update ? subscriptionData.last_earnings_update.toDate() : subscriptionData.start_date.toDate(),
                created_at: subscriptionData.created_at.toDate(),
                updated_at: subscriptionData.updated_at.toDate(),
            };
        }
        catch (error) {
            return null;
        }
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService,
        telegram_notification_service_1.TelegramNotificationService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map