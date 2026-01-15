import { ServiceChannelRepository } from '../repositories/service-channel.repository';
import { AdvertisementRepository } from '../repositories/advertisement.repository';
import { UserSessionRepository } from '../repositories/user-session.repository';
import { AnalyticsService } from './analytics.service';
import {
  StoreInitResponse,
  VendorsResponse,
  ServiceChannel,
  UserServiceSession,
} from '../types/store.types';
import { NotFoundError } from '../utils/errors';
import logger from '../utils/logger';

export class StoreService {
  constructor(
    private serviceChannelRepo: ServiceChannelRepository,
    private advertisementRepo: AdvertisementRepository,
    private userSessionRepo: UserSessionRepository,
    private analyticsService: AnalyticsService
  ) {}

  async getStoreInitData(userId?: string): Promise<StoreInitResponse> {
    try {
      const [serviceChannels, advertisements] = await Promise.allSettled([
        this.serviceChannelRepo.findActiveWithProducts(),
        this.advertisementRepo.findActiveOrderedByRank(),
      ]);

      const services =
        serviceChannels.status === 'fulfilled'
          ? serviceChannels.value
          : this.getFallbackServices();

      const ads =
        advertisements.status === 'fulfilled'
          ? advertisements.value
          : this.getFallbackAds();

      if (userId) {
        await this.analyticsService.trackServiceView(userId, 'home_page_load');
      }

      const mainServices = services.filter(
        (sc) => !['mobile_ride_sc', 'mobile_delivery_sc'].includes(sc.name)
      );

      return {
        supported_sales_channels: services,
        ads: ads,
        main_services: mainServices,
        vendors: await this.getVendorsData(),
      };
    } catch (error) {
      logger.error('Store init failed, returning fallback data:', error);
      return this.getFallbackStoreData();
    }
  }

  async createServiceSession(
    userId: string,
    serviceChannelName: string,
    sessionData: any
  ): Promise<UserServiceSession> {
    const serviceChannel = await this.serviceChannelRepo.findByName(serviceChannelName);
    if (!serviceChannel) {
      throw new NotFoundError(`Service channel not found: ${serviceChannelName}`);
    }

    await this.userSessionRepo.deactivateUserSessions(userId);

    const session = await this.userSessionRepo.create({
      user_id: userId,
      service_channel_id: serviceChannel.id,
      session_data: {
        ...sessionData,
        service_name: serviceChannel.name,
        service_description: serviceChannel.description,
        selected_at: new Date().toISOString(),
      },
      is_active: true,
    });

    await this.analyticsService.trackServiceSelection(
      userId,
      serviceChannel.id,
      sessionData
    );

    return session;
  }

  async getUserActiveServiceSession(userId: string): Promise<UserServiceSession | null> {
    return await this.userSessionRepo.findActiveByUserId(userId);
  }

  private getFallbackServices(): ServiceChannel[] {
    return [
      {
        id: 'fallback-ride',
        name: 'mobile_ride_sc',
        description: 'Olakz Ride',
        is_active: true,
        metadata: { rank: 1, icon: 'mobile_ride_sc', color: '#E3F2FD' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        product: [],
      },
      {
        id: 'fallback-delivery',
        name: 'mobile_delivery_sc',
        description: 'Delivery Service',
        is_active: true,
        metadata: { rank: 2, icon: 'mobile_delivery_sc', color: '#FFF3E0' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        product: [],
      },
    ];
  }

  private getFallbackAds() {
    return [
      {
        id: 'fallback-ad',
        name: 'mobile_ride_sc',
        description: 'Get a ride anywhere',
        is_active: true,
        metadata: { adsRank: 1 },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  private getFallbackStoreData(): StoreInitResponse {
    return {
      supported_sales_channels: this.getFallbackServices(),
      ads: this.getFallbackAds(),
      main_services: [],
      vendors: this.getVendorsData(),
    };
  }

  private getVendorsData(): VendorsResponse {
    return {
      trending: { data: [] },
      new: { data: [] },
      featured: { data: [] },
      nearby: { data: [] },
    };
  }
}
