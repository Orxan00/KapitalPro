import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';


dotenv.config();

@Injectable()
export class ConfigService {
  get firebaseProjectId(): string {
    return process.env.FIREBASE_PROJECT_ID || '';
  }

  get firebasePrivateKey(): string {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!privateKey) return '';
    
    // Handle different formats of private key
    if (privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      // Already in PEM format
      return privateKey.replace(/\\n/g, '\n');
    } else {
      // JSON format - needs to be converted to PEM
      return privateKey.replace(/\\n/g, '\n');
    }
  }

  get firebaseClientEmail(): string {
    return process.env.FIREBASE_CLIENT_EMAIL || '';
  }

  get firebaseServiceAccountPath(): string {
    return process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '';
  }

  get telegramAdminId(): string {
    return process.env.ADMIN_ID || '';
  }

  get telegramBotToken(): string {
    return process.env.BOT_TOKEN || '';
  }

  get port(): number {
    return parseInt(process.env.PORT || '3000', 10);
  }

  get nodeEnv(): string {
    return process.env.NODE_ENV || 'development';
  }

  get corsOrigins(): string[] {
    return [
      'https://invest-app-neon.vercel.app',
      'https://d07d-102-218-51-16.ngrok-free.app'
    ];
  }

  get firebaseConfig() {
    // Try to use service account file first
    const serviceAccountPath = this.firebaseServiceAccountPath;
    if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
      console.log('🔧 Using Firebase service account file:', serviceAccountPath);
      return require(path.resolve(serviceAccountPath));
    }

    // Fall back to environment variables
    const config = {
      projectId: this.firebaseProjectId,
      privateKey: this.firebasePrivateKey,
      clientEmail: this.firebaseClientEmail,
    };

    // Validate configuration
    if (!config.projectId || !config.privateKey || !config.clientEmail) {
      console.error('❌ Firebase configuration incomplete. Please check your environment variables.');
      console.error('Required: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL');
      throw new Error('Firebase configuration is incomplete. Check environment variables.');
    }

    return config;
  }
} 