/**
 * Расширение типов для node-firebird.
 * Стандартные типы библиотеки не описывают Promise-обёртки
 * (queryAsync, executeAsync, getAsync, detachAsync),
 * которые реально существуют в runtime.
 */

import 'node-firebird';

declare module 'node-firebird' {
  interface Database {
    queryAsync<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
    executeAsync(sql: string, params?: unknown[]): Promise<void>;
    detachAsync(): Promise<void>;
    transactionAsync(isolation?: number): Promise<Transaction>;
  }

  interface Transaction {
    queryAsync<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
    executeAsync(sql: string, params?: unknown[]): Promise<void>;
    commitAsync(): Promise<void>;
    rollbackAsync(): Promise<void>;
  }

  interface ConnectionPool {
    getAsync(): Promise<Database>;
    destroyAsync(): Promise<void>;
  }

  namespace Firebird {
    function pool(max: number, options: Options): ConnectionPool;
  }
}