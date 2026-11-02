import { useState } from 'react';
import { useCreateTask } from '../api/queries';

const TASK_TYPES = [
  { value: 'get_settings', label: '📖 Прочитать настройки' },
  { value: 'get_kkt_status', label: '🧾 Статус ККТ' },
  { value: 'get_system_info', label: '💻 Системная информация' },
  { value: 'update_settings', label: '✏️ Изменить настройку' },
];

export function CreateTaskForm({ agentId }: { agentId: string }) {
  const [type, setType] = useState('get_settings');
  const [settingName, setSettingName] = useState('');
  const [settingValue, setSettingValue] = useState('');
  const createTask = useCreateTask();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let payload: Record<string, unknown> = {};
    if (type === 'update_settings') {
      payload = { name: settingName, value: settingValue };
    }
    createTask.mutate({ agentId, type, payload });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold mb-4">Создать задачу</h3>
      <div className="space-y-3">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          {TASK_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        {type === 'update_settings' && (
          <>
            <input
              placeholder="Имя настройки"
              value={settingName}
              onChange={(e) => setSettingName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
            <input
              placeholder="Значение"
              value={settingValue}
              onChange={(e) => setSettingValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </>
        )}

        <button
          type="submit"
          disabled={createTask.isPending}
          className="w-full bg-brand-600 text-white py-2 rounded-lg hover:bg-brand-700 disabled:opacity-50"
        >
          {createTask.isPending ? 'Создание...' : 'Создать задачу'}
        </button>

        {createTask.isError && (
          <p className="text-red-600 text-sm">Ошибка: {String(createTask.error)}</p>
        )}
        {createTask.isSuccess && (
          <p className="text-green-600 text-sm">Задача создана: {createTask.data.id}</p>
        )}
      </div>
    </form>
  );
}