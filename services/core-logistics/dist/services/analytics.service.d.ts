import { AnalyticsRepository } from '../repositories/analytics.repository';
export declare class AnalyticsService {
    private analyticsRepo;
    constructor(analyticsRepo: AnalyticsRepository);
    trackServiceView(userId: string | undefined, actionType: string): Promise<void>;
    trackServiceSelection(userId: string, serviceChannelId: string, metadata: Record<string, any>): Promise<void>;
}
//# sourceMappingURL=analytics.service.d.ts.map