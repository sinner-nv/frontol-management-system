import { useAgents, useHealthCheck } from '../api/queries';
import { AgentCard } from '../components/AgentCard';

export function Dashboard() {
  const { data, isLoading, error } = useAgents();
  const healthCheck = useHealthCheck();

  if (isLoading) return <p>Загрузка...</p>;
  if (error) return <p className="text-red-600">Ошибка: {String(error)}</p>;

  const online = data?.agents.filter((a) => a.status === 'online').length ?? 0;
  const offline = data?.agents.filter((a) => a.status === 'offline').length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Дашборд</h2>
        <button
          onClick={() => healthCheck.mutate()}
          disabled={healthCheck.isPending}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
        >
          {healthCheck.isPending ? 'Проверка...' : '🔄 Проверить всех'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Всего агентов</p>
          <p className="text-3xl font-semibold">{data?.total ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Online</p>
          <p className="text-3xl font-semibold text-green-600">{online}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Offline</p>
          <p className="text-3xl font-semibold text-gray-600">{offline}</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Агенты</h3>
        {data?.agents.length === 0 ? (
          <p className="text-gray-500">Нет зарегистрированных агентов</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}