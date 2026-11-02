import { Router } from 'express';
import type { Request, Response } from 'express';
import { CreateTaskSchema, ValidationError } from '@frontol/common';
import { TaskService } from '../../services/TaskService';
import { z } from 'zod';

export function createTasksRouter(service: TaskService): Router {
    const router = Router();

    // POST /api/v1/tasks — создать задачу
    router.post('/', (req: Request, res: Response) => {
        const parsed = CreateTaskSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new ValidationError('Неверные данные', { issues: parsed.error.issues });
        }
        const task = service.create(parsed.data);
        res.status(201).json(task);
    });

    // GET /api/v1/tasks/:id — статус задачи
    router.get('/:id', (req: Request, res: Response) => {
        const task = service.findById(req.params.id);
        res.json(task);
    });

    // GET /api/v1/tasks/agent/:agentId — задачи агента
    router.get('/agent/:agentId', (req: Request, res: Response) => {
        const tasks = service.findByAgent(req.params.agentId);
        res.json({ tasks, total: tasks.length });
    });

    // POST /api/v1/tasks/:id/execute — выполнить задачу
    router.post('/:id/execute', async (req: Request, res: Response) => {
        const task = await service.execute(req.params.id);
        res.json(task);
    });

    const TaskResultSchema = z.object({
        status: z.enum(['completed', 'failed']),
        result: z.unknown().optional(),
        error: z.string().optional(),
    });

    // POST /api/v1/tasks/:id/result — агент присылает результат
    router.post('/:id/result', (req: Request, res: Response) => {
        const parsed = TaskResultSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new ValidationError('Неверные данные', { issues: parsed.error.issues });
        }

        const task = service.completeFromAgent(
            req.params.id,
            parsed.data.status,
            parsed.data.result,
            parsed.data.error,
        );

        res.json(task);
    });

    return router;
}