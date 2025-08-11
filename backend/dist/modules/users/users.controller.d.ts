import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getUser(userId: string): Promise<{
        success: boolean;
        data: FirebaseFirestore.DocumentData | undefined;
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
    updateUserBalance(userId: string, body: {
        balance: number;
    }): Promise<{
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
