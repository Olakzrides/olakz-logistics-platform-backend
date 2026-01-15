import { ServiceAnalytic } from '../types/store.types';
export declare class AnalyticsRepository {
    private supabase;
    create(analyticData: {
        user_id?: string;
        service_channel_id: string;
        action_type: string;
        metadata: Record<string, any>;
    }): Promise<ServiceAnalytic>;
    getUserServiceHistory(userId: string, limit?: number): Promise<ServiceAnalytic[]>;
}
//# sourceMappingURL=analytics.repository.d.ts.map