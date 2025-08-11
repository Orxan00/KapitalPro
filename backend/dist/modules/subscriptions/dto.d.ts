export declare class CreateSubscriptionDto {
    user_id: string;
    user_username?: string;
    user_first_name?: string;
    user_last_name?: string;
    package_name: string;
    package_price: number;
    daily_return: string;
    duration_days: number;
    total_return: number;
}
export declare class SubscriptionResponseDto {
    id: string;
    user_id: string;
    package_name: string;
    package_price: number;
    daily_return: string;
    duration_days: number;
    total_return: number;
    start_date: Date;
    end_date: Date;
    status: 'active' | 'completed' | 'pending';
    total_earned: number;
    remaining_days: number;
    last_earnings_update: Date;
    created_at: Date;
    updated_at: Date;
}
