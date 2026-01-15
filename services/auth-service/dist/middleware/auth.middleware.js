"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = exports.authMiddleware = void 0;
const token_service_1 = __importDefault(require("../services/token.service"));
const errors_1 = require("../utils/errors");
/**
 * Verify JWT token from Authorization header
 */
const authMiddleware = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errors_1.UnauthorizedError('No token provided');
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        // Verify token
        const decoded = token_service_1.default.verifyAccessToken(token);
        // Attach user to request
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authMiddleware = authMiddleware;
/**
 * Validate request body/query/params with Joi
 */
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { body, query } = schema;
        if (body) {
            const { error } = body.validate(req.body, { abortEarly: false });
            if (error) {
                res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    error: {
                        code: 'VALIDATION_ERROR',
                        details: error.details,
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
        }
        if (query) {
            const { error } = query.validate(req.query, { abortEarly: false });
            if (error) {
                res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    error: {
                        code: 'VALIDATION_ERROR',
                        details: error.details,
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
        }
        next();
    };
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=auth.middleware.js.map