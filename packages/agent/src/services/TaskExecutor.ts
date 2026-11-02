import type { AgentTask } from '@frontol/common';
import { SettingsService } from './SettingsService';
import { KktService } from './KktService';
import { SystemService } from './SystemService';
import { logger } from '../utils/logger';

/**
 * Выполняет задачи, полученные от сервера через heartbeat.
 */
export class TaskExecutor {
  constructor(
    private readonly settings: SettingsService,
    private readonly kkt: KktService,
    private readonly system: SystemService,
  ) {}

  /**
   * Выполнить одну задачу. Возвращает результат или бросает ошибку.
   */
  async execute(task: AgentTask): Promise<unknown> {
    logger.info({ taskId: task.id, type: task.type }, 'Выполнение задачи');

    switch (task.type) {
      case 'get_settings':
        return { settings: await this.settings.getAll() };

      case 'update_settings': {
        const { name, value } = task.payload as { name: string; value: string };
        if (!name || value === undefined) {
          throw new Error('update_settings: требуется name и value');
        }
        return this.settings.set(name, value);
      }

      case 'bulk_update_settings': {
        const { settings, atomic } = task.payload as {
          settings: Array<{ name: string; value: string }>;
          atomic?: boolean;
        };
        if (!Array.isArray(settings)) {
          throw new Error('bulk_update_settings: settings должен быть массивом');
        }
        const result = await this.settings.bulkUpdate(settings, atomic ?? true);
        return {
          updated: result.updated,
          errors: result.errors,
          completedAt: new Date().toISOString(),
        };
      }

      case 'get_kkt_status':
        return { devices: await this.kkt.getAllStatuses() };

      case 'get_system_info':
        return { info: await this.system.getInfo() };

      case 'execute_sql': {
        // ВНИМАНИЕ: execute_sql — опасная операция.
        // В production требуйте явного разрешения.
        throw new Error('execute_sql не реализован (требуется дополнительная защита)');
      }

      default:
        throw new Error(`Неизвестный тип задачи: ${task.type}`);
    }
  }
}