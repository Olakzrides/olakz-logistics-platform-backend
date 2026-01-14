import { Response } from 'express';

class ResponseUtil {
  static success(res: Response, message: string, data: any = null, statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    errorCode?: string,
    details?: any
  ) {
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

  private static getErrorCode(statusCode: number): string {
    const codes: Record<number, string> = {
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

export default ResponseUtil;
