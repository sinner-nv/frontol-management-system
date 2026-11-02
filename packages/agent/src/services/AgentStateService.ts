import { promises as fs } from 'fs';
import path from 'path';
import { config } from '../config';
import { logger } from '../utils/logger';

export interface AgentState {
  agentId: string;
  authToken: string;
  registeredAt: string;
}

/**
 * Хранит состояние агента (agentId, authToken) в локальном JSON-файле.
 * При первом запуске — файла нет, агент регистрируется.
 * При последующих — читает готовые данные.
 */
export class AgentStateService {
  private readonly filePath: string;
  private state: AgentState | null = null;

  constructor() {
    this.filePath = path.resolve(config.AGENT_STATE_FILE);
  }

  async load(): Promise<AgentState | null> {
    try {
      const raw = await fs.readFile(this.filePath, 'utf-8');
      this.state = JSON.parse(raw) as AgentState;
      logger.info({ agentId: this.state.agentId }, 'Состояние агента загружено');
      return this.state;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.info('Файл состояния не найден — потребуется регистрация');
        return null;
      }
      logger.error({ err }, 'Ошибка чтения состояния агента');
      return null;
    }
  }

  async save(state: AgentState): Promise<void> {
    this.state = state;
    await fs.writeFile(this.filePath, JSON.stringify(state, null, 2), 'utf-8');
    logger.info({ agentId: state.agentId }, 'Состояние агента сохранено');
  }

  get(): AgentState | null {
    return this.state;
  }

  async clear(): Promise<void> {
    this.state = null;
    try {
      await fs.unlink(this.filePath);
    } catch {
      /* ignore */
    }
  }
}