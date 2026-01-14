import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import userService from '../services/user.service';
import ResponseUtil from '../utils/response';

class UserController {
  /**
   * Get current user
   */
  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const user = await userService.getUserById(authReq.user!.userId);
      ResponseUtil.success(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const user = await userService.updateProfile(authReq.user!.userId, req.body);
      ResponseUtil.success(res, user, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user role
   */
  async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const user = await userService.updateRole(authReq.user!.userId, req.body.role);
      ResponseUtil.success(res, user, 'Role updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password
   */
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      await userService.changePassword(
        authReq.user!.userId,
        req.body.currentPassword,
        req.body.newPassword
      );
      ResponseUtil.success(res, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();