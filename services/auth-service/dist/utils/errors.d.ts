export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    timestamp: string;
    constructor(message: string, statusCode?: number, isOperational?: boolean);
}
export declare class ValidationError extends AppError {
    constructor(message: string);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
export declare class ConflictError extends AppError {
    constructor(message: string);
}
export declare class TooManyRequestsError extends AppError {
    constructor(message?: string);
}
