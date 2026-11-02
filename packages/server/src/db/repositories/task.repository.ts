import { randomUUID } from 'crypto';
import { db } from '../connection';
import type { TaskDto, TaskStatus, TaskType } from '@frontol/common';

interface TaskRow {
  id: string;
  agent_id: string;
  type: string;
  payload: string;
  status: string;
  result: string | null;
  error: string | null;
  attempts: number;
  max_attempts: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export class TaskRepository {
  create(data: {
    agentId: string;
    type: TaskType;
    payload: Record<string, unknown>;
    maxAttempts?: number;
  }): TaskDto {
    const id = randomUUID();
    const stmt = db.prepare(`
      INSERT INTO tasks (id, agent_id, type, payload, status, max_attempts)
      VALUES (?, ?, ?, ?, 'pending', ?)
    `);
    stmt.run(
      id,
      data.agentId,
      data.type,
      JSON.stringify(data.payload),
      data.maxAttempts ?? 3,
    );
    return this.findById(id)!;
  }

  findById(id: string): TaskDto | null {
    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow | undefined;
    return row ? this.mapRow(row) : null;
  }

  findByAgent(agentId: string, limit = 100): TaskDto[] {
    const rows = db
      .prepare('SELECT * FROM tasks WHERE agent_id = ? ORDER BY created_at DESC LIMIT ?')
      .all(agentId, limit) as TaskRow[];
    return rows.map((r) => this.mapRow(r));
  }

  findPendingByAgent(agentId: string): TaskDto[] {
    const rows = db
      .prepare("SELECT * FROM tasks WHERE agent_id = ? AND status = 'pending' ORDER BY created_at")
      .all(agentId) as TaskRow[];
    return rows.map((r) => this.mapRow(r));
  }

  updateStatus(
    id: string,
    status: TaskStatus,
    extra?: { result?: unknown; error?: string },
  ): void {
    const now = new Date().toISOString();
    let sql = 'UPDATE tasks SET status = ?';
    const params: unknown[] = [status];

    if (status === 'in_progress') {
      sql += ', started_at = ?, attempts = attempts + 1';
      params.push(now);
    }
    if (status === 'completed' || status === 'failed' || status === 'cancelled') {
      sql += ', completed_at = ?';
      params.push(now);
    }
    if (extra?.result !== undefined) {
      sql += ', result = ?';
      params.push(JSON.stringify(extra.result));
    }
    if (extra?.error !== undefined) {
      sql += ', error = ?';
      params.push(extra.error);
    }
    sql += ' WHERE id = ?';
    params.push(id);

    db.prepare(sql).run(...params);
  }

  private mapRow(row: TaskRow): TaskDto {
    return {
      id: row.id,
      agentId: row.agent_id,
      type: row.type as TaskType,
      payload: JSON.parse(row.payload),
      status: row.status as TaskStatus,
      result: row.result ? JSON.parse(row.result) : undefined,
      error: row.error ?? undefined,
      createdAt: row.created_at,
      startedAt: row.started_at ?? undefined,
      completedAt: row.completed_at ?? undefined,
      attempts: row.attempts,
      maxAttempts: row.max_attempts,
    };
  }
}