import { Router } from 'express';
import type { Request, Response } from 'express';
import { SettingsCatalogService } from '../../services/SettingsCatalogService';

export function createCatalogRouter(service: SettingsCatalogService): Router {
    const router = Router();

    router.get('/tree', (_req: Request, res: Response) => {
        if (!service) {
            res.status(500).json({ error: 'CatalogService не инициализирован' });
            return;
        }
        const tree = service.buildTree();
        res.json(tree);
    });

    router.get('/agent/:agentId', async (req: Request, res: Response) => {
        if (!service) {
            res.status(500).json({ error: 'CatalogService не инициализирован' });
            return;
        }
        const values = await service.readFromAgent(req.params.agentId);
        res.json(values);
    });

    router.get('/agent/:agentId/kkt', async (req: Request, res: Response) => {
        if (!service) {
            res.status(500).json({ error: 'CatalogService не инициализирован' });
            return;
        }
        const client = service.getClient(req.params.agentId);
        const devices = await client.getKktStatus();
        res.json({ devices });
    });

    router.put('/agent/:agentId/:settingId', async (req: Request, res: Response) => {
        if (!service) {
            res.status(500).json({ error: 'CatalogService не инициализирован' });
            return;
        }
        const { value } = req.body;
        await service.writeToAgent(req.params.agentId, req.params.settingId, value);
        res.json({ success: true });
    });

    return router;
}