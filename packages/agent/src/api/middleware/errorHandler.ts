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
    logger.warn({ code: err.code, path: req.path, status: err.statusCode }, err.message);
    res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  logger.error({ err, path: req.path }, 'Необработанная ошибка');
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' },
  });
}