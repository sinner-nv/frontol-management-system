/**
 * DTO для задач (используется и на сервере, и на агенте).
 */

import type { TaskStatus, TaskType } from '../constants/frontol';

/**
 * Полная информация о задаче (хранится на сервере).
 */
export interface TaskDto {
  /** Уникальный ID задачи */
  id: string;
  /** ID агента, которому назначена задача */
  agentId: string;
  /** Тип задачи */
  type: TaskType;
  /** Параметры задачи */
  payload: Record<string, unknown>;
  /** Текущий статус */
  status: TaskStatus;
  /** Результат выполнения (если завершена) */
  result?: Record<string, unknown>;
  /** Текст ошибки (если failed) */
  error?: string;
  /** Время создания (ISO 8601) */
  createdAt: string;
  /** Время начала выполнения (ISO 8601) */
  startedAt?: string;
  /** Время завершения (ISO 8601) */
  completedAt?: string;
  /** Количество попыток выполнения */
  attempts: number;
  /** Максимальное количество попыток */
  maxAttempts: number;
}