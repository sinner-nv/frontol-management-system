import { createApp } from './api/server';
import { pingDatabase, destroyPool } from './db/connection';
import { SettingsRepository } from './db/repositories/settings.repository';
import { CustomDbRepository } from './db/repositories/customdb.repository';
import { SettingsService } from './services/SettingsService';
import { KktService } from './services/KktService';
import { SystemService } from './services/SystemService';
import { AgentStateService } from './services/AgentStateService';
import { RegistrationService } from './services/RegistrationService';
import { TaskExecutor } from './services/TaskExecutor';
import { config } from './config';
import { logger } from './utils/logger';

async function main(): Promise<void> {
  logger.info({ version: '1.0.0', env: config.NODE_ENV }, 'Запуск Frontol Agent');

  // 1. Проверка Firebird
  try {
    await pingDatabase();
  } catch (err) {
    logger.fatal({ err }, 'Не удалось подключиться к Firebird. Проверьте параметры.');
    process.exit(1);
  }

  // 2. Репозитории
  const settingsRepo = new SettingsRepository();
  const customDbRepo = new CustomDbRepository();

  // 3. Сервисы
  const settingsService = new SettingsService(settingsRepo);
  const kktService = new KktService();
  const systemService = new SystemService(customDbRepo);

  // 4. HTTP-сервер
  const app = createApp({
    settings: settingsService,
    kkt: kktService,
    system: systemService,
  });

  const server = app.listen(config.AGENT_PORT, config.AGENT_HOST, () => {
    logger.info(
      { host: config.AGENT_HOST, port: config.AGENT_PORT },
      `HTTP-сервер запущен: http://${config.AGENT_HOST}:${config.AGENT_PORT}`,
    );
  });

  // 5. Регистрация + heartbeat + выполнение задач
  const taskExecutor = new TaskExecutor(settingsService, kktService, systemService);
  const stateService = new AgentStateService();
  const registrationService = new RegistrationService(
    stateService,
    customDbRepo,
    taskExecutor,
  );

  try {
    await registrationService.ensureRegistered();
    registrationService.startHeartbeat();
  } catch (err) {
    logger.error({ err }, 'Ошибка регистрации/Heartbeat. Агент продолжит локально.');
  }

  // 6. Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Останавливаемся...');
    registrationService.stop();
    await kktService.disconnect();
    server.close(async () => {
      await destroyPool();
      logger.info('Агент остановлен');
      process.exit(0);
    });
    setTimeout(() => {
      logger.error('Принудительное завершение по таймауту');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Необработанное исключение');
    process.exit(1);
  });
  process.on('unhandledRejection', (reason) => {
    logger.fatal({ reason }, 'Необработанный rejection');
    process.exit(1);
  });
}

main().catch((err) => {
  logger.fatal({ err }, 'Критическая ошибка при запуске');
  process.exit(1);
});