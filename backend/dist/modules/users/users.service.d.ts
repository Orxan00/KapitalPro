import * as admin from 'firebase-admin';
import { ConfigService } from '../../config/config.service';
export declare class UsersService {
    private configService;
    private db;
    constructor(configService: ConfigService);
    getUser(userId: string): Promise<{
        success: boolean;
        data: admin.firestore.DocumentData | undefined;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getUserBalance(userId: string): Promise<{
        success: boolean;
        balance: any;
        userId: string;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        balance: number;
        userId?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        balance: number;
        userId?: undefined;
    }>;
    updateUserBalance(userId: string, newBalance: number): Promise<{
        success: boolean;
        message: string;
        balance: number;
        userId: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        balance?: undefined;
        userId?: undefined;
    }>;
    getUserDeposits(userId: string): Promise<{
        success: boolean;
        data: any[];
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getUserWithdrawals(userId: string): Promise<{
        success: boolean;
        data: any[];
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
}
