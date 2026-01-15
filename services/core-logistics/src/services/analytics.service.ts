import { AnalyticsRepository } from '../repositories/analytics.repository';
import logger from '../utils/logger';
import config from '../config';

export class AnalyticsService {
  constructor(private analyticsRepo: AnalyticsRepository) {}

  async trackServiceView(userId: string | undefined, actionType: string): Promise<void> {
    if (!config.analytics.enabled || !userId) {
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
    } catch (error) {
      logger.warn('Failed to track service view:', error);
    }
  }

  async trackServiceSelection(
    userId: string,
    serviceChannelId: string,
    metadata: Record<string, any>
  ): Promise<void> {
    if (!config.analytics.enabled) {
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
    } catch (error) {
      logger.warn('Failed to track service selection:', error);
    }
  }
}
