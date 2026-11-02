import express from 'express';
import type { Express } from 'express';
import { requestLogger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import { createSettingsRouter } from './routes/settings.routes';
import { createKktRouter } from './routes/kkt.routes';
import { createSystemRouter } from './routes/system.routes';
import type { SettingsService } from '../services/SettingsService';
import type { KktService } from '../services/KktService';
import type { SystemService } from '../services/SystemService';

export interface ServicesContainer {
  settings: SettingsService;
  kkt: KktService;
  system: SystemService;
}

export function createApp(services: ServicesContainer): Express {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/v1/settings', createSettingsRouter(services.settings));
  app.use('/api/v1/kkt', createKktRouter(services.kkt));
  app.use('/api/v1/system', createSystemRouter(services.system));

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Маршрут ${req.path} не найден` },
    });
  });

  app.use(errorHandler);

  return app;
}