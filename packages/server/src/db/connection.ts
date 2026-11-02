import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { logger } from '../utils/logger';

const dbDir = path.dirname(config.DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// ✅ Явно указываем тип
export const db: DatabaseType = new Database(config.DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

logger.info({ path: config.DB_PATH }, 'SQLite: подключение открыто');

export function closeDatabase(): void {
  db.close();
  logger.info('SQLite: подключение закрыто');
}