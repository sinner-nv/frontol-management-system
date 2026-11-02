export type SettingValueType = 'string' | 'number' | 'boolean' | 'enum';

export interface SettingStorage {
  table: string;
  keyField: string;
  valueField: string;
  keyValue: string;
}

export interface SettingDefinition {
  id: string;
  path: string[];
  label: string;
  description?: string;
  type: SettingValueType;
  storage: SettingStorage;
  options?: string[];
  default: string;
  readOnly?: boolean;
}

export interface CatalogNode {
  label: string;
  path: string[];
  children?: CatalogNode[];
  setting?: SettingDefinition;
}