import { z } from 'zod';

/**
 * Схема для создания задачи.
 */
export const CreateTaskSchema = z.object({
  agentId: z.string().uuid('agentId должен быть UUID'),
  type: z.enum([
    'update_settings',
    'bulk_update_settings',
    'get_settings',
    'get_kkt_status',
    'get_system_info',
    'execute_sql',
  ]),
  payload: z.record(z.unknown()),
  maxAttempts: z.number().int().min(1).max(10).optional().default(3),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;