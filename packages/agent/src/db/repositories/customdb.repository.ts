import { BaseRepository } from '../base.repository';

/**
 * Репозиторий для таблицы CustomDB.
 * Хранит версию Frontol (поле VersionFrontol).
 */
export class CustomDbRepository extends BaseRepository {
  /**
   * Получить версию Frontol.
   */
  async getFrontolVersion(): Promise<string | null> {
    const rows = await this.query<{ VERSIONFRONTOL: string }>(
      'SELECT FIRST 1 VersionFrontol FROM CustomDB',
    );
    return rows.length > 0 ? rows[0].VERSIONFRONTOL : null;
  }
}