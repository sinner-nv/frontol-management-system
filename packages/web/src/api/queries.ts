import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { AgentInfoDto, TaskDto } from '@frontol/common';

// === Агенты ===

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data } = await api.get<{ agents: AgentInfoDto[]; total: number }>('/agents');
      return data;
    },
    refetchInterval: 10_000,
  });
}

export function useAgent(id: string) {
  return useQuery({
    queryKey: ['agents', id],
    queryFn: async () => {
      const { data } = await api.get<AgentInfoDto>(`/agents/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useHealthCheck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post('/monitoring/health-check');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function useUpdateAgentName() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ agentId, name }: { agentId: string; name: string }) => {
      const { data } = await api.put<AgentInfoDto>(`/agents/${agentId}/name`, { name });
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['agents'] });
      qc.invalidateQueries({ queryKey: ['agents', vars.agentId] });
    },
  });
}

export function useUpdateAgentGroups() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ agentId, groups }: { agentId: string; groups: string[] }) => {
      const { data } = await api.put<AgentInfoDto>(`/agents/${agentId}/groups`, { groups });
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['agents'] });
      qc.invalidateQueries({ queryKey: ['agents', vars.agentId] });
    },
  });
}

// === Задачи ===

export function useTasks(agentId?: string) {
  return useQuery({
    queryKey: ['tasks', agentId ?? 'all'],
    queryFn: async () => {
      if (agentId) {
        const { data } = await api.get<{ tasks: TaskDto[]; total: number }>(
          `/tasks/agent/${agentId}`,
        );
        return data;
      }
      return { tasks: [], total: 0 };
    },
    enabled: !!agentId,
    refetchInterval: 5_000,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['tasks', 'detail', id],
    queryFn: async () => {
      const { data } = await api.get<TaskDto>(`/tasks/${id}`);
      return data;
    },
    enabled: !!id,
    refetchInterval: 3_000,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      agentId: string;
      type: string;
      payload: Record<string, unknown>;
    }) => {
      const { data } = await api.post<TaskDto>('/tasks', payload);
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['tasks', vars.agentId] });
    },
  });
}

export function useBroadcastTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      type: string;
      payload: Record<string, unknown>;
      groups?: string[];
      onlyOnline?: boolean;
    }) => {
      const { data } = await api.post('/tasks/broadcast', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}