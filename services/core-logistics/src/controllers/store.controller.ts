import { Request, Response } from 'express';
import { StoreService } from '../services/store.service';
import ResponseUtil from '../utils/response';
import logger from '../utils/logger';

export class StoreController {
  constructor(private storeService: StoreService) {}

  getStoreInit = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const storeData = await this.storeService.getStoreInitData(userId);

      return ResponseUtil.success(res, storeData, 'Store data retrieved successfully');
    } catch (error: any) {
      logger.error('Store init error:', error);
      return ResponseUtil.error(res, 'Failed to load store data', 500);
    }
  };

  selectService = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return ResponseUtil.error(res, 'Authentication required', 401);
      }

      const { service_channel_name, user_location, metadata } = req.body;

      const session = await this.storeService.createServiceSession(
        userId,
        service_channel_name,
        { user_location, metadata }
      );

      return ResponseUtil.success(
        res,
        {
          session_id: session.id,
          service_context: {
            service_name: session.session_data.service_name,
            service_description: session.session_data.service_description,
          },
        },
        'Service selected successfully',
        200
      );
    } catch (error: any) {
      logger.error('Service selection error:', error);
      
      if (error.name === 'NotFoundError') {
        return ResponseUtil.error(res, error.message, 404);
      }
      
      return ResponseUtil.error(res, 'Failed to track service selection', 500);
    }
  };

  getServiceContext = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return ResponseUtil.error(res, 'Authentication required', 401);
      }

      const activeSession = await this.storeService.getUserActiveServiceSession(userId);

      if (!activeSession) {
        return ResponseUtil.success(
          res,
          {
            has_active_session: false,
            message: 'No active service session',
          },
          'No active service session'
        );
      }

      return ResponseUtil.success(
        res,
        {
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
        },
        'Service context retrieved successfully'
      );
    } catch (error: any) {
      logger.error('Get service context error:', error);
      return ResponseUtil.error(res, 'Failed to get service context', 500);
    }
  };
}
