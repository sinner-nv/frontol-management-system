import { TaskRepository } from '../db/repositories/task.repository';
import { AgentRepository } from '../db/repositories/agent.repository';
import { AgentClient } from './AgentClient';
import { NotFoundError } from '@frontol/common';
import type { TaskDto, TaskType } from '@frontol/common';
import { logger } from '../utils/logger';

export class TaskService {
  constructor(
    private readonly taskRepo: TaskRepository,
    private readonly agentRepo: AgentRepository,
  ) {}

  create(data: {
    agentId: string;
    type: TaskType;
    payload: Record<string, unknown>;
    maxAttempts?: number;
  }): TaskDto {
    const agent = this.agentRepo.findById(data.agentId);
    if (!agent) throw new NotFoundError(`Агент ${data.agentId}`);

    const task = this.taskRepo.create(data);
    logger.info({ taskId: task.id, agentId: task.agentId, type: task.type }, 'Создана задача');
    return task;
  }

  findById(id: string): TaskDto {
    const task = this.taskRepo.findById(id);
    if (!task) throw new NotFoundError(`Задача ${id}`);
    return task;
  }

  findByAgent(agentId: string): TaskDto[] {
    return this.taskRepo.findByAgent(agentId);
  }

  findPendingByAgent(agentId: string): TaskDto[] {
    return this.taskRepo.findPendingByAgent(agentId);
  }

  async execute(taskId: string): Promise<TaskDto> {
    const task = this.findById(taskId);
    if (task.status !== 'pending') {
      throw new Error(`Задача ${taskId} уже выполняется или завершена`);
    }

    const agent = this.agentRepo.findById(task.agentId);
    if (!agent) throw new NotFoundError(`Агент ${task.agentId}`);

    this.taskRepo.updateStatus(task.id, 'in_progress');

    try {
      const client = new AgentClient(agent);
      const result = await this.dispatch(client, task.type, task.payload);
      this.taskRepo.updateStatus(task.id, 'completed', { result });
      logger.info({ taskId: task.id }, 'Задача выполнена');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.taskRepo.updateStatus(task.id, 'failed', { error: message });
      logger.error({ taskId: task.id, err: message }, 'Задача провалена');
    }

    return this.findById(task.id);
  }

  completeFromAgent(
    taskId: string,
    status: 'completed' | 'failed',
    result?: unknown,
    error?: string,
  ): TaskDto {
    const task = this.findById(taskId);

    if (task.status !== 'pending' && task.status !== 'in_progress') {
      logger.warn({ taskId, currentStatus: task.status }, 'Попытка завершить задачу в неверном статусе');
      return task;
    }

    if (status === 'completed') {
      this.taskRepo.updateStatus(taskId, 'completed', { result });
      logger.info({ taskId }, 'Задача завершена агентом');
    } else {
      this.taskRepo.updateStatus(taskId, 'failed', { error: error ?? 'unknown' });
      logger.warn({ taskId, error }, 'Задача провалена агентом');
    }

    return this.findById(taskId);
  }

  private async dispatch(
    client: AgentClient,
    type: TaskType,
    payload: Record<string, unknown>,
  ): Promise<unknown> {
    switch (type) {
      case 'get_settings':
        return client.getSettings();
      case 'update_settings':
        return client.updateSetting(String(payload.name), String(payload.value));
      case 'bulk_update_settings':
        return client.bulkUpdateSettings(
          (payload.settings as Array<{ name: string; value: string }>) ?? [],
          (payload.atomic as boolean) ?? true,
        );
      case 'get_kkt_status':
        return client.getKktStatus();
      case 'get_system_info':
        return client.getSystemInfo();
      default:
        throw new Error(`Неизвестный тип задачи: ${type}`);
    }
  }

  async createAndExecute(
    agentId: string,
    type: TaskType,
    payload: Record<string, unknown>,
  ): Promise<TaskDto> {
    const task = this.create({ agentId, type, payload });
    return this.execute(task.id);
  }
}