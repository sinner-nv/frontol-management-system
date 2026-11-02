import { Router } from 'express';
import type { Request, Response } from 'express';
import type { GetSystemInfoResponse } from '@frontol/common';
import { SystemService } from '../../services/SystemService';

export function createSystemRouter(service: SystemService): Router {
  const router = Router();

  // GET /api/v1/system/info — системная информация
  router.get('/info', async (_req: Request, res: Response) => {
    const info = await service.getInfo();
    const response: GetSystemInfoResponse = { info };
    res.json(response);
  });

  // GET /api/v1/system/health — healthcheck
  router.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return router;
}