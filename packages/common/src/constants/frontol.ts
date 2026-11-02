/**
 * Константы, связанные со структурой Frontol 6.
 * Основано на «Руководстве администратора» и «Руководстве интегратора».
 */

/**
 * Коды видов документов Frontol (из таблицы DocKind).
 * Используется при работе с журналом документов.
 */
export const DOCUMENT_KIND = {
  SALE: 0,
  RETURN: 1,
  DEPOSIT: 4,
  WITHDRAWAL: 5,
  CUSTOM: 6,
  SESSION_OPEN: 8,
  ECR_OPERATION: 9,
  SESSION_CLOSE: 10,
  PAYMENT_SESSION_CLOSE: 11,
  EMPLOYEE_LIST_EDIT: 12,
  SERVICE_OPERATION: 13,
  GOODS_RECEIPT: 14,
  GOODS_EXPENSE: 15,
  INVENTORY: 16,
  REVALUATION: 17,
  TARE_OPENING: 18,
  CORRECTION_INCOME: 19,
  CORRECTION_EXPENSE: 20,
  PREPAYMENT: 21,
  PREPAYMENT_RETURN: 22,
  CREDIT_PAYMENT: 23,
  CREDIT_PAYMENT_RETURN: 24,
  EXPENSE: 25,
  EXPENSE_RETURN: 26,
  BEER_TAP_INSTALL: 27,
  BEER_TAP_REMOVE: 28,
  TARE_OPENING_COCKTAILS: 29,
  TARE_WRITE_OFF: 30,
} as const;

export type DocumentKindCode = typeof DOCUMENT_KIND[keyof typeof DOCUMENT_KIND];

/**
 * Операции во Frontol (из таблицы DocKind, поле ECRReceiptType).
 */
export const ECR_OPERATION = {
  SALE: 0,
  RETURN: 1,
  DEPOSIT: 4,
  WITHDRAWAL: 5,
  CUSTOM: 6,
  SESSION_OPEN: 8,
  ECR_OPERATION: 9,
  SESSION_CLOSE: 10,
  PAYMENT_SESSION_CLOSE: 11,
  EMPLOYEE_LIST_EDIT: 12,
  SERVICE_OPERATION: 13,
  GOODS_RECEIPT: 14,
  GOODS_EXPENSE: 15,
  INVENTORY: 16,
  REVALUATION: 17,
  TARE_OPENING: 18,
  CORRECTION_INCOME: 19,
  CORRECTION_EXPENSE: 20,
  PREPAYMENT: 21,
  PREPAYMENT_RETURN: 22,
  CREDIT_PAYMENT: 23,
  CREDIT_PAYMENT_RETURN: 24,
  EXPENSE: 25,
  EXPENSE_RETURN: 26,
  BEER_TAP_INSTALL: 27,
  BEER_TAP_REMOVE: 28,
  TARE_OPENING_COCKTAILS: 29,
  TARE_WRITE_OFF: 30,
} as const;

/**
 * Виды операций оплаты (из таблицы Payment, поле Operation).
 */
export const PAYMENT_OPERATION = {
  CASH: 0,
  BANK_CARD_OR_QR: 1,
  INTERNAL_PREPAYMENT: 3,
  INTERNAL_BONUS: 5,
  INTERNAL_GIFT_CARD: 6,
  USER_DEFINED: 7,
  EXTERNAL_GIFT_CARD: 8,
  BANK_CARD_WITH_CASH: 9,
} as const;

/**
 * Типы номенклатуры (из таблицы SprT, поле WareType).
 * Соответствует «Руководству администратора», раздел 4.3.1.1.
 */
export const WARE_TYPE = {
  PRODUCT: 0,
  ALCOHOL: 1,
  FUR: 2,
  MEDICINE: 3,
  TOBACCO: 4,
  SHOES: 5,
  LOTTERY: 6,
  OTHER_MARKED: 7,
  PHOTO: 8,
  PERFUMERY: 9,
  TIRES: 10,
  LIGHT_INDUSTRY: 11,
  ALTERNATIVE_TOBACCO: 12,
  DAIRY: 13,
  JEWELRY: 14,
  WATER: 15,
  NICOTINE: 16,
  PACKAGED_BEER: 17,
  DRAFT_BEER: 18,
  BAD: 19,
  ANTISEPTIC: 20,
  MEDICAL_DEVICE: 21,
  WHEELCHAIR: 22,
  SOFT_DRINK: 23,
  REHABILITATION: 24,
  NON_ALCOHOLIC_BEER: 25,
  CAVIAR: 26,
  BICYCLE: 27,
  VETERINARY: 28,
  PET_FOOD: 29,
  VEGETABLE_OIL: 30,
  LOW_ALCOHOL: 31,
  CANNED_FOOD: 32,
  GROCERY: 33,
  MOTOR_OIL: 34,
  SPORTS_NUTRITION: 35,
  CHILDREN_GOODS: 36,
  COSMETICS: 37,
  SOLUBLE_DRINKS: 38,
  SWEETS: 39,
  BUILDING_MATERIALS: 40,
  MEAT_PRODUCTS: 42,
  TOBACCO_KZ: 101,
} as const;

export type WareTypeCode = typeof WARE_TYPE[keyof typeof WARE_TYPE];

/**
 * Типы состояний ККТ (по результатам работы АТОЛ ДТО).
 */
export const KKT_STATE = {
  UNKNOWN: 'unknown',
  READY: 'ready',
  SESSION_OPEN: 'session_open',
  SESSION_CLOSED: 'session_closed',
  ERROR: 'error',
  NO_PAPER: 'no_paper',
  NO_CONNECTION: 'no_connection',
} as const;

export type KktState = typeof KKT_STATE[keyof typeof KKT_STATE];

/**
 * Статусы задач (Task).
 */
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];

/**
 * Типы задач, которые сервер может отправить агенту.
 */
export const TASK_TYPE = {
  UPDATE_SETTINGS: 'update_settings',
  BULK_UPDATE_SETTINGS: 'bulk_update_settings',
  GET_SETTINGS: 'get_settings',
  GET_KKT_STATUS: 'get_kkt_status',
  GET_SYSTEM_INFO: 'get_system_info',
  EXECUTE_SQL: 'execute_sql',
} as const;

export type TaskType = typeof TASK_TYPE[keyof typeof TASK_TYPE];