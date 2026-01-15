"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvertisementRepository = void 0;
const supabase_1 = require("../utils/supabase");
const logger_1 = __importDefault(require("../utils/logger"));
class AdvertisementRepository {
    constructor() {
        this.supabase = (0, supabase_1.getSupabase)();
    }
    async findActiveOrderedByRank() {
        try {
            const { data, error } = await this.supabase
                .from('advertisements')
                .select('*')
                .eq('is_active', true)
                .order('metadata->adsRank', { ascending: true });
            if (error) {
                logger_1.default.error('Error fetching advertisements:', error);
                throw error;
            }
            return data || [];
        }
        catch (error) {
            logger_1.default.error('Repository error in findActiveOrderedByRank:', error);
            throw error;
        }
    }
}
exports.AdvertisementRepository = AdvertisementRepository;
//# sourceMappingURL=advertisement.repository.js.map