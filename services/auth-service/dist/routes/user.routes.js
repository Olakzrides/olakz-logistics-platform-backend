"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_validator_1 = require("../validators/user.validator");
const router = (0, express_1.Router)();
// All user routes require authentication
router.use(auth_middleware_1.authMiddleware);
router.get('/me', user_controller_1.default.getCurrentUser);
router.put('/profile', (0, auth_middleware_1.validateRequest)(user_validator_1.updateProfileValidator), user_controller_1.default.updateProfile);
router.put('/role', (0, auth_middleware_1.validateRequest)(user_validator_1.updateRoleValidator), user_controller_1.default.updateRole);
router.patch('/password', (0, auth_middleware_1.validateRequest)(user_validator_1.changePasswordValidator), user_controller_1.default.changePassword);
exports.default = router;
//# sourceMappingURL=user.routes.js.map