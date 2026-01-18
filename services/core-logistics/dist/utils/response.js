"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ResponseUtil {
    static success(res, data, message = 'Success', statusCode = 200) {
        const response = {
            success: true,
            message,
            data,
            timestamp: new Date().toISOString(),
        };
        return res.status(statusCode).json(response);
    }
    static error(res, message = 'An error occurred', statusCode = 500, errorCode, details) {
        const response = {
            success: false,
            message,
            error: {
                code: errorCode || this.getErrorCode(statusCode),
                ...(details && { details }),
            },
            timestamp: new Date().toISOString(),
        };
        return res.status(statusCode).json(response);
    }
    static getErrorCode(statusCode) {
        const errorCodes = {
            400: 'BAD_REQUEST',
            401: 'UNAUTHORIZED',
            403: 'FORBIDDEN',
            404: 'NOT_FOUND',
            409: 'CONFLICT',
            422: 'VALIDATION_ERROR',
            429: 'RATE_LIMIT_EXCEEDED',
            500: 'INTERNAL_SERVER_ERROR',
        };
        return errorCodes[statusCode] || 'UNKNOWN_ERROR';
    }
}
exports.default = ResponseUtil;
//# sourceMappingURL=response.js.map