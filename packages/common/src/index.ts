/**
 * @frontol/common
 *
 * Публичный API пакета.
 * Здесь экспортируются все типы, константы, схемы и утилиты,
 * которые должны быть доступны другим пакетам (agent, server).
 */

// Константы
export * from './constants/app';
export * from './constants/frontol';

// DTO
export * from './dto';

// Zod-схемы
export * from './schemas';

// Утилиты
export * from './utils';

export * from './catalog';   