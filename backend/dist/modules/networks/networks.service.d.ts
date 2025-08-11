import { ConfigService } from '../../config/config.service';
export declare class NetworksService {
    private configService;
    private db;
    constructor(configService: ConfigService);
    getNetworks(): Promise<{
        success: boolean;
        data: {
            id: string;
        }[];
    }>;
    private getFallbackNetworks;
}
