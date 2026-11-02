import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { KktStatusDto } from '@frontol/common';

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

function KktCard({ kkt }: { kkt: KktStatusDto }) {
  const daysLeft = daysUntil(kkt.fiscalStorage.expiryDate);
  const isWarning = daysLeft < 60;
  const isCritical = daysLeft < 30;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{kkt.model}</h3>
          <p className="text-sm text-gray-500 font-mono">{kkt.serialNumber}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            kkt.state === 'ready' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {kkt.state}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-gray-500">Версия ФФД</dt>
          <dd className="font-mono font-medium">{kkt.fiscalStorage.ffdVersion}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Версия прошивки</dt>
          <dd className="font-mono">{kkt.firmwareVersion}</dd>
        </div>
        <div>
          <dt className="text-gray-500">ФН</dt>
          <dd className="font-mono text-xs">{kkt.fiscalStorage.serialNumber}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Срок действия ФН</dt>
          <dd
            className={`font-medium ${
              isCritical ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-gray-900'
            }`}
          >
            {new Date(kkt.fiscalStorage.expiryDate).toLocaleDateString('ru-RU')}
            <span className="text-xs ml-1">({daysLeft} дн.)</span>
          </dd>
        </div>
      </dl>

      {isCritical && (
        <p className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded">
          ⚠️ Срок действия ФН истекает менее чем через 30 дней. Требуется замена.
        </p>
      )}
      {!isCritical && isWarning && (
        <p className="mt-3 text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
          ⚠️ Срок действия ФН истекает менее чем через 60 дней.
        </p>
      )}
    </div>
  );
}

export function Kkt() {
  const { id: agentId } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['kkt', 'status', agentId],
    queryFn: async () => {
      const { data } = await api.get<{ devices: KktStatusDto[] }>(
        `/catalog/agent/${agentId}/kkt`,
      );
      return data;
    },
    enabled: !!agentId,
  });

  if (!agentId) return <p className="p-6">Выберите агента</p>;
  if (isLoading) return <p className="p-6">Загрузка статуса ККТ...</p>;
  if (error) return <p className="p-6 text-red-600">Ошибка: {String(error)}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to={`/agents/${agentId}`} className="text-brand-600 hover:underline text-sm">
          ← Назад к агенту
        </Link>
      </div>

      <h2 className="text-2xl font-semibold">Подключённые ККТ</h2>

      {!data?.devices || data.devices.length === 0 ? (
        <p className="text-gray-500">ККТ не найдены</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.devices.map((kkt, idx) => (
            <KktCard key={idx} kkt={kkt} />
          ))}
        </div>
      )}
    </div>
  );
}