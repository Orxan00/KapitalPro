"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
const common_1 = require("@nestjs/common");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
dotenv.config();
let ConfigService = class ConfigService {
    get firebaseProjectId() {
        return process.env.FIREBASE_PROJECT_ID || '';
    }
    get firebasePrivateKey() {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;
        if (!privateKey)
            return '';
        if (privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
            return privateKey.replace(/\\n/g, '\n');
        }
        else {
            return privateKey.replace(/\\n/g, '\n');
        }
    }
    get firebaseClientEmail() {
        return process.env.FIREBASE_CLIENT_EMAIL || '';
    }
    get firebaseServiceAccountPath() {
        return process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '';
    }
    get telegramAdminId() {
        return process.env.ADMIN_ID || '';
    }
    get telegramBotToken() {
        return process.env.BOT_TOKEN || '';
    }
    get port() {
        return parseInt(process.env.PORT || '3000', 10);
    }
    get nodeEnv() {
        return process.env.NODE_ENV || 'development';
    }
    get corsOrigins() {
        return [
            'https://invest-app-neon.vercel.app',
            'https://d07d-102-218-51-16.ngrok-free.app'
        ];
    }
    get firebaseConfig() {
        const serviceAccountPath = this.firebaseServiceAccountPath;
        if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
            console.log('🔧 Using Firebase service account file:', serviceAccountPath);
            return require(path.resolve(serviceAccountPath));
        }
        const config = {
            projectId: this.firebaseProjectId,
            privateKey: this.firebasePrivateKey,
            clientEmail: this.firebaseClientEmail,
        };
        if (!config.projectId || !config.privateKey || !config.clientEmail) {
            console.error('❌ Firebase configuration incomplete. Please check your environment variables.');
            console.error('Required: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL');
            throw new Error('Firebase configuration is incomplete. Check environment variables.');
        }
        return config;
    }
};
exports.ConfigService = ConfigService;
exports.ConfigService = ConfigService = __decorate([
    (0, common_1.Injectable)()
], ConfigService);
//# sourceMappingURL=config.service.js.map