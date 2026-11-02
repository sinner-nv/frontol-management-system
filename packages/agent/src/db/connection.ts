// packages/agent/src/db/connection.ts
import * as Firebird from 'node-firebird';
import type { Database, Options } from 'node-firebird';
import { config } from '../config';
import { logger } from '../utils/logger';

/**
 * Опции подключения к Firebird.
 */
const dbOptions: Options = {
  host: config.FB_HOST,
  port: config.FB_PORT,
  database: config.FB_DATABASE,
  user: config.FB_USER,
  password: config.FB_PASSWORD,
  encoding: 'UTF8',
  lowercase_keys: false,
  pageSize: 4096,
  retryConnectionInterval: 1000,
};

/**
 * Пул соединений.
 */
const pool = Firebird.pool(5, dbOptions);

/**
 * Проверка подключения к БД при старте.
 */
export async function pingDatabase(): Promise<void> {
  const db = await pool.getAsync();
  try {
    await db.queryAsync('SELECT 1 AS CNT FROM RDB$DATABASE');
    logger.info({ host: config.FB_HOST, db: config.FB_DATABASE }, 'Firebird: подключение успешно');
  } finally {
    await db.detachAsync();
  }
}

/**
 * Получить соединение из пула.
 * ОБЯЗАТЕЛЬНО вызвать `detachAsync()` после использования!
 */
export function getConnection(): Promise<Database> {
  return pool.getAsync();
}

/**
 * Корректное завершение работы пула.
 */
export async function destroyPool(): Promise<void> {
  await pool.destroyAsync();
  logger.info('Firebird: пул соединений закрыт');
}