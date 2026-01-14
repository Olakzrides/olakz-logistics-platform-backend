import { Router } from 'express';
import userController from '../controllers/user.controller';
import { authMiddleware, validateRequest } from '../middleware/auth.middleware';
import {
  updateProfileValidator,
  updateRoleValidator,
  changePasswordValidator,
} from '../validators/user.validator';

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

router.get('/me', userController.getCurrentUser);
router.put('/profile', validateRequest(updateProfileValidator), userController.updateProfile);
router.put('/role', validateRequest(updateRoleValidator), userController.updateRole);
router.patch('/password', validateRequest(changePasswordValidator), userController.changePassword);

export default router;