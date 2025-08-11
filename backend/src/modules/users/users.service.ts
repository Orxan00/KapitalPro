import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class UsersService {
  private db: admin.firestore.Firestore;

  constructor(private configService: ConfigService) {
    // Initialize Firebase Admin SDK with config
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

  async getUser(userId: string) {
    try {
      const userDoc = await this.db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        return { success: true, data: userDoc.data() };
      }
      return { success: false, message: 'User not found' };
    } catch (error) {
      return { success: false, message: 'Error fetching user', error: error.message };
    }
  }

  async getUserBalance(userId: string) {
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
    } catch (error) {
      return { success: false, message: 'Error fetching balance', error: error.message, balance: 0 };
    }
  }

  async updateUserBalance(userId: string, newBalance: number) {
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
    } catch (error) {
      return { success: false, message: 'Error updating balance', error: error.message };
    }
  }

  async getUserDeposits(userId: string) {
    try {
      const depositsRef = this.db.collection('deposits');
      const query = depositsRef.where('user_id', '==', userId);
      const querySnapshot = await query.get();
      
      const deposits = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      // Sort in memory instead of using Firestore orderBy
      deposits.sort((a, b) => {
        const dateA = a.created_at?.toDate?.() || new Date(a.created_at);
        const dateB = b.created_at?.toDate?.() || new Date(b.created_at);
        return dateB.getTime() - dateA.getTime(); // Descending order
      });
      
      return { success: true, data: deposits };
    } catch (error) {
      return { success: false, message: 'Error fetching deposits', error: error.message };
    }
  }

  async getUserWithdrawals(userId: string) {
    try {
      const withdrawalsRef = this.db.collection('withdrawals');
      const query = withdrawalsRef.where('user_id', '==', userId);
      const querySnapshot = await query.get();
      
      const withdrawals = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      // Sort in memory instead of using Firestore orderBy
      withdrawals.sort((a, b) => {
        const dateA = a.created_at?.toDate?.() || new Date(a.created_at);
        const dateB = b.created_at?.toDate?.() || new Date(b.created_at);
        return dateB.getTime() - dateA.getTime(); // Descending order
      });
      
      return { success: true, data: withdrawals };
    } catch (error) {
      return { success: false, message: 'Error fetching withdrawals', error: error.message };
    }
  }
} 