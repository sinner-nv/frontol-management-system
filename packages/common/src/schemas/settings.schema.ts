import { z } from 'zod';

/**
 * Схема для одной настройки.
 * Имя настройки — строка до 100 символов (как в таблице Settings).
 * Значение — строка до 255 символов (как в таблице Settings).
 */
export const SettingSchema = z.object({
  name: z
    .string()
    .min(1, 'Имя настройки не может быть пустым')
    .max(100, 'Имя настройки не может превышать 100 символов'),
  value: z
    .string()
    .max(255, 'Значение настройки не может превышать 255 символов'),
});

/**
 * Схема для обновления одной настройки.
 */
export const UpdateSettingSchema = SettingSchema;

/**
 * Схема для массового обновления.
 */
export const BulkUpdateSettingsSchema = z.object({
  settings: z
    .array(SettingSchema)
    .min(1, 'Список настроек не может быть пустым')
    .max(1000, 'Нельзя обновлять более 1000 настроек за раз'),
  atomic: z.boolean().optional().default(true),
});

export type BulkUpdateSettingsInput = z.infer<typeof BulkUpdateSettingsSchema>;