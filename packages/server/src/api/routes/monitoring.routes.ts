import { Router } from 'express';
import type { Request, Response } from 'express';
import { AgentService } from '../../services/AgentService';
import { TaskService } from '../../services/TaskService';

export function createMonitoringRouter(
  agentService: AgentService,
  _taskService: TaskService,
): Router {
  const router = Router();

  // GET /api/v1/monitoring/agents — состояние всех агентов
  router.get('/agents', (_req: Request, res: Response) => {
    const agents = agentService.findAll();
    const summary = {
      total: agents.length,
      online: agents.filter((a) => a.status === 'online').length,
      offline: agents.filter((a) => a.status === 'offline').length,
      error: agents.filter((a) => a.status === 'error').length,
    };
    res.json({ agents, summary });
  });

  // POST /api/v1/monitoring/health-check — принудительная проверка всех агентов
  router.post('/health-check', async (_req: Request, res: Response) => {
    await agentService.healthCheckAll();
    res.json({ success: true });
  });

  return router;
}