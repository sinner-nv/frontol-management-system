import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SERVER_PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  SERVER_HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),

  // SQLite
  DB_PATH: z.string().default('./data/server.db'),

  // Таймауты
  AGENT_REQUEST_TIMEOUT_MS: z.coerce.number().int().default(30_000),
  TASK_MAX_ATTEMPTS: z.coerce.number().int().default(3),
  AGENT_OFFLINE_THRESHOLD_MS: z.coerce.number().int().default(120_000),
});

export type Env = z.infer<typeof EnvSchema>;

let cachedEnv: Env | null = null;

export function loadEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Ошибка конфигурации:\n${issues}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}