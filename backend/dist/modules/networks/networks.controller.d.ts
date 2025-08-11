import { NetworksService } from './networks.service';
export declare class NetworksController {
    private readonly networksService;
    constructor(networksService: NetworksService);
    getNetworks(): Promise<{
        success: boolean;
        data: {
            id: string;
        }[];
    }>;
}
