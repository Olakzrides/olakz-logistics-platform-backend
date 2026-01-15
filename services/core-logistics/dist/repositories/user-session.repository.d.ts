import { UserServiceSession } from '../types/store.types';
export declare class UserSessionRepository {
    private supabase;
    create(sessionData: {
        user_id: string;
        service_channel_id: string;
        session_data: Record<string, any>;
        is_active: boolean;
    }): Promise<UserServiceSession>;
    findActiveByUserId(userId: string): Promise<UserServiceSession | null>;
    deactivateUserSessions(userId: string): Promise<void>;
    updateLastActivity(sessionId: string): Promise<void>;
}
//# sourceMappingURL=user-session.repository.d.ts.map