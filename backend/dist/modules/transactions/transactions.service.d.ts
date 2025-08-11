import { ConfigService } from '../../config/config.service';
import { TelegramNotificationService } from '../../lib/telegram-notification.service';
export declare class TransactionsService {
    private configService;
    private telegramNotificationService;
    private db;
    constructor(configService: ConfigService, telegramNotificationService: TelegramNotificationService);
    createDeposit(depositData: any): Promise<{
        success: boolean;
        message: string;
        transaction_id: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        transaction_id?: undefined;
    }>;
    createWithdrawal(withdrawalData: any): Promise<{
        success: boolean;
        message: string;
        currentBalance?: undefined;
        requestedAmount?: undefined;
        transaction_id?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        currentBalance: any;
        requestedAmount: number;
        transaction_id?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        transaction_id: string;
        currentBalance?: undefined;
        requestedAmount?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        currentBalance?: undefined;
        requestedAmount?: undefined;
        transaction_id?: undefined;
    }>;
}
