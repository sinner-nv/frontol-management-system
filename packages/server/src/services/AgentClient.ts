import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';
import type { AgentInfoDto, KktStatusDto, SystemInfoDto } from '@frontol/common';

/**
 * HTTP-клиент для общения с конкретным агентом.
 * Содержит только методы HTTP-запросов к агенту.
 */
export class AgentClient {
  private readonly http: AxiosInstance;
  private readonly baseUrl: string;

  constructor(agent: AgentInfoDto, authToken?: string) {
    this.baseUrl = `http://${agent.host}:${agent.port}/api/v1`;
    this.http = axios.create({
      baseURL: this.baseUrl,
      timeout: config.AGENT_REQUEST_TIMEOUT_MS,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    });
  }

  async getSettings(): Promise<unknown> {
    const { data } = await this.http.get('/settings');
    return data;
  }

  async updateSetting(name: string, value: string): Promise<unknown> {
    const { data } = await this.http.put('/settings', { name, value });
    return data;
  }

  async bulkUpdateSettings(
    settings: Array<{ name: string; value: string }>,
    atomic = true,
  ): Promise<unknown> {
    const { data } = await this.http.post('/settings/bulk', { settings, atomic });
    return data;
  }

  async getKktStatus(): Promise<KktStatusDto[]> {
    const { data } = await this.http.get<{ devices: KktStatusDto[] }>('/kkt/status');
    return data.devices;
  }

  async getSystemInfo(): Promise<SystemInfoDto> {
    const { data } = await this.http.get<{ info: SystemInfoDto }>('/system/info');
    return data.info;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.http.get('/../health', { timeout: 5000 });
      return true;
    } catch (err) {
      logger.debug({ err, url: this.baseUrl }, 'Agent health check failed');
      return false;
    }
  }
}