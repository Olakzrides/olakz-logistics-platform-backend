"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const config_1 = __importDefault(require("../config"));
class AnalyticsService {
    constructor(analyticsRepo) {
        this.analyticsRepo = analyticsRepo;
    }
    async trackServiceView(userId, actionType) {
        if (!config_1.default.analytics.enabled || !userId) {
            return;
        }
        try {
            await this.analyticsRepo.create({
                user_id: userId,
                service_channel_id: '00000000-0000-0000-0000-000000000000', // Placeholder for home page
                action_type: actionType,
                metadata: {
                    timestamp: new Date().toISOString(),
                },
            });
        }
        catch (error) {
            logger_1.default.warn('Failed to track service view:', error);
        }
    }
    async trackServiceSelection(userId, serviceChannelId, metadata) {
        if (!config_1.default.analytics.enabled) {
            return;
        }
        try {
            await this.analyticsRepo.create({
                user_id: userId,
                service_channel_id: serviceChannelId,
                action_type: 'select',
                metadata: {
                    ...metadata,
                    timestamp: new Date().toISOString(),
                },
            });
        }
        catch (error) {
            logger_1.default.warn('Failed to track service selection:', error);
        }
    }
}
exports.AnalyticsService = AnalyticsService;
//# sourceMappingURL=analytics.service.js.map