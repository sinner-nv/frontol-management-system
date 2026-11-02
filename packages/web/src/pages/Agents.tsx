import { useState } from 'react';
import { useAgents } from '../api/queries';
import { AgentCard } from '../components/AgentCard';

export function Agents() {
  const { data, isLoading } = useAgents();
  const [groupFilter, setGroupFilter] = useState<string>('');

  if (isLoading) return <p className="p-6">Загрузка...</p>;

  const allGroups = Array.from(
    new Set((data?.agents ?? []).flatMap((a) => a.groups ?? [])),
  ).sort();

  const filtered = groupFilter
    ? (data?.agents ?? []).filter((a) => a.groups?.includes(groupFilter))
    : data?.agents ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Агенты</h2>
        {allGroups.length > 0 && (
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Все группы</option>
            {allGroups.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500">Нет агентов</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
}