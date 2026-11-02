// packages/agent/src/db/base.repository.ts
import type { Database } from 'node-firebird';
import { getConnection } from './connection';
import { DatabaseError } from '@frontol/common';
import { logger } from '../utils/logger';

/**
 * Базовый класс для всех репозиториев.
 */
export abstract class BaseRepository {
  /**
   * Выполнить SELECT-запрос.
   */
  protected async query<T = Record<string, unknown>>(
    sql: string,
    params: unknown[] = [],
  ): Promise<T[]> {
    const db = await getConnection();
    try {
      logger.debug({ sql, params }, 'DB query');
      const rows = await db.queryAsync<T>(sql, params);
      return rows;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error({ sql, err: message }, 'DB query failed');
      throw new DatabaseError(`Ошибка запроса к БД: ${message}`, { sql });
    } finally {
      await db.detachAsync();
    }
  }

  /**
   * Выполнить INSERT / UPDATE / DELETE.
   */
  protected async execute(sql: string, params: unknown[] = []): Promise<void> {
    const db = await getConnection();
    try {
      logger.debug({ sql, params }, 'DB execute');
      await db.executeAsync(sql, params);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error({ sql, err: message }, 'DB execute failed');
      throw new DatabaseError(`Ошибка выполнения: ${message}`, { sql });
    } finally {
      await db.detachAsync();
    }
  }

  /**
   * Выполнить несколько запросов в одной транзакции.
   * Если один падает — откатываются все.
   */
  protected async transaction<T>(
    callback: (db: Database) => Promise<T>,
  ): Promise<T> {
    const db = await getConnection();
    try {
      const tx = await db.transactionAsync();
      try {
        const result = await callback(db);
        await tx.commitAsync();
        return result;
      } catch (e) {
        await tx.rollbackAsync();
        throw e;
      }
    } finally {
      await db.detachAsync();
    }
  }
}