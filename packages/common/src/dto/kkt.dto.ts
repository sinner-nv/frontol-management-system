import type { KktState } from '../constants/frontol';

export interface FiscalStorageInfo {
  serialNumber: string;
  /** Срок действия ФН (ISO 8601) */
  expiryDate: string;
  /** Версия ФФД (например, '1.05', '1.2') */
  ffdVersion: string;
  documentsRemaining: number;
  isOverflow: boolean;
}

export interface KktSessionInfo {
  isOpen: boolean;
  number: number;
  openedAt?: string;
  receiptCount: number;
}

export interface KktStatusDto {
  model: string;
  serialNumber: string;
  firmwareVersion: string;
  state: KktState;
  hasPaper: boolean;
  cashDrawerOpen?: boolean;
  session: KktSessionInfo;
  fiscalStorage: FiscalStorageInfo;
  lastError?: string;
  receivedAt: string;
}

export interface GetKktStatusResponse {
  devices: KktStatusDto[];
}