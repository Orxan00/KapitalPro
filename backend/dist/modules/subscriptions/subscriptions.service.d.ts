import { ConfigService } from '../../config/config.service';
import { TelegramNotificationService } from '../../lib/telegram-notification.service';
import { CreateSubscriptionDto, SubscriptionResponseDto } from './dto';
export declare class SubscriptionsService {
    private configService;
    private telegramNotificationService;
    private db;
    constructor(configService: ConfigService, telegramNotificationService: TelegramNotificationService);
    createSubscription(subscriptionData: CreateSubscriptionDto): Promise<{
        success: boolean;
        message: string;
        currentBalance?: undefined;
        requiredAmount?: undefined;
        subscription_id?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        currentBalance: any;
        requiredAmount: number;
        subscription_id?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        subscription_id: string;
        currentBalance?: undefined;
        requiredAmount?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        currentBalance?: undefined;
        requiredAmount?: undefined;
        subscription_id?: undefined;
    }>;
    getUserSubscriptions(userId: string): Promise<SubscriptionResponseDto[]>;
    getSubscriptionById(subscriptionId: string): Promise<{
        id: string;
        user_id: any;
        package_name: any;
        package_price: any;
        daily_return: any;
        duration_days: any;
        total_return: any;
        start_date: any;
        end_date: any;
        status: any;
        total_earned: number;
        remaining_days: number;
        last_earnings_update: any;
        created_at: any;
        updated_at: any;
    } | null>;
}
