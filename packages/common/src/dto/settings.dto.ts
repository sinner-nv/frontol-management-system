/**
 * DTO для работы с настройками Frontol.
 */

/**
 * Одна настройка из таблицы Settings.
 */
export interface SettingDto {
  /** Имя настройки (поле Name в таблице Settings) */
  name: string;
  /** Значение настройки (поле Val в таблице Settings) */
  value: string;
}

/**
 * Ответ на запрос списка всех настроек.
 */
export interface GetAllSettingsResponse {
  /** Массив настроек */
  settings: SettingDto[];
  /** Общее количество настроек */
  total: number;
  /** Время получения данных с агента (ISO 8601) */
  receivedAt: string;
}

/**
 * Запрос на обновление одной настройки.
 */
export interface UpdateSettingRequest {
  /** Имя настройки */
  name: string;
  /** Новое значение */
  value: string;
}

/**
 * Запрос на массовое обновление настроек.
 */
export interface BulkUpdateSettingsRequest {
  /** Массив настроек для обновления */
  settings: SettingDto[];
  /**
   * Если true — атомарное обновление (всё или ничего).
   * Если false — обновление по одной (при ошибке продолжаем остальные).
   * По умолчанию true.
   */
  atomic?: boolean;
}

/**
 * Ответ на массовое обновление настроек.
 */
export interface BulkUpdateSettingsResponse {
  /** Количество успешно обновлённых настроек */
  updated: number;
  /** Список ошибок (если были) */
  errors: Array<{
    settingName: string;
    error: string;
  }>;
  /** Время завершения операции (ISO 8601) */
  completedAt: string;
}

/**
 * Ответ на обновление одной настройки.
 */
export interface UpdateSettingResponse {
  /** true — если успешно */
  success: boolean;
  /** Имя настройки */
  name: string;
  /** Новое значение */
  value: string;
  /** Время обновления (ISO 8601) */
  updatedAt: string;
}