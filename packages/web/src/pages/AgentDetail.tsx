import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAgent, useTasks, useUpdateAgentName, useUpdateAgentGroups } from '../api/queries';

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
};

const AGENT_STATUS_COLORS: Record<string, string> = {
    online: 'bg-green-100 text-green-800',
    offline: 'bg-gray-100 text-gray-800',
    error: 'bg-red-100 text-red-800',
};

export function AgentDetail() {
    const { id } = useParams<{ id: string }>();
    const { data: agent, isLoading, error } = useAgent(id!);
    const { data: tasksData } = useTasks(id);

    const updateName = useUpdateAgentName();
    const updateGroups = useUpdateAgentGroups();

    const [editingName, setEditingName] = useState(false);
    const [nameDraft, setNameDraft] = useState('');
    const [editingGroups, setEditingGroups] = useState(false);
    const [groupsDraft, setGroupsDraft] = useState('');

    if (isLoading) return <p className="p-6">Загрузка...</p>;
    if (error || !agent) {
        return (
            <div className="p-6">
                <p className="text-red-600">Агент не найден</p>
                <Link to="/agents" className="text-brand-600 hover:underline">← Назад</Link>
            </div>
        );
    }

    const startEditName = () => {
        setNameDraft(agent.name);
        setEditingName(true);
    };

    const saveName = () => {
        if (nameDraft.trim() && nameDraft !== agent.name) {
            updateName.mutate({ agentId: agent.id, name: nameDraft.trim() });
        }
        setEditingName(false);
    };

    const startEditGroups = () => {
        setGroupsDraft(agent.groups.join(', '));
        setEditingGroups(true);
    };

    const saveGroups = () => {
        const groups = groupsDraft
            .split(',')
            .map((g) => g.trim())
            .filter(Boolean);
        updateGroups.mutate({ agentId: agent.id, groups });
        setEditingGroups(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Link to="/agents" className="text-brand-600 hover:underline text-sm">
                    ← Назад к агентам
                </Link>
                <Link
                    to={`/agents/${agent.id}/settings`}
                    className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium"
                >
                    ⚙️ Настройки Frontol
                </Link>
                <Link
                    to={`/agents/${agent.id}/kkt`}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
                >
                    🧾 ККТ
                </Link>

            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        {editingName ? (
                            <div className="flex gap-2">
                                <input
                                    value={nameDraft}
                                    onChange={(e) => setNameDraft(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && saveName()}
                                    autoFocus
                                    className="text-2xl font-semibold border-b-2 border-brand-500 outline-none bg-transparent"
                                />
                                <button onClick={saveName} className="text-green-600 text-xl">✓</button>
                                <button onClick={() => setEditingName(false)} className="text-red-600 text-xl">✕</button>
                            </div>
                        ) : (
                            <h2
                                className="text-2xl font-semibold text-gray-900 cursor-pointer hover:text-brand-600"
                                onClick={startEditName}
                                title="Клик для переименования"
                            >
                                {agent.name} <span className="text-sm text-gray-400">✎</span>
                            </h2>
                        )}
                        <p className="text-sm text-gray-500 font-mono mt-1">
                            {agent.host}:{agent.port}
                        </p>
                    </div>
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${AGENT_STATUS_COLORS[agent.status] ?? AGENT_STATUS_COLORS.offline
                            }`}
                    >
                        {agent.status}
                    </span>
                </div>

                <div className="mt-4">
                    <div className="text-sm text-gray-500 mb-1">Группы:</div>
                    {editingGroups ? (
                        <div className="flex gap-2">
                            <input
                                value={groupsDraft}
                                onChange={(e) => setGroupsDraft(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && saveGroups()}
                                placeholder="shop-1, cashier, test"
                                autoFocus
                                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                            />
                            <button onClick={saveGroups} className="text-green-600 text-xl">✓</button>
                            <button onClick={() => setEditingGroups(false)} className="text-red-600 text-xl">✕</button>
                        </div>
                    ) : (
                        <div
                            className="flex flex-wrap gap-1 cursor-pointer"
                            onClick={startEditGroups}
                            title="Клик для изменения"
                        >
                            {agent.groups.length === 0 ? (
                                <span className="text-gray-400 text-sm italic">Нет групп (клик, чтобы добавить)</span>
                            ) : (
                                agent.groups.map((g) => (
                                    <span key={g} className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded text-xs">
                                        {g}
                                    </span>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-6">
                    <div>
                        <dt className="text-gray-500">ID</dt>
                        <dd className="font-mono text-xs break-all">{agent.id}</dd>
                    </div>
                    <div>
                        <dt className="text-gray-500">Версия Frontol</dt>
                        <dd>{agent.frontolVersion}</dd>
                    </div>
                    <div>
                        <dt className="text-gray-500">Путь к БД</dt>
                        <dd className="font-mono text-xs break-all">{agent.databasePath}</dd>
                    </div>
                    <div>
                        <dt className="text-gray-500">Последняя связь</dt>
                        <dd>{new Date(agent.lastSeenAt).toLocaleString('ru-RU')}</dd>
                    </div>
                </dl>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-3">Задачи</h3>
                <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                    {!tasksData || tasksData.tasks.length === 0 ? (
                        <p className="p-4 text-gray-500 text-sm">Задач пока нет</p>
                    ) : (
                        tasksData.tasks.map((task) => (
                            <div key={task.id} className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-sm text-gray-900">{task.type}</p>
                                    <p className="text-xs text-gray-500 font-mono">{task.id}</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(task.createdAt).toLocaleString('ru-RU')}
                                    </p>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[task.status] ?? STATUS_COLORS.pending
                                        }`}
                                >
                                    {task.status}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}