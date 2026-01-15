import { ServiceChannel } from '../types/store.types';
export declare class ServiceChannelRepository {
    private supabase;
    findActiveWithProducts(): Promise<ServiceChannel[]>;
    findByName(name: string): Promise<ServiceChannel | null>;
    countActive(): Promise<number>;
}
//# sourceMappingURL=service-channel.repository.d.ts.map