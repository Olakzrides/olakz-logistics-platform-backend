import { Response } from 'express';
declare class ResponseUtil {
    static success(res: Response, message: string, data?: any, statusCode?: number): Response<any, Record<string, any>>;
    static error(res: Response, message: string, statusCode?: number, errorCode?: string, details?: any): Response<any, Record<string, any>>;
    private static getErrorCode;
}
export default ResponseUtil;
//# sourceMappingURL=response.d.ts.map