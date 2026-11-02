import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

interface CatalogNode {
  label: string;
  path: string[];
  children?: CatalogNode[];
  setting?: {
    id: string;
    label: string;
    type: 'string' | 'number' | 'boolean' | 'enum';
    options?: string[];
    default: string;
    description?: string;
    readOnly?: boolean;
  };
}

export function Settings() {
  const { id: agentId } = useParams<{ id: string }>();
  const qc = useQueryClient();
  // По умолчанию всё свёрнуто
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const { data: tree, isLoading: treeLoading, error: treeError } = useQuery({
    queryKey: ['catalog', 'tree'],
    queryFn: async () => {
      const { data } = await api.get<CatalogNode[]>('/catalog/tree');
      return data;
    },
  });

  const {
    data: values,
    isLoading: valuesLoading,
    error: valuesError,
  } = useQuery({
    queryKey: ['catalog', 'values', agentId],
    queryFn: async () => {
      const { data } = await api.get<Record<string, string>>(`/catalog/agent/${agentId}`);
      return data;
    },
    enabled: !!agentId,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ settingId, value }: { settingId: string; value: string }) => {
      await api.put(`/catalog/agent/${agentId}/${settingId}`, { value });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['catalog', 'values', agentId] });
    },
  });

  if (!agentId) return <p className="p-6">Выберите агента</p>;
  if (treeLoading) return <p className="p-6">Загрузка каталога...</p>;
  if (treeError) return <p className="p-6 text-red-600">Ошибка каталога: {String(treeError)}</p>;
  if (!tree || tree.length === 0) {
    return (
      <div className="p-6">
        <p className="text-yellow-600">Каталог пуст. Проверьте, что SETTINGS заполнен в @frontol/common.</p>
      </div>
    );
  }

  const renderSetting = (node: CatalogNode) => {
    const def = node.setting!;
    const current = values?.[def.id] ?? def.default;

    return (
      <div key={def.id} className="flex items-center gap-4 py-2 px-3 border-b border-gray-100">
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-800">{def.label}</div>
          <div className="text-xs text-gray-400 font-mono">{def.id}</div>
          {def.description && (
            <div className="text-xs text-gray-500">{def.description}</div>
          )}
        </div>
        <div className="w-64">
          {def.type === 'boolean' ? (
            <input
              type="checkbox"
              checked={current === '1'}
              disabled={def.readOnly}
              onChange={(e) =>
                updateMutation.mutate({ settingId: def.id, value: e.target.checked ? '1' : '0' })
              }
            />
          ) : def.type === 'enum' ? (
            <select
              value={current}
              disabled={def.readOnly}
              onChange={(e) => updateMutation.mutate({ settingId: def.id, value: e.target.value })}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {def.options?.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          ) : (
            <input
              type={def.type === 'number' ? 'number' : 'text'}
              defaultValue={current}
              key={`${def.id}-${current}`}
              disabled={def.readOnly}
              onBlur={(e) => {
                if (e.target.value !== current) {
                  updateMutation.mutate({ settingId: def.id, value: e.target.value });
                }
              }}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            />
          )}
        </div>
      </div>
    );
  };

  const renderNode = (node: CatalogNode): JSX.Element => {
    if (node.setting) return renderSetting(node);

    const key = node.path.join('.');
    // ▼ КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: по умолчанию свёрнуто (false)
    const isOpen = expanded[key] ?? false;

    return (
      <div key={key} className="mb-1">
        <button
          onClick={() => setExpanded({ ...expanded, [key]: !isOpen })}
          className="w-full text-left px-2 py-2 font-semibold text-brand-700 hover:bg-gray-50 rounded flex items-center gap-2"
        >
          <span className="text-xs">{isOpen ? '▼' : '▶'}</span>
          <span>{node.label}</span>
          {node.children && !isOpen && (
            <span className="text-xs text-gray-400 font-normal ml-1">
              ({node.children.length})
            </span>
          )}
        </button>
        {isOpen && (
          <div className="ml-4 border-l border-gray-200 pl-2">
            {node.children?.map(renderNode)}
          </div>
        )}
      </div>
    );
  };

  const counts = {
    total: countSettings(tree),
    loaded: values ? Object.keys(values).length : 0,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Настройки Frontol</h2>
        <div className="flex items-center gap-4 text-sm">
          {valuesLoading && <span className="text-gray-500">Загрузка значений...</span>}
          {valuesError && (
            <span className="text-red-600">Ошибка: {String(valuesError)}</span>
          )}
          {values && (
            <span className="text-green-600">
              Загружено: {counts.loaded} / {counts.total}
            </span>
          )}
        </div>
      </div>

      {updateMutation.isError && (
        <p className="text-red-600 text-sm">
          Ошибка сохранения: {String(updateMutation.error)}
        </p>
      )}
      {updateMutation.isSuccess && (
        <p className="text-green-600 text-sm">Сохранено</p>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        {tree.map(renderNode)}
      </div>
    </div>
  );
}

function countSettings(nodes: CatalogNode[]): number {
  let count = 0;
  for (const node of nodes) {
    if (node.setting) count++;
    if (node.children) count += countSettings(node.children);
  }
  return count;
}