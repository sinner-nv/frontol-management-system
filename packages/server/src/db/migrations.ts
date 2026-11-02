import { db } from './connection';
import { logger } from '../utils/logger';

export function runMigrations(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      host TEXT NOT NULL,
      port INTEGER NOT NULL,
      version TEXT NOT NULL,
      frontol_version TEXT NOT NULL,
      database_path TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'offline',
      last_seen_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      metadata TEXT NOT NULL DEFAULT '{}',
      auth_token TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      type TEXT NOT NULL,
      payload TEXT NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'pending',
      result TEXT,
      error TEXT,
      attempts INTEGER NOT NULL DEFAULT 0,
      max_attempts INTEGER NOT NULL DEFAULT 3,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      started_at TEXT,
      completed_at TEXT,
      FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS agent_groups (
      agent_id TEXT NOT NULL,
      group_name TEXT NOT NULL,
      PRIMARY KEY (agent_id, group_name),
      FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_agent_status ON tasks(agent_id, status);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
    CREATE INDEX IF NOT EXISTS idx_agent_groups_name ON agent_groups(group_name);
  `);

  logger.info('Миграции применены');
}