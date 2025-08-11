import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    createSubscription(createSubscriptionDto: CreateSubscriptionDto): Promise<{
        success: boolean;
        message: string;
        subscription_id: string | undefined;
        currentBalance?: undefined;
        requiredAmount?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        currentBalance: any;
        requiredAmount: number | undefined;
        subscription_id?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        subscription_id?: undefined;
        currentBalance?: undefined;
        requiredAmount?: undefined;
    }>;
    getUserSubscriptions(userId: string): Promise<{
        success: boolean;
        data: import("./dto").SubscriptionResponseDto[];
        count: number;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
        count?: undefined;
    }>;
    getSubscriptionById(subscriptionId: string): Promise<{
        success: boolean;
        data: {
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
        };
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
}
