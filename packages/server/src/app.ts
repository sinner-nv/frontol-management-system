import { createApp } from './api/server';
import { closeDatabase } from './db/connection';
import { runMigrations } from './db/migrations';
import { AgentRepository } from './db/repositories/agent.repository';
import { TaskRepository } from './db/repositories/task.repository';
import { AgentService } from './services/AgentService';
import { TaskService } from './services/TaskService';
import { config } from './config';
import { logger } from './utils/logger';
import { SettingsCatalogService } from './services/SettingsCatalogService';

async function main(): Promise<void> {
  logger.info(
    { version: '1.0.0', env: config.NODE_ENV },
    'Запуск Frontol Management Server',
  );

  // 1. Миграции
  runMigrations();

  // 2. Репозитории
  const agentRepo = new AgentRepository();
  const taskRepo = new TaskRepository();

  // 3. Сервисы
  const agentService = new AgentService(agentRepo);
  const taskService = new TaskService(taskRepo, agentRepo);
  const catalogService = new SettingsCatalogService(agentRepo);

  // 4. HTTP-сервер
  const app = createApp({ agents: agentService, tasks: taskService, catalog: catalogService,});

  const server = app.listen(config.SERVER_PORT, config.SERVER_HOST, () => {
    logger.info(
      { host: config.SERVER_HOST, port: config.SERVER_PORT },
      `HTTP-сервер запущен: http://${config.SERVER_HOST}:${config.SERVER_PORT}`,
    );
    logger.info(`Healthcheck: http://${config.SERVER_HOST}:${config.SERVER_PORT}/health`);
    logger.info(`API:         http://${config.SERVER_HOST}:${config.SERVER_PORT}/api/v1`);
  });

  // 5. Фоновые задачи
  const markStaleInterval = setInterval(() => {
    try {
      agentService.markStaleAgents();
    } catch (err) {
      logger.error({ err }, 'Ошибка в markStaleAgents');
    }
  }, 60_000);

  // 6. Graceful shutdown
  const shutdown = (signal: string) => {
    logger.info({ signal }, 'Останавливаемся...');
    clearInterval(markStaleInterval);
    server.close(() => {
      closeDatabase();
      logger.info('Сервер остановлен');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  logger.fatal({ err }, 'Критическая ошибка при запуске');
  process.exit(1);
});