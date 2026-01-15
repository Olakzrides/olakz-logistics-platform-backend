import { ServiceChannelRepository } from '../repositories/service-channel.repository';
import { AdvertisementRepository } from '../repositories/advertisement.repository';
import { UserSessionRepository } from '../repositories/user-session.repository';
import { AnalyticsService } from './analytics.service';
import { StoreInitResponse, UserServiceSession } from '../types/store.types';
export declare class StoreService {
    private serviceChannelRepo;
    private advertisementRepo;
    private userSessionRepo;
    private analyticsService;
    constructor(serviceChannelRepo: ServiceChannelRepository, advertisementRepo: AdvertisementRepository, userSessionRepo: UserSessionRepository, analyticsService: AnalyticsService);
    getStoreInitData(userId?: string): Promise<StoreInitResponse>;
    createServiceSession(userId: string, serviceChannelName: string, sessionData: any): Promise<UserServiceSession>;
    getUserActiveServiceSession(userId: string): Promise<UserServiceSession | null>;
    private getFallbackServices;
    private getFallbackAds;
    private getFallbackStoreData;
    private getVendorsData;
}
//# sourceMappingURL=store.service.d.ts.map