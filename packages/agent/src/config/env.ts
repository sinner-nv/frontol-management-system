import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const EnvSchema = z.object({
  // === Сервер ===
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  AGENT_PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  AGENT_HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  ATOL_LIBRARY_PATH: z.string().optional(),
  ATOL_DEVICE_MODEL: z.string().optional(),
  ATOL_PORT: z.string().optional(),

  // === Firebird (Frontol) ===
  FB_HOST: z.string().default('127.0.0.1'),
  FB_PORT: z.coerce.number().int().default(3050),
  FB_DATABASE: z.string().min(1),
  FB_USER: z.string().default('SYSDBA'),
  FB_PASSWORD: z.string().default('masterkey'),
  
  // === Management Server ===
  SERVER_URL: z.string().url().default('http://localhost:3000'),
  AGENT_PUBLIC_HOST: z.string().default('localhost'),
  HEARTBEAT_INTERVAL_MS: z.coerce.number().int().default(60_000),
  AGENT_STATE_FILE: z.string().default('./.agent.json'),

  // === Информация об агенте ===
  AGENT_NAME: z.string().optional(),

  // В EnvSchema:
  ATOL_LIBRARY_PATH: z.string().optional(),
  ATOL_DEVICE_MODEL: z.string().optional(),
  ATOL_PORT: z.string().optional(),
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
    throw new Error(`Ошибка конфигурации окружения:\n${issues}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}