"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_controller_1 = require("../controllers/store.controller");
const store_service_1 = require("../services/store.service");
const analytics_service_1 = require("../services/analytics.service");
const service_channel_repository_1 = require("../repositories/service-channel.repository");
const advertisement_repository_1 = require("../repositories/advertisement.repository");
const user_session_repository_1 = require("../repositories/user-session.repository");
const analytics_repository_1 = require("../repositories/analytics.repository");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const store_validator_1 = require("../validators/store.validator");
const router = (0, express_1.Router)();
// Initialize dependencies
const serviceChannelRepo = new service_channel_repository_1.ServiceChannelRepository();
const advertisementRepo = new advertisement_repository_1.AdvertisementRepository();
const userSessionRepo = new user_session_repository_1.UserSessionRepository();
const analyticsRepo = new analytics_repository_1.AnalyticsRepository();
const analyticsService = new analytics_service_1.AnalyticsService(analyticsRepo);
const storeService = new store_service_1.StoreService(serviceChannelRepo, advertisementRepo, userSessionRepo, analyticsService);
const storeController = new store_controller_1.StoreController(storeService);
// Routes
router.get('/init', auth_middleware_1.optionalAuth, storeController.getStoreInit);
router.post('/select', auth_middleware_1.requireAuth, (0, validation_middleware_1.validate)(store_validator_1.serviceSelectionSchema), storeController.selectService);
router.get('/context', auth_middleware_1.requireAuth, storeController.getServiceContext);
exports.default = router;
//# sourceMappingURL=store.routes.js.map