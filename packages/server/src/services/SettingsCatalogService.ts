import { AgentRepository } from '../db/repositories/agent.repository';
import { AgentClient } from './AgentClient';
import { SETTINGS } from '@frontol/common';
import type { CatalogNode } from '@frontol/common';
import { logger } from '../utils/logger';

export class SettingsCatalogService {
    constructor(private readonly agentRepo: AgentRepository) { }

    getClient(agentId: string): AgentClient {
        const agent = this.agentRepo.findById(agentId);
        if (!agent) throw new Error(`Агент ${agentId} не найден`);
        return new AgentClient(agent);
    }

    buildTree(): CatalogNode[] {
        if (!Array.isArray(SETTINGS) || SETTINGS.length === 0) {
            logger.warn('SETTINGS пустой — каталог настроек не загружен');
            return [];
        }

        const root: CatalogNode = { label: 'root', path: [], children: [] };

        for (const setting of SETTINGS) {
            let current = root;
            for (let i = 0; i < setting.path.length; i++) {
                const segment = setting.path[i];
                let child = current.children?.find((c) => c.label === segment);
                if (!child) {
                    child = { label: segment, path: setting.path.slice(0, i + 1), children: [] };
                    current.children = current.children ?? [];
                    current.children.push(child);
                }
                current = child;
            }
            current.children = current.children ?? [];
            current.children.push({
                label: setting.label,
                path: [...setting.path, setting.label],
                setting,
            });
        }

        return root.children ?? [];
    }

    async readFromAgent(agentId: string): Promise<Record<string, string>> {
        const agent = this.agentRepo.findById(agentId);
        if (!agent) throw new Error(`Агент ${agentId} не найден`);

        const client = new AgentClient(agent);
        const settingsResponse = (await client.getSettings()) as {
            settings: Array<{ name: string; value: string }>;
        };
        const settingsMap = new Map(settingsResponse.settings.map((s) => [s.name, s.value]));
        const result: Record<string, string> = {};

        for (const def of SETTINGS) {
            if (def.storage.table === 'Settings') {
                result[def.id] = settingsMap.get(def.storage.keyValue) ?? def.default;
            } else {
                result[def.id] = def.default;
            }
        }
        return result;
    }

    async writeToAgent(agentId: string, settingId: string, value: string): Promise<void> {
        const def = SETTINGS.find((s) => s.id === settingId);
        if (!def) throw new Error(`Настройка ${settingId} не найдена`);
        if (def.readOnly) throw new Error(`Настройка ${settingId} только для чтения`);

        const agent = this.agentRepo.findById(agentId);
        if (!agent) throw new Error(`Агент ${agentId} не найден`);

        const client = new AgentClient(agent);
        await client.updateSetting(def.storage.keyValue, value);

        logger.info({ agentId, settingId, value }, 'Настройка записана');
    }
}