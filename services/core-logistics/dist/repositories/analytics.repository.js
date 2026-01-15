"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsRepository = void 0;
const supabase_1 = require("../utils/supabase");
const logger_1 = __importDefault(require("../utils/logger"));
class AnalyticsRepository {
    constructor() {
        this.supabase = (0, supabase_1.getSupabase)();
    }
    async create(analyticData) {
        try {
            const { data, error } = await this.supabase
                .from('service_analytics')
                .insert(analyticData)
                .select()
                .single();
            if (error) {
                logger_1.default.error('Error creating analytics record:', error);
                throw error;
            }
            return data;
        }
        catch (error) {
            logger_1.default.error('Repository error in create analytics:', error);
            throw error;
        }
    }
    async getUserServiceHistory(userId, limit = 50) {
        try {
            const { data, error } = await this.supabase
                .from('service_analytics')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);
            if (error) {
                logger_1.default.error('Error fetching user service history:', error);
                throw error;
            }
            return data || [];
        }
        catch (error) {
            logger_1.default.error('Repository error in getUserServiceHistory:', error);
            throw error;
        }
    }
}
exports.AnalyticsRepository = AnalyticsRepository;
//# sourceMappingURL=analytics.repository.js.map