import { logger } from '../utils/logger';
import { KKT_STATE } from '@frontol/common';
import type { KktStatusDto } from '@frontol/common';

/**
 * Сервис для работы с ККТ.
 *
 * Сейчас это заглушка — возвращает фиктивные данные.
 * Когда будет настроена среда сборки (Windows SDK) и установлен
 * реальный драйвер АТОЛ ДТО, замените методы на вызовы через
 * библиотеку node-atol-rpc (или другой драйвер).
 */
export class KktService {
  async getAllStatuses(): Promise<KktStatusDto[]> {
    logger.info('Запрос статуса ККТ (заглушка)');
    return [this.getStubStatus()];
  }

  async getStatus(deviceId: number): Promise<KktStatusDto> {
    logger.info({ deviceId }, 'Запрос статуса ККТ (заглушка)');
    return this.getStubStatus();
  }

  async disconnect(): Promise<void> {
    // Заглушка — соединения нет
  }

  private getStubStatus(): KktStatusDto {
    return {
      model: 'ATOL 30F (заглушка)',
      serialNumber: '0000000000000000',
      firmwareVersion: '5.8.100',
      state: KKT_STATE.READY,
      hasPaper: true,
      cashDrawerOpen: false,
      session: {
        isOpen: true,
        number: 1,
        openedAt: new Date().toISOString(),
        receiptCount: 0,
      },
      fiscalStorage: {
        serialNumber: '0000000000000000',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        ffdVersion: '1.2',
        documentsRemaining: 100000,
        isOverflow: false,
      },
      receivedAt: new Date().toISOString(),
    };
  }
}