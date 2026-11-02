import { z } from 'zod';

/**
 * Схема для запроса статуса ККТ.
 */
export const GetKktStatusSchema = z.object({
  /** Если true — опрашивать все ККТ. Если false — только те, что указаны в deviceIds */
  all: z.boolean().optional().default(true),
  /** Список ID устройств (опционально) */
  deviceIds: z.array(z.number()).optional(),
});