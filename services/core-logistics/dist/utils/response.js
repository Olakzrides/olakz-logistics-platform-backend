"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ResponseUtil {
    static success(res, message, data = null, statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString(),
        });
    }
    static error(res, message, statusCode = 500, errorCode, details) {
        return res.status(statusCode).json({
            success: false,
            message,
            error: {
                code: errorCode || this.getErrorCode(statusCode),
                ...(details && { details }),
            },
            timestamp: new Date().toISOString(),
        });
    }
    static getErrorCode(statusCode) {
        const codes = {
            400: 'BAD_REQUEST',
            401: 'UNAUTHORIZED',
            403: 'FORBIDDEN',
            404: 'NOT_FOUND',
            409: 'CONFLICT',
            422: 'VALIDATION_ERROR',
            500: 'INTERNAL_SERVER_ERROR',
        };
        return codes[statusCode] || 'UNKNOWN_ERROR';
    }
}
exports.default = ResponseUtil;
//# sourceMappingURL=response.js.map