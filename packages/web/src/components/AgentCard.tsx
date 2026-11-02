import { Link } from 'react-router-dom';
import type { AgentInfoDto } from '@frontol/common';

const STATUS_COLORS: Record<string, string> = {
  online: 'bg-green-100 text-green-800',
  offline: 'bg-gray-100 text-gray-800',
  error: 'bg-red-100 text-red-800',
};

export function AgentCard({ agent }: { agent: AgentInfoDto }) {
  const lastSeen = new Date(agent.lastSeenAt).toLocaleString('ru-RU');

  return (
    <Link
      to={`/agents/${agent.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-gray-900">{agent.name}</h3>
          <p className="text-sm text-gray-500">{agent.host}:{agent.port}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            STATUS_COLORS[agent.status] ?? STATUS_COLORS.offline
          }`}
        >
          {agent.status}
        </span>
      </div>

      {agent.groups && agent.groups.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {agent.groups.map((g) => (
            <span key={g} className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded text-xs">
              {g}
            </span>
          ))}
        </div>
      )}

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-gray-500">Frontol</dt>
          <dd className="font-mono text-gray-800">{agent.frontolVersion}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Связь</dt>
          <dd className="text-gray-800">{lastSeen}</dd>
        </div>
      </dl>
    </Link>
  );
}