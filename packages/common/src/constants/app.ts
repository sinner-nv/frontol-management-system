/**
 * Общие константы приложения.
 */

export const APP_NAME = 'Frontol Management System';
export const APP_VERSION = '1.0.0';

/**
 * Версии API агента и сервера.
 * Используется для проверки совместимости.
 */
export const AGENT_API_VERSION = 'v1';
export const SERVER_API_VERSION = 'v1';

/**
 * Таймауты по умолчанию (в миллисекундах).
 */
export const DEFAULT_TIMEOUTS = {
  /** Таймаут HTTP-запроса сервер → агент */
  AGENT_REQUEST: 30_000,
  /** Таймаут запроса к Firebird */
  FIREBIRD_QUERY: 15_000,
  /** Таймаут запроса к ККТ */
  KKT_REQUEST: 20_000,
} as const;

/**
 * Периодичность опроса агентов (в миллисекундах).
 */
export const AGENT_POLL_INTERVAL = 60_000;