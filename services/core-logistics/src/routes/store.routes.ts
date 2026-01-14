import { Router } from 'express';
import { StoreController } from '../controllers/store.controller';
import { StoreService } from '../services/store.service';
import { AnalyticsService } from '../services/analytics.service';
import { ServiceChannelRepository } from '../repositories/service-channel.repository';
import { AdvertisementRepository } from '../repositories/advertisement.repository';
import { UserSessionRepository } from '../repositories/user-session.repository';
import { AnalyticsRepository } from '../repositories/analytics.repository';
import { optionalAuth, requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { serviceSelectionSchema } from '../validators/store.validator';

const router = Router();

// Initialize dependencies
const serviceChannelRepo = new ServiceChannelRepository();
const advertisementRepo = new AdvertisementRepository();
const userSessionRepo = new UserSessionRepository();
const analyticsRepo = new AnalyticsRepository();
const analyticsService = new AnalyticsService(analyticsRepo);
const storeService = new StoreService(
  serviceChannelRepo,
  advertisementRepo,
  userSessionRepo,
  analyticsService
);
const storeController = new StoreController(storeService);

// Routes
router.get('/init', optionalAuth, storeController.getStoreInit);
router.post('/select', requireAuth, validate(serviceSelectionSchema), storeController.selectService);
router.get('/context', requireAuth, storeController.getServiceContext);

export default router;
