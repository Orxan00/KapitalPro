export declare class ConfigService {
    get firebaseProjectId(): string;
    get firebasePrivateKey(): string;
    get firebaseClientEmail(): string;
    get firebaseServiceAccountPath(): string;
    get telegramAdminId(): string;
    get telegramBotToken(): string;
    get port(): number;
    get nodeEnv(): string;
    get corsOrigins(): string[];
    get firebaseConfig(): any;
}
