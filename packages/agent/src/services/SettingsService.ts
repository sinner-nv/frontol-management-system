import { SettingsRepository } from '../db/repositories/settings.repository';
import type { SettingDto } from '@frontol/common';
import { NotFoundError } from '@frontol/common';

/**
 * Сервис для работы с настройками Frontol.
 * Использует репозиторий SettingsRepository.
 */
export class SettingsService {
  constructor(private readonly repo: SettingsRepository) {}

  /**
   * Получить все настройки.
   */
  async getAll(): Promise<SettingDto[]> {
    return this.repo.findAll();
  }

  /**
   * Получить одну настройку. Если нет — бросает NotFoundError.
   */
  async get(name: string): Promise<SettingDto> {
    const setting = await this.repo.findByName(name);
    if (!setting) {
      throw new NotFoundError(`Настройка "${name}"`);
    }
    return setting;
  }

  /**
   * Установить значение настройки.
   */
  async set(name: string, value: string): Promise<SettingDto> {
    await this.repo.upsert({ name, value });
    return { name, value };
  }

  /**
   * Массовое обновление.
   * Возвращает статистику.
   */
  async bulkUpdate(
    settings: SettingDto[],
    atomic: boolean = true,
  ): Promise<{
    updated: number;
    errors: Array<{ settingName: string; error: string }>;
  }> {
    const errors: Array<{ settingName: string; error: string }> = [];
    let updated = 0;

    if (atomic) {
      try {
        await this.repo.bulkUpsert(settings);
        updated = settings.length;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        for (const s of settings) {
          errors.push({ settingName: s.name, error: message });
        }
      }
      return { updated, errors };
    }

    // Неатомарный режим — по одной
    for (const setting of settings) {
      try {
        await this.repo.upsert(setting);
        updated++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push({ settingName: setting.name, error: message });
      }
    }

    return { updated, errors };
  }
}