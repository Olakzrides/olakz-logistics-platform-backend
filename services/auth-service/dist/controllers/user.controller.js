"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = __importDefault(require("../services/user.service"));
const response_1 = __importDefault(require("../utils/response"));
class UserController {
    /**
     * Get current user
     */
    async getCurrentUser(req, res, next) {
        try {
            const authReq = req;
            const user = await user_service_1.default.getUserById(authReq.user.userId);
            response_1.default.success(res, user, 'User retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update user profile
     */
    async updateProfile(req, res, next) {
        try {
            const authReq = req;
            const user = await user_service_1.default.updateProfile(authReq.user.userId, req.body);
            response_1.default.success(res, user, 'Profile updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update user role
     */
    async updateRole(req, res, next) {
        try {
            const authReq = req;
            const user = await user_service_1.default.updateRole(authReq.user.userId, req.body.role);
            response_1.default.success(res, user, 'Role updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Change password
     */
    async changePassword(req, res, next) {
        try {
            const authReq = req;
            await user_service_1.default.changePassword(authReq.user.userId, req.body.currentPassword, req.body.newPassword);
            response_1.default.success(res, null, 'Password changed successfully');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new UserController();
//# sourceMappingURL=user.controller.js.map