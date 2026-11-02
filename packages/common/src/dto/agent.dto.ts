export type AgentStatus = 'online' | 'offline' | 'error';

export interface AgentMetadata {
  shopName?: string;
  workplaceCode?: number;
  inn?: string;
  osVersion?: string;
  computerName?: string;
  [key: string]: unknown;
}

export interface AgentInfoDto {
  id: string;
  name: string;
  host: string;
  port: number;
  version: string;
  frontolVersion: string;
  databasePath: string;
  status: AgentStatus;
  lastSeenAt: string;
  metadata: AgentMetadata;
  groups: string[];
}

export interface RegisterAgentRequest {
  name: string;
  host: string;
  port: number;
  version: string;
  frontolVersion: string;
  databasePath: string;
  metadata: AgentMetadata;
}

export interface RegisterAgentResponse {
  agentId: string;
  authToken: string;
}

export interface HeartbeatRequest {
  agentId: string;
  status: AgentStatus;
  summary: string;
}

export interface AgentTask {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface HeartbeatResponse {
  tasks: AgentTask[];
}