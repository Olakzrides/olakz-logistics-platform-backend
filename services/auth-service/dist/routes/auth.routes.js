"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const auth_validator_1 = require("../validators/auth.validator");
const router = (0, express_1.Router)();
// Registration & Email Verification
router.post('/register', (0, auth_middleware_1.validateRequest)(auth_validator_1.registerValidator), auth_controller_1.default.register);
router.post('/verify-email', (0, auth_middleware_1.validateRequest)(auth_validator_1.verifyEmailValidator), auth_controller_1.default.verifyEmail);
router.post('/resend-otp', (0, auth_middleware_1.validateRequest)(auth_validator_1.resendOTPValidator), auth_controller_1.default.resendOTP);
// Login & Token Management
router.post('/login', (0, auth_middleware_1.validateRequest)(auth_validator_1.loginValidator), auth_controller_1.default.login);
router.post('/refresh', (0, auth_middleware_1.validateRequest)(auth_validator_1.refreshTokenValidator), auth_controller_1.default.refresh);
router.post('/logout', (0, auth_middleware_1.validateRequest)(auth_validator_1.refreshTokenValidator), auth_controller_1.default.logout);
// Password Reset
router.post('/forgot-password', (0, auth_middleware_1.validateRequest)(auth_validator_1.forgotPasswordValidator), auth_controller_1.default.forgotPassword);
router.post('/reset-password', (0, auth_middleware_1.validateRequest)(auth_validator_1.resetPasswordValidator), auth_controller_1.default.resetPassword);
// Google OAuth
router.get('/google', auth_controller_1.default.googleAuth);
router.get('/google/callback', auth_controller_1.default.googleCallback);
router.post('/google/verify', (0, auth_middleware_1.validateRequest)(auth_validator_1.googleTokenValidator), auth_controller_1.default.googleVerify);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map