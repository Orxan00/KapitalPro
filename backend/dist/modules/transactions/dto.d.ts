export declare class CreateDepositDto {
    user_id: string;
    network: string;
    network_name: string;
    amount: number;
    transaction_ref: string;
    user_first_name?: string;
    user_last_name?: string;
    user_username?: string;
}
export declare class CreateWithdrawalDto {
    user_id: string;
    network: string;
    network_name: string;
    amount: number;
    withdrawal_address: string;
    user_first_name?: string;
    user_last_name?: string;
    user_username?: string;
}
