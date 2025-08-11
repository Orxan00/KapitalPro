import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class NetworksService {
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

  async getNetworks() {
    try {
      const networks = await this.db.collection('networks').get();
      const data = networks.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // If no networks in database, return fallback networks
      if (data.length === 0) {
        return { success: true, data: this.getFallbackNetworks() };
      }
      
      return { success: true, data };
    } catch (error) {
      // Return fallback networks on error
      return { success: true, data: this.getFallbackNetworks() };
    }
  }

  private getFallbackNetworks() {
    return [
      // Deposit networks
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
      // Withdrawal networks
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
} 