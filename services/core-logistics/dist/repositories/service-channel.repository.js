"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceChannelRepository = void 0;
const supabase_1 = require("../utils/supabase");
const logger_1 = __importDefault(require("../utils/logger"));
class ServiceChannelRepository {
    constructor() {
        this.supabase = (0, supabase_1.getSupabase)();
    }
    async findActiveWithProducts() {
        try {
            const { data, error } = await this.supabase
                .from('service_channels')
                .select(`
          *,
          product:products(*)
        `)
                .eq('is_active', true)
                .order('metadata->rank', { ascending: true });
            if (error) {
                logger_1.default.error('Error fetching service channels:', error);
                throw error;
            }
            return data || [];
        }
        catch (error) {
            logger_1.default.error('Repository error in findActiveWithProducts:', error);
            throw error;
        }
    }
    async findByName(name) {
        try {
            const { data, error } = await this.supabase
                .from('service_channels')
                .select('*')
                .eq('name', name)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    return null;
                }
                logger_1.default.error('Error fetching service channel by name:', error);
                throw error;
            }
            return data;
        }
        catch (error) {
            logger_1.default.error('Repository error in findByName:', error);
            throw error;
        }
    }
    async countActive() {
        try {
            const { count, error } = await this.supabase
                .from('service_channels')
                .select('*', { count: 'exact', head: true })
                .eq('is_active', true);
            if (error) {
                logger_1.default.error('Error counting active service channels:', error);
                throw error;
            }
            return count || 0;
        }
        catch (error) {
            logger_1.default.error('Repository error in countActive:', error);
            throw error;
        }
    }
}
exports.ServiceChannelRepository = ServiceChannelRepository;
//# sourceMappingURL=service-channel.repository.js.map