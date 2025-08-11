import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '../../config/config.service';
import { TelegramNotificationService } from '../../lib/telegram-notification.service';

@Injectable()
export class TransactionsService {
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
      } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        throw error;
      }
    }
    this.db = admin.firestore();
  }

  async createDeposit(depositData: any) {
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
      
      
      // Send admin notification
      try {
        await this.telegramNotificationService.sendDepositNotification(depositData, depositRef.id);
      } catch (notificationError) {
        console.warn('⚠️ Failed to send admin notification:', notificationError);
        // Don't fail the deposit creation if notification fails
      }
      
      return { 
        success: true, 
        message: 'Deposit created successfully', 
        transaction_id: depositRef.id 
      };
    } catch (error) {
      console.error('❌ Error creating deposit:', error);
      return { success: false, message: 'Error creating deposit', error: error.message };
    }
  }

  async createWithdrawal(withdrawalData: any) {
    try {
      // Check user balance before allowing withdrawal
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
      
      // Send admin notification
      try {
        await this.telegramNotificationService.sendWithdrawalNotification(withdrawalData, withdrawalRef.id);
      } catch (notificationError) {
        console.warn('⚠️ Failed to send withdrawal notification:', notificationError);
      }
      
      return { 
        success: true, 
        message: 'Withdrawal created successfully', 
        transaction_id: withdrawalRef.id 
      };
    } catch (error) {
      return { success: false, message: 'Error creating withdrawal', error: error.message };
    }
  }
} 