/**
 * Базовый класс для ошибок приложения.
 */
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Ошибка валидации (400).
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * Ошибка «не найдено» (404).
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} не найден`, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Ошибка БД (500).
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('DATABASE_ERROR', message, 500, details);
    this.name = 'DatabaseError';
  }
}

/**
 * Ошибка взаимодействия с ККТ (502).
 */
export class KktError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('KKT_ERROR', message, 502, details);
    this.name = 'KktError';
  }
}

/**
 * Ошибка аутентификации (401).
 */
export class AuthError extends AppError {
  constructor(message = 'Не авторизован') {
    super('AUTH_ERROR', message, 401);
    this.name = 'AuthError';
  }
}