"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreService = void 0;
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
class StoreService {
    constructor(serviceChannelRepo, advertisementRepo, userSessionRepo, analyticsService) {
        this.serviceChannelRepo = serviceChannelRepo;
        this.advertisementRepo = advertisementRepo;
        this.userSessionRepo = userSessionRepo;
        this.analyticsService = analyticsService;
    }
    async getStoreInitData(userId) {
        try {
            const [serviceChannels, advertisements] = await Promise.allSettled([
                this.serviceChannelRepo.findActiveWithProducts(),
                this.advertisementRepo.findActiveOrderedByRank(),
            ]);
            const services = serviceChannels.status === 'fulfilled'
                ? serviceChannels.value
                : this.getFallbackServices();
            const ads = advertisements.status === 'fulfilled'
                ? advertisements.value
                : this.getFallbackAds();
            if (userId) {
                await this.analyticsService.trackServiceView(userId, 'home_page_load');
            }
            const mainServices = services.filter((sc) => !['mobile_ride_sc', 'mobile_delivery_sc'].includes(sc.name));
            return {
                supported_sales_channels: services,
                ads: ads,
                main_services: mainServices,
                vendors: await this.getVendorsData(),
            };
        }
        catch (error) {
            logger_1.default.error('Store init failed, returning fallback data:', error);
            return this.getFallbackStoreData();
        }
    }
    async createServiceSession(userId, serviceChannelName, sessionData) {
        const serviceChannel = await this.serviceChannelRepo.findByName(serviceChannelName);
        if (!serviceChannel) {
            throw new errors_1.NotFoundError(`Service channel not found: ${serviceChannelName}`);
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
        await this.analyticsService.trackServiceSelection(userId, serviceChannel.id, sessionData);
        return session;
    }
    async getUserActiveServiceSession(userId) {
        return await this.userSessionRepo.findActiveByUserId(userId);
    }
    getFallbackServices() {
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
    getFallbackAds() {
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
    getFallbackStoreData() {
        return {
            supported_sales_channels: this.getFallbackServices(),
            ads: this.getFallbackAds(),
            main_services: [],
            vendors: this.getVendorsData(),
        };
    }
    getVendorsData() {
        return {
            trending: { data: [] },
            new: { data: [] },
            featured: { data: [] },
            nearby: { data: [] },
        };
    }
}
exports.StoreService = StoreService;
//# sourceMappingURL=store.service.js.map