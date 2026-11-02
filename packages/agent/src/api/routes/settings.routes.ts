import { Router } from 'express';
import type { Request, Response } from 'express';
import {
  UpdateSettingSchema,
  BulkUpdateSettingsSchema,
  ValidationError,
} from '@frontol/common';
import type {
  GetAllSettingsResponse,
  UpdateSettingResponse,
  BulkUpdateSettingsResponse,
} from '@frontol/common';
import { SettingsService } from '../../services/SettingsService';

export function createSettingsRouter(service: SettingsService): Router {
  const router = Router();

  // GET /api/v1/settings — все настройки
  router.get('/', async (_req: Request, res: Response) => {
    const settings = await service.getAll();
    const response: GetAllSettingsResponse = {
      settings,
      total: settings.length,
      receivedAt: new Date().toISOString(),
    };
    res.json(response);
  });

  // GET /api/v1/settings/:name — одна настройка
  router.get('/:name', async (req: Request, res: Response) => {
    const setting = await service.get(req.params.name);
    res.json(setting);
  });

  // PUT /api/v1/settings — обновить одну настройку
  router.put('/', async (req: Request, res: Response) => {
    const parsed = UpdateSettingSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Неверные данные', { issues: parsed.error.issues });
    }
    const { name, value } = parsed.data;
    const updated = await service.set(name, value);
    const response: UpdateSettingResponse = {
      success: true,
      name: updated.name,
      value: updated.value,
      updatedAt: new Date().toISOString(),
    };
    res.json(response);
  });

  // POST /api/v1/settings/bulk — массовое обновление
  router.post('/bulk', async (req: Request, res: Response) => {
    const parsed = BulkUpdateSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Неверные данные', { issues: parsed.error.issues });
    }
    const { settings, atomic } = parsed.data;
    const result = await service.bulkUpdate(settings, atomic);
    const response: BulkUpdateSettingsResponse = {
      updated: result.updated,
      errors: result.errors,
      completedAt: new Date().toISOString(),
    };
    res.json(response);
  });

  return router;
}