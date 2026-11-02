import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { CustomDbRepository } from '../db/repositories/customdb.repository';
import { config } from '../config';
import type { SystemInfoDto } from '@frontol/common';

/**
 * Сервис для получения системной информации о ПК агента.
 */
export class SystemService {
  constructor(private readonly customDbRepo: CustomDbRepository) {}

  /**
   * Собрать системную информацию.
   */
  async getInfo(): Promise<SystemInfoDto> {
    const frontolVersion = (await this.customDbRepo.getFrontolVersion()) ?? 'unknown';

    const dbPath = config.FB_DATABASE;
    const dbDir = path.dirname(dbPath);

    const [dbSize, diskStats] = await Promise.all([
      this.safeFileSize(dbPath),
      this.getDiskStats(dbDir),
    ]);

    return {
      frontolVersion,
      osVersion: `${os.type()} ${os.release()} (${os.arch()})`,
      computerName: os.hostname(),
      freeDiskSpace: diskStats.free,
      totalDiskSpace: diskStats.total,
      databaseSize: dbSize,
      uptime: Math.floor(os.uptime()),
      receivedAt: new Date().toISOString(),
    };
  }

  private async safeFileSize(filePath: string): Promise<number> {
    try {
      const stat = await fs.stat(filePath);
      return stat.size;
    } catch {
      return 0;
    }
  }

  private async getDiskStats(_dir: string): Promise<{ free: number; total: number }> {
    // В Node.js нет кроссплатформенного API для получения размера диска.
    // Для Windows можно использовать `wmic`, для Linux — `df`.
    // Пока возвращаем заглушку — при необходимости замените.
    return { free: 0, total: 0 };
  }
}