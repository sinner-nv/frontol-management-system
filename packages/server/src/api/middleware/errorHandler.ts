// packages/server/src/api/middleware/errorHandler.ts
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '@frontol/common';
import { logger } from '../../utils/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    // 🔍 ДИАГНОСТИКА: выводим полный details в консоль сервера
    console.error('=== APP ERROR ===');
    console.error('Code:', err.code);
    console.error('Message:', err.message);
    console.error('Details:', JSON.stringify(err.details, null, 2));

    logger.warn({ code: err.code, path: req.path }, err.message);
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,  // ← ОТДАЁМ details ЦЕЛИКОМ, а не только "[Array]"
      },
    });
    return;
  }
  logger.error({ err, path: req.path }, 'Необработанная ошибка');
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' },
  });
}