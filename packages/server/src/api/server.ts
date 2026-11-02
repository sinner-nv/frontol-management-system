import express from 'express';
import type { Express } from 'express';
import { requestLogger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import { createAgentsRouter } from './routes/agents.routes';
import { createTasksRouter } from './routes/tasks.routes';
import { createMonitoringRouter } from './routes/monitoring.routes';
import type { AgentService } from '../services/AgentService';
import type { TaskService } from '../services/TaskService';
import { createCatalogRouter } from './routes/catalog.routes';
import type { SettingsCatalogService } from '../services/SettingsCatalogService';

export interface ServicesContainer {
    agents: AgentService;
    tasks: TaskService;
    catalog: SettingsCatalogService;   
}

export function createApp(services: ServicesContainer): Express {
    const app = express();


    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));
    app.use(requestLogger);


    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    app.use('/api/v1/agents', createAgentsRouter(services.agents, services.tasks));
    app.use('/api/v1/tasks', createTasksRouter(services.tasks));
    app.use('/api/v1/monitoring', createMonitoringRouter(services.agents, services.tasks));
    app.use('/api/v1/catalog', createCatalogRouter(services.catalog));

    app.use((req, res) => {
        res.status(404).json({
            success: false,
            error: { code: 'NOT_FOUND', message: `Маршрут ${req.path} не найден` },
        });
    });

    app.use(errorHandler);
    return app;
}