export declare class AppError extends Error {
    message: string;
    statusCode: number;
    code?: string | undefined;
    constructor(message: string, statusCode?: number, code?: string | undefined);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
export declare class ValidationError extends AppError {
    constructor(message?: string);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
//# sourceMappingURL=errors.d.ts.map