import { BaseRepository } from '../base.repository';
import type { SettingDto } from '@frontol/common';

/**
 * Репозиторий для работы с таблицей Settings.
 * Структура (из «Руководства интегратора», стр. 435):
 *   Name  Varchar 100
 *   Val   Varchar 255
 */
export class SettingsRepository extends BaseRepository {
  /**
   * Получить все настройки.
   */
  async findAll(): Promise<SettingDto[]> {
    const rows = await this.query<{ NAME: string; VAL: string }>(
      'SELECT Name, Val FROM Settings ORDER BY Name',
    );
    return rows.map((r) => ({ name: r.NAME, value: r.VAL }));
  }

  /**
   * Получить одну настройку по имени.
   */
  async findByName(name: string): Promise<SettingDto | null> {
    const rows = await this.query<{ NAME: string; VAL: string }>(
      'SELECT Name, Val FROM Settings WHERE Name = ?',
      [name],
    );
    if (rows.length === 0) return null;
    return { name: rows[0].NAME, value: rows[0].VAL };
  }

  /**
   * Установить значение настройки.
   * Если настройка существует — UPDATE, иначе — INSERT.
   */
  async upsert(setting: SettingDto): Promise<void> {
    const existing = await this.findByName(setting.name);
    if (existing) {
      await this.execute('UPDATE Settings SET Val = ? WHERE Name = ?', [
        setting.value,
        setting.name,
      ]);
    } else {
      await this.execute('INSERT INTO Settings (Name, Val) VALUES (?, ?)', [
        setting.name,
        setting.value,
      ]);
    }
  }

  /**
   * Массовое обновление в транзакции.
   */
  async bulkUpsert(settings: SettingDto[]): Promise<void> {
    await this.transaction(async () => {
      for (const setting of settings) {
        await this.upsert(setting);
      }
    });
  }
}