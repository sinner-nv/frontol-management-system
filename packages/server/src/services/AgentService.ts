import { AgentRepository } from '../db/repositories/agent.repository';
import { AgentClient } from './AgentClient';
import { NotFoundError } from '@frontol/common';
import type {
  AgentInfoDto,
  RegisterAgentRequest,
  RegisterAgentResponse,
  AgentStatus,
} from '@frontol/common';
import { config } from '../config';
import { logger } from '../utils/logger';

export class AgentService {
  constructor(private readonly repo: AgentRepository) {}

  register(request: RegisterAgentRequest): RegisterAgentResponse {
    const { agent, authToken } = this.repo.create({
      name: request.name,
      host: request.host,
      port: request.port,
      version: request.version,
      frontolVersion: request.frontolVersion,
      databasePath: request.databasePath,
      metadata: request.metadata,
    });
    logger.info({ agentId: agent.id, name: agent.name }, 'Агент зарегистрирован');
    return { agentId: agent.id, authToken };
  }

  findAll(): AgentInfoDto[] {
    return this.repo.findAll();
  }

  findById(id: string): AgentInfoDto {
    const agent = this.repo.findById(id);
    if (!agent) throw new NotFoundError(`Агент ${id}`);
    return agent;
  }

  authenticate(token: string): AgentInfoDto {
    const agent = this.repo.findByToken(token);
    if (!agent) throw new NotFoundError('Агент по токену');
    return agent;
  }

  heartbeat(agentId: string): AgentInfoDto {
    this.repo.updateHeartbeat(agentId);
    return this.findById(agentId);
  }

  updateStatus(agentId: string, status: AgentStatus): void {
    this.repo.updateStatus(agentId, status);
  }

  updateName(agentId: string, name: string): AgentInfoDto {
    this.findById(agentId);
    this.repo.updateName(agentId, name);
    logger.info({ agentId, name }, 'Агент переименован');
    return this.findById(agentId);
  }

  setGroups(agentId: string, groups: string[]): AgentInfoDto {
    this.findById(agentId);
    this.repo.setGroups(agentId, groups);
    logger.info({ agentId, groups }, 'Группы агента обновлены');
    return this.findById(agentId);
  }

  async healthCheckAll(): Promise<void> {
    const agents = this.repo.findAll();
    for (const agent of agents) {
      const client = new AgentClient(agent);
      const online = await client.healthCheck();
      const newStatus: AgentStatus = online ? 'online' : 'offline';
      if (agent.status !== newStatus) {
        this.repo.updateStatus(agent.id, newStatus);
        logger.info({ agentId: agent.id, status: newStatus }, 'Статус агента обновлён');
      }
    }
  }

  markStaleAgents(): void {
    const agents = this.repo.findAll();
    const threshold = config.AGENT_OFFLINE_THRESHOLD_MS;
    const now = Date.now();

    for (const agent of agents) {
      const lastSeen = new Date(agent.lastSeenAt).getTime();
      if (agent.status === 'online' && now - lastSeen > threshold) {
        this.repo.updateStatus(agent.id, 'offline');
        logger.warn({ agentId: agent.id }, 'Агент не отвечает, помечен как offline');
      }
    }
  }

  getClient(agentId: string, authToken?: string): AgentClient {
    const agent = this.findById(agentId);
    return new AgentClient(agent, authToken);
  }

  delete(id: string): void {
    if (!this.repo.delete(id)) {
      throw new NotFoundError(`Агент ${id}`);
    }
    logger.info({ agentId: id }, 'Агент удалён');
  }
}