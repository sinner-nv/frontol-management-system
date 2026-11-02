import { ServerClient } from './ServerClient';
import { AgentStateService } from './AgentStateService';
import { TaskExecutor } from './TaskExecutor';
import { config } from '../config';
import { logger } from '../utils/logger';
import { CustomDbRepository } from '../db/repositories/customdb.repository';
import { AgentTask, AgentMetadata } from '@frontol/common';

/**
 * Отвечает за регистрацию агента, heartbeat и выполнение задач.
 */
export class RegistrationService {
  private intervalHandle: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(
    private readonly stateService: AgentStateService,
    private readonly customDbRepo: CustomDbRepository,
    private readonly taskExecutor: TaskExecutor,
  ) {}

  async ensureRegistered(): Promise<{ agentId: string; authToken: string }> {
    const existing = await this.stateService.load();
    if (existing) {
      return { agentId: existing.agentId, authToken: existing.authToken };
    }

    logger.info('Агент не зарегистрирован, выполняем регистрацию...');

    const frontolVersion = (await this.customDbRepo.getFrontolVersion()) ?? 'unknown';
    const os = require('os');
    const metadata: AgentMetadata = {
      computerName: os.hostname(),
      osVersion: `${os.type()} ${os.release()}`,
    };

    const client = new ServerClient();
    const response = await client.register({
      name: config.AGENT_NAME ?? `Agent-${config.AGENT_PORT}`,
      host: config.AGENT_PUBLIC_HOST,
      port: config.AGENT_PORT,
      version: '1.0.0',
      frontolVersion,
      databasePath: config.FB_DATABASE,
      metadata,
    });

    await this.stateService.save({
      agentId: response.agentId,
      authToken: response.authToken,
      registeredAt: new Date().toISOString(),
    });

    return response;
  }

  startHeartbeat(): void {
    if (this.intervalHandle) return;

    const tick = async () => {
      // Защита от наложения: если предыдущий tick ещё идёт — пропускаем
      if (this.isProcessing) return;
      this.isProcessing = true;

      try {
        await this.doHeartbeat();
      } catch (err) {
        logger.error({ err }, 'Ошибка heartbeat');
      } finally {
        this.isProcessing = false;
      }
    };

    // Первый heartbeat — сразу
    void tick();
    // Затем периодически
    this.intervalHandle = setInterval(tick, config.HEARTBEAT_INTERVAL_MS);
    logger.info({ interval: config.HEARTBEAT_INTERVAL_MS }, 'Heartbeat запущен');
  }

  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
      logger.info('Heartbeat остановлен');
    }
  }

  /**
   * Один такт: отправить heartbeat, получить задачи, выполнить каждую.
   */
  private async doHeartbeat(): Promise<void> {
    const state = this.stateService.get();
    if (!state) {
      logger.warn('Heartbeat: агент не зарегистрирован');
      return;
    }

    const client = new ServerClient(state.authToken);
    const tasks = await client.heartbeat(state.agentId, 'ok');

    if (tasks.length === 0) return;

    logger.info({ count: tasks.length }, 'Получены задачи от сервера');

    for (const task of tasks) {
      await this.processTask(client, task);
    }
  }

  /**
   * Выполнить задачу и отправить результат на сервер.
   */
  private async processTask(client: ServerClient, task: AgentTask): Promise<void> {
    try {
      const result = await this.taskExecutor.execute(task);
      await client.sendTaskResult(task.id, 'completed', result);
      logger.info({ taskId: task.id }, 'Результат задачи отправлен');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error({ taskId: task.id, err: message }, 'Ошибка выполнения задачи');
      try {
        await client.sendTaskResult(task.id, 'failed', undefined, message);
      } catch (sendErr) {
        logger.error({ taskId: task.id, err: sendErr }, 'Не удалось отправить результат');
      }
    }
  }
}