"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSessionRepository = void 0;
const supabase_1 = require("../utils/supabase");
const logger_1 = __importDefault(require("../utils/logger"));
class UserSessionRepository {
    constructor() {
        this.supabase = (0, supabase_1.getSupabase)();
    }
    async create(sessionData) {
        try {
            const { data, error } = await this.supabase
                .from('user_service_sessions')
                .insert(sessionData)
                .select()
                .single();
            if (error) {
                logger_1.default.error('Error creating user session:', error);
                throw error;
            }
            return data;
        }
        catch (error) {
            logger_1.default.error('Repository error in create:', error);
            throw error;
        }
    }
    async findActiveByUserId(userId) {
        try {
            const { data, error } = await this.supabase
                .from('user_service_sessions')
                .select(`
          *,
          service_channel:service_channels(*)
        `)
                .eq('user_id', userId)
                .eq('is_active', true)
                .order('last_activity_at', { ascending: false })
                .limit(1)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    return null;
                }
                logger_1.default.error('Error fetching active user session:', error);
                throw error;
            }
            return data;
        }
        catch (error) {
            logger_1.default.error('Repository error in findActiveByUserId:', error);
            throw error;
        }
    }
    async deactivateUserSessions(userId) {
        try {
            const { error } = await this.supabase
                .from('user_service_sessions')
                .update({ is_active: false })
                .eq('user_id', userId)
                .eq('is_active', true);
            if (error) {
                logger_1.default.error('Error deactivating user sessions:', error);
                throw error;
            }
        }
        catch (error) {
            logger_1.default.error('Repository error in deactivateUserSessions:', error);
            throw error;
        }
    }
    async updateLastActivity(sessionId) {
        try {
            const { error } = await this.supabase
                .from('user_service_sessions')
                .update({ last_activity_at: new Date().toISOString() })
                .eq('id', sessionId);
            if (error) {
                logger_1.default.error('Error updating session activity:', error);
                throw error;
            }
        }
        catch (error) {
            logger_1.default.error('Repository error in updateLastActivity:', error);
            throw error;
        }
    }
}
exports.UserSessionRepository = UserSessionRepository;
//# sourceMappingURL=user-session.repository.js.map