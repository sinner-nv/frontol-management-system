import { Router } from 'express';
import type { Request, Response } from 'express';
import type { GetKktStatusResponse } from '@frontol/common';
import { KktService } from '../../services/KktService';

export function createKktRouter(service: KktService): Router {
  const router = Router();

  // GET /api/v1/kkt/status — статус всех ККТ
  router.get('/status', async (_req: Request, res: Response) => {
    const devices = await service.getAllStatuses();
    const response: GetKktStatusResponse = { devices };
    res.json(response);
  });

  // GET /api/v1/kkt/:id/status — статус конкретной ККТ
  router.get('/:id/status', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const status = await service.getStatus(id);
    res.json(status);
  });

  return router;
}