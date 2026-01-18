"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreController = void 0;
const response_1 = __importDefault(require("../utils/response"));
const logger_1 = __importDefault(require("../utils/logger"));
class StoreController {
    constructor(storeService) {
        this.storeService = storeService;
        this.getStoreInit = async (req, res) => {
            try {
                const userId = req.user?.id;
                const storeData = await this.storeService.getStoreInitData(userId);
                return response_1.default.success(res, storeData, 'Store data retrieved successfully');
            }
            catch (error) {
                logger_1.default.error('Store init error:', error);
                return response_1.default.error(res, 'Failed to load store data', 500);
            }
        };
        this.selectService = async (req, res) => {
            try {
                const userId = req.user?.id;
                if (!userId) {
                    return response_1.default.error(res, 'Authentication required', 401);
                }
                const { service_channel_name, user_location, metadata } = req.body;
                const session = await this.storeService.createServiceSession(userId, service_channel_name, { user_location, metadata });
                return response_1.default.success(res, {
                    session_id: session.id,
                    service_context: {
                        service_name: session.session_data.service_name,
                        service_description: session.session_data.service_description,
                    },
                }, 'Service selected successfully', 200);
            }
            catch (error) {
                logger_1.default.error('Service selection error:', error);
                if (error.name === 'NotFoundError') {
                    return response_1.default.error(res, error.message, 404);
                }
                return response_1.default.error(res, 'Failed to track service selection', 500);
            }
        };
        this.getServiceContext = async (req, res) => {
            try {
                const userId = req.user?.id;
                if (!userId) {
                    return response_1.default.error(res, 'Authentication required', 401);
                }
                const activeSession = await this.storeService.getUserActiveServiceSession(userId);
                if (!activeSession) {
                    return response_1.default.success(res, {
                        has_active_session: false,
                        message: 'No active service session',
                    }, 'No active service session');
                }
                return response_1.default.success(res, {
                    has_active_session: true,
                    session_id: activeSession.id,
                    service_channel: {
                        id: activeSession.service_channel_id,
                        name: activeSession.service_channel?.name,
                        description: activeSession.service_channel?.description,
                    },
                    session_data: activeSession.session_data,
                    started_at: activeSession.started_at,
                    last_activity_at: activeSession.last_activity_at,
                }, 'Service context retrieved successfully');
            }
            catch (error) {
                logger_1.default.error('Get service context error:', error);
                return response_1.default.error(res, 'Failed to get service context', 500);
            }
        };
    }
}
exports.StoreController = StoreController;
//# sourceMappingURL=store.controller.js.map