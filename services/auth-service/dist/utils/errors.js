"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooManyRequestsError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}
exports.ValidationError = ValidationError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message) {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
class TooManyRequestsError extends AppError {
    constructor(message = 'Too many requests') {
        super(message, 429);
    }
}
exports.TooManyRequestsError = TooManyRequestsError;
//# sourceMappingURL=errors.js.map