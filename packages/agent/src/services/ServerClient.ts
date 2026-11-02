import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';
import type {
  RegisterAgentRequest,
  RegisterAgentResponse,
  AgentTask,
} from '@frontol/common';

export class ServerClient {
  private readonly http: AxiosInstance;

  constructor(authToken?: string) {
    this.http = axios.create({
      baseURL: `${config.SERVER_URL}/api/v1`,
      timeout: 30_000,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    });
  }

  async register(payload: RegisterAgentRequest): Promise<RegisterAgentResponse> {
    const { data } = await this.http.post<RegisterAgentResponse>(
      '/agents/register',
      payload,
    );
    logger.info({ agentId: data.agentId }, 'Агент зарегистрирован на сервере');
    return data;
  }

  async heartbeat(agentId: string, summary: string): Promise<AgentTask[]> {
    const { data } = await this.http.post<{ ok: boolean; tasks?: AgentTask[] }>(
      '/agents/heartbeat',
      { agentId, status: 'online', summary },
    );
    return data.tasks ?? [];
  }

  /**
   * Отправить результат выполнения задачи на сервер.
   */
  async sendTaskResult(
    taskId: string,
    status: 'completed' | 'failed',
    result?: unknown,
    error?: string,
  ): Promise<void> {
    await this.http.post(`/tasks/${taskId}/result`, {
      status,
      result,
      error,
    });
  }
}