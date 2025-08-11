import { TransactionsService } from './transactions.service';
import { CreateDepositDto, CreateWithdrawalDto } from './dto';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    createDeposit(depositData: CreateDepositDto): Promise<{
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
    createWithdrawal(withdrawalData: CreateWithdrawalDto): Promise<{
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
