/**
 * DTO для получения системной информации с ПК агента.
 */

/**
 * Информация о системе.
 */
export interface SystemInfoDto {
  /** Версия Frontol */
  frontolVersion: string;
  /** Версия ОС */
  osVersion: string;
  /** Имя компьютера */
  computerName: string;
  /** Свободное место на диске (в байтах) */
  freeDiskSpace: number;
  /** Общий размер диска (в байтах) */
  totalDiskSpace: number;
  /** Размер БД Frontol (в байтах) */
  databaseSize: number;
  /** Время работы ПК (в секундах) */
  uptime: number;
  /** Время получения информации (ISO 8601) */
  receivedAt: string;
}

/**
 * Ответ на запрос системной информации.
 */
export interface GetSystemInfoResponse {
  info: SystemInfoDto;
}