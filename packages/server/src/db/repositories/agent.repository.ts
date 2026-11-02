import { randomUUID } from 'crypto';
import { db } from '../connection';
import type { AgentInfoDto, AgentStatus, AgentMetadata } from '@frontol/common';

interface AgentRow {
  id: string;
  name: string;
  host: string;
  port: number;
  version: string;
  frontol_version: string;
  database_path: string;
  status: string;
  last_seen_at: string | null;
  created_at: string;
  metadata: string;
  auth_token: string;
}

export class AgentRepository {
  create(data: {
    name: string;
    host: string;
    port: number;
    version: string;
    frontolVersion: string;
    databasePath: string;
    metadata: AgentMetadata;
  }): { agent: AgentInfoDto; authToken: string } {
    const id = randomUUID();
    const authToken = randomUUID();

    db.prepare(`
      INSERT INTO agents
        (id, name, host, port, version, frontol_version, database_path, status, last_seen_at, metadata, auth_token)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'online', datetime('now'), ?, ?)
    `).run(
      id,
      data.name,
      data.host,
      data.port,
      data.version,
      data.frontolVersion,
      data.databasePath,
      JSON.stringify(data.metadata),
      authToken,
    );

    const agent = this.findById(id)!;
    return { agent, authToken };
  }

  findById(id: string): AgentInfoDto | null {
    const row = db.prepare('SELECT * FROM agents WHERE id = ?').get(id) as AgentRow | undefined;
    return row ? this.mapRow(row) : null;
  }

  findByToken(token: string): AgentInfoDto | null {
    const row = db.prepare('SELECT * FROM agents WHERE auth_token = ?').get(token) as AgentRow | undefined;
    return row ? this.mapRow(row) : null;
  }

  findAll(): AgentInfoDto[] {
    const rows = db.prepare('SELECT * FROM agents ORDER BY name').all() as AgentRow[];
    return rows.map((r) => this.mapRow(r));
  }

  updateStatus(id: string, status: AgentStatus): void {
    db.prepare(`UPDATE agents SET status = ?, last_seen_at = datetime('now') WHERE id = ?`).run(status, id);
  }

  updateHeartbeat(id: string): void {
    db.prepare(`UPDATE agents SET last_seen_at = datetime('now'), status = 'online' WHERE id = ?`).run(id);
  }

  updateName(agentId: string, name: string): void {
    db.prepare('UPDATE agents SET name = ? WHERE id = ?').run(name, agentId);
  }

  getGroups(agentId: string): string[] {
    const rows = db
      .prepare('SELECT group_name FROM agent_groups WHERE agent_id = ? ORDER BY group_name')
      .all(agentId) as Array<{ group_name: string }>;
    return rows.map((r) => r.group_name);
  }

  setGroups(agentId: string, groups: string[]): void {
    const tx = db.transaction(() => {
      db.prepare('DELETE FROM agent_groups WHERE agent_id = ?').run(agentId);
      const insert = db.prepare('INSERT INTO agent_groups (agent_id, group_name) VALUES (?, ?)');
      for (const g of groups) insert.run(agentId, g.trim());
    });
    tx();
  }

  delete(id: string): boolean {
    const result = db.prepare('DELETE FROM agents WHERE id = ?').run(id);
    return result.changes > 0;
  }

  private mapRow(row: AgentRow): AgentInfoDto {
    return {
      id: row.id,
      name: row.name,
      host: row.host,
      port: row.port,
      version: row.version,
      frontolVersion: row.frontol_version,
      databasePath: row.database_path,
      status: row.status as AgentStatus,
      lastSeenAt: row.last_seen_at ?? row.created_at,
      metadata: JSON.parse(row.metadata) as AgentMetadata,
      groups: this.getGroups(row.id),
    };
  }
}