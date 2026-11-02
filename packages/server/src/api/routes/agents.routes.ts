import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { ValidationError } from '@frontol/common';
import { AgentService } from '../../services/AgentService';
import { TaskService } from '../../services/TaskService';

const RegisterSchema = z.object({
  name: z.string().min(1),
  host: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  version: z.string(),
  frontolVersion: z.string(),
  databasePath: z.string(),
  metadata: z.record(z.unknown()).optional().default({}),
});

const HeartbeatSchema = z.object({
  agentId: z.string().uuid(),
  status: z.enum(['online', 'offline', 'error']),
  summary: z.string().optional().default(''),
});

const UpdateNameSchema = z.object({
  name: z.string().min(1).max(100),
});

const SetGroupsSchema = z.object({
  groups: z.array(z.string().min(1).max(50)).max(20),
});

export function createAgentsRouter(
  service: AgentService,
  taskService: TaskService,
): Router {
  const router = Router();

  // Публичная регистрация
  router.post('/register', (req: Request, res: Response) => {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Неверные данные', { issues: parsed.error.issues });
    }
    const result = service.register({
      ...parsed.data,
      metadata: parsed.data.metadata as Record<string, unknown>,
    });
    res.status(201).json(result);
  });

  // Heartbeat
  router.post('/heartbeat', (req: Request, res: Response) => {
    const parsed = HeartbeatSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Неверные данные', { issues: parsed.error.issues });
    }
    const agent = service.heartbeat(parsed.data.agentId);
    const tasks = taskService.findPendingByAgent(agent.id);
    res.json({ ok: true, agent, tasks });
  });

  // Список всех
  router.get('/', (_req: Request, res: Response) => {
    const agents = service.findAll();
    res.json({ agents, total: agents.length });
  });

  // Переименовать
  router.put('/:id/name', (req: Request, res: Response) => {
    const parsed = UpdateNameSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Неверные данные', { issues: parsed.error.issues });
    }
    const agent = service.updateName(req.params.id, parsed.data.name);
    res.json(agent);
  });

  // Установить группы
  router.put('/:id/groups', (req: Request, res: Response) => {
    const parsed = SetGroupsSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Неверные данные', { issues: parsed.error.issues });
    }
    const agent = service.setGroups(req.params.id, parsed.data.groups);
    res.json(agent);
  });

  // Получить одного (должен быть ПОСЛЕ /:id/name и /:id/groups)
  router.get('/:id', (req: Request, res: Response) => {
    const agent = service.findById(req.params.id);
    res.json(agent);
  });

  // Удалить
  router.delete('/:id', (req: Request, res: Response) => {
    service.delete(req.params.id);
    res.json({ success: true });
  });

  return router;
}