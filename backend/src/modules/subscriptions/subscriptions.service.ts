import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '../../config/config.service';
import { TelegramNotificationService } from '../../lib/telegram-notification.service';
import { CreateSubscriptionDto, SubscriptionResponseDto } from './dto';

@Injectable()
export class SubscriptionsService {
  private db: admin.firestore.Firestore;

  constructor(
    private configService: ConfigService,
    private telegramNotificationService: TelegramNotificationService
  ) {
    // Initialize Firebase Admin SDK with config
    if (!admin.apps.length) {
      const { projectId, privateKey, clientEmail } = this.configService.firebaseConfig;
      
      // Validate Firebase config
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
      } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        throw error;
      }
    }
    this.db = admin.firestore();
  }

  async createSubscription(subscriptionData: CreateSubscriptionDto) {
    try {
      
      // Check if user exists and has sufficient balance
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

      // Calculate dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + subscriptionData.duration_days);

      // Create subscription document
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
      
      // Deduct amount from user balance
      const newBalance = currentBalance - subscriptionAmount;
      await this.db.collection('users').doc(subscriptionData.user_id).update({
        balance: newBalance,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Send admin notification
      try {
        await this.telegramNotificationService.sendSubscriptionNotification(subscriptionData, subscriptionRef.id);
      } catch (notificationError) {
        console.warn('⚠️ Failed to send subscription notification:', notificationError);
      }
      
      return { 
        success: true, 
        message: 'Subscription created successfully', 
        subscription_id: subscriptionRef.id 
      };
    } catch (error) {
      return { success: false, message: 'Error creating subscription', error: error.message };
    }
  }

  async getUserSubscriptions(userId: string) {
    try {
      
      const subscriptionsRef = this.db.collection('subscriptions');
      const query = subscriptionsRef.where('user_id', '==', userId);
      const querySnapshot = await query.get();
      
      const subscriptions: SubscriptionResponseDto[] = [];
      let totalEarningsToAdd = 0;
      
      querySnapshot.forEach((doc) => {
        const subscriptionData = doc.data();
        
        // Calculate remaining days
        const now = new Date();
        const endDate = subscriptionData.end_date.toDate();
        
        // Calculate remaining days using date difference (Firebase timestamps are already in UTC)
        const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const remainingDays = Math.max(0, Math.floor((endDateOnly.getTime() - nowDateOnly.getTime()) / (1000 * 60 * 60 * 24)));
        
        // Calculate total earned based on days passed
        const startDate = subscriptionData.start_date.toDate();
        
        // Calculate days passed using date difference (Firebase timestamps are already in UTC)
        const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const nowDateOnlyEarnings = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const daysPassed = Math.min(
          Math.max(0, Math.floor((nowDateOnlyEarnings.getTime() - startDateOnly.getTime()) / (1000 * 60 * 60 * 24))),
          subscriptionData.duration_days
        );
        
        const dailyEarning = (subscriptionData.package_price * parseFloat(subscriptionData.daily_return.replace('%', ''))) / 100;
        const totalEarned = Math.max(0, daysPassed * dailyEarning);
        
        // Calculate earnings since last update to ensure fair daily payments
        const lastEarningsUpdate = subscriptionData.last_earnings_update ? 
          subscriptionData.last_earnings_update.toDate() : startDate;
        
        const lastUpdateDateOnly = new Date(lastEarningsUpdate.getFullYear(), lastEarningsUpdate.getMonth(), lastEarningsUpdate.getDate());
        const daysSinceLastUpdate = Math.max(0, Math.floor((nowDateOnlyEarnings.getTime() - lastUpdateDateOnly.getTime()) / (1000 * 60 * 60 * 24)));
        
        // Calculate the effective end date for earnings (subscription end or current date, whichever is earlier)
        const endDateOnlyEarnings = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        const effectiveEndDate = nowDateOnlyEarnings.getTime() > endDateOnlyEarnings.getTime() ? endDateOnlyEarnings : nowDateOnlyEarnings;
        
        // Calculate days since last update, but don't exceed subscription duration
        const effectiveDaysSinceLastUpdate = Math.min(
          daysSinceLastUpdate,
          Math.max(0, Math.floor((effectiveEndDate.getTime() - lastUpdateDateOnly.getTime()) / (1000 * 60 * 60 * 24)))
        );
        
        // Only add earnings for new days since last update, respecting subscription duration
        const newEarnings = effectiveDaysSinceLastUpdate * dailyEarning;
        
        // Update status based on remaining days
        let status = subscriptionData.status;
        if (remainingDays <= 0 && status === 'active') {
          status = 'completed';
          // Update the document status
          doc.ref.update({
            status: 'completed',
            updated_at: admin.firestore.FieldValue.serverTimestamp()
          });
        }
        
        // Add new earnings to total if there are any
        if (newEarnings > 0) {
          totalEarningsToAdd += newEarnings;
          
          // Update the subscription with new earnings and last update timestamp
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
      
      // Automatically update user balance if there are earnings to add
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
            
            
            // Send notification to admin about automatic earnings
            try {
              await this.telegramNotificationService.sendAutomaticEarningsNotification(userId, totalEarningsToAdd);
            } catch (notificationError) {
              console.warn('⚠️ Failed to send automatic earnings notification:', notificationError);
            }
          }
        } catch (balanceUpdateError) {
          console.error('❌ Error updating user balance:', balanceUpdateError);
          // Don't fail the entire request if balance update fails
        }
      }
      
      // Sort by creation date (newest first)
      subscriptions.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
      
      return subscriptions;
      
    } catch (error) {
      console.error('❌ Error fetching user subscriptions:', error);
      return [];
    }
  }

  async getSubscriptionById(subscriptionId: string) {
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
      
      // Calculate remaining days
      const now = new Date();
      const endDate = subscriptionData.end_date.toDate();
      
      // Calculate remaining days using date difference (Firebase timestamps are already in UTC)
      const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const remainingDays = Math.max(0, Math.floor((endDateOnly.getTime() - nowDateOnly.getTime()) / (1000 * 60 * 60 * 24)));
      
      // Calculate total earned based on days passed
      const startDate = subscriptionData.start_date.toDate();
      
      // Calculate days passed using date difference (Firebase timestamps are already in UTC)
      const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const nowDateOnlyEarnings = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const daysPassed = Math.min(
        Math.max(0, Math.floor((nowDateOnlyEarnings.getTime() - startDateOnly.getTime()) / (1000 * 60 * 60 * 24))),
        subscriptionData.duration_days
      );
      
      const dailyEarning = (subscriptionData.package_price * parseFloat(subscriptionData.daily_return.replace('%', ''))) / 100;
      const totalEarned = Math.max(0, daysPassed * dailyEarning);
      
      // Calculate earnings since last update to ensure fair daily payments
      const lastEarningsUpdate = subscriptionData.last_earnings_update ? 
        subscriptionData.last_earnings_update.toDate() : startDate;
      
      const lastUpdateDateOnly = new Date(lastEarningsUpdate.getFullYear(), lastEarningsUpdate.getMonth(), lastEarningsUpdate.getDate());
      const daysSinceLastUpdate = Math.max(0, Math.floor((nowDateOnlyEarnings.getTime() - lastUpdateDateOnly.getTime()) / (1000 * 60 * 60 * 24)));
      
      // Calculate the effective end date for earnings (subscription end or current date, whichever is earlier)
      const endDateOnlyEarnings = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      const effectiveEndDate = nowDateOnlyEarnings.getTime() > endDateOnlyEarnings.getTime() ? endDateOnlyEarnings : nowDateOnlyEarnings;
      
      // Calculate days since last update, but don't exceed subscription duration
      const effectiveDaysSinceLastUpdate = Math.min(
        daysSinceLastUpdate,
        Math.max(0, Math.floor((effectiveEndDate.getTime() - lastUpdateDateOnly.getTime()) / (1000 * 60 * 60 * 24)))
      );
      
      // Only add earnings for new days since last update, respecting subscription duration
      const newEarnings = effectiveDaysSinceLastUpdate * dailyEarning;
      
      // Update status based on remaining days
      let status = subscriptionData.status;
      if (remainingDays <= 0 && status === 'active') {
        status = 'completed';
        await subscriptionRef.update({
          status: 'completed',
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      
      // Add new earnings to user balance if there are any
      if (newEarnings > 0) {
        try {
          // Update user balance with earned amount
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
            
            // Update the subscription with new earnings and last update timestamp
            await subscriptionRef.update({
              total_earned: totalEarned,
              last_earnings_update: admin.firestore.Timestamp.fromDate(now),
              updated_at: admin.firestore.FieldValue.serverTimestamp()
            });
            
            // Send notification to admin about automatic earnings
            try {
              await this.telegramNotificationService.sendAutomaticEarningsNotification(subscriptionData.user_id, newEarnings);
            } catch (notificationError) {
              console.warn('⚠️ Failed to send automatic earnings notification:', notificationError);
            }
          }
        } catch (balanceUpdateError) {
          console.error('❌ Error updating user balance:', balanceUpdateError);
          // Don't fail the entire request if balance update fails
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
      
    } catch (error) {
      return null;
    }
  }
} 