"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = exports.optionalAuth = void 0;
const response_1 = __importDefault(require("../utils/response"));
const optionalAuth = (req, _res, next) => {
    const skipAuth = req.headers['x-skip-auth-validation'];
    if (skipAuth) {
        return next();
    }
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return next();
    }
    // TODO: Validate JWT token with auth-service
    req.user = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'user@example.com',
        role: 'customer',
    };
    next();
};
exports.optionalAuth = optionalAuth;
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return response_1.default.error(res, 'Authorization header required', 401);
    }
    // TODO: Validate JWT token with auth-service
    req.user = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'user@example.com',
        role: 'customer',
    };
    return next();
};
exports.requireAuth = requireAuth;
//# sourceMappingURL=auth.middleware.js.map