import { ConfigService } from '../config/config.service';
export declare class TelegramNotificationService {
    private configService;
    private botToken;
    private adminId;
    constructor(configService: ConfigService);
    sendDepositNotification(depositData: any, depositId: string): Promise<boolean>;
    sendWithdrawalNotification(withdrawalData: any, withdrawalId: string): Promise<boolean>;
    sendSubscriptionNotification(subscriptionData: any, subscriptionId: string): Promise<boolean>;
    sendAutomaticEarningsNotification(userId: string, totalEarnings: number): Promise<boolean>;
    private formatDepositMessage;
    private formatWithdrawalMessage;
    private formatSubscriptionMessage;
    private formatAutomaticEarningsMessage;
}
