import { BaseRepository } from '../base.repository';

export interface RmkInfo {
  id: number;
  code: number;
  name: string;
  version: number;
}

/**
 * Репозиторий для таблицы RMK (рабочие места).
 */
export class RmkRepository extends BaseRepository {
  async findByCode(code: number): Promise<RmkInfo | null> {
    const rows = await this.query<{
      ID: number;
      CODE: number;
      NAME: string;
      RMKVERSION: number;
    }>('SELECT ID, Code, Name, RMKVersion FROM RMK WHERE Code = ?', [code]);

    if (rows.length === 0) return null;
    const r = rows[0];
    return { id: r.ID, code: r.CODE, name: r.NAME, version: r.RMKVERSION };
  }

  async findAll(): Promise<RmkInfo[]> {
    const rows = await this.query<{
      ID: number;
      CODE: number;
      NAME: string;
      RMKVERSION: number;
    }>('SELECT ID, Code, Name, RMKVersion FROM RMK ORDER BY Code');

    return rows.map((r) => ({
      id: r.ID,
      code: r.CODE,
      name: r.NAME,
      version: r.RMKVERSION,
    }));
  }
}