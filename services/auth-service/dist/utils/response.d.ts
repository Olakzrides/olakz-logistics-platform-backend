import { Response } from 'express';
declare class ResponseUtil {
    static success<T>(res: Response, data: T, message?: string, statusCode?: number): Response;
    static error(res: Response, message?: string, statusCode?: number, errorCode?: string, details?: any): Response;
    private static getErrorCode;
}
export default ResponseUtil;
