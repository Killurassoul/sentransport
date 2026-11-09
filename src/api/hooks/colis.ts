import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import type {
  Colis,
  ColisListParams,
  CreateColisPayload,
  Paginated,
  UpdateColisPayload,
} from '../types';

export const clesColis = {
  tout: ['colis'] as const,
  liste: (params: ColisListParams) => ['colis', 'liste', params] as const,
  detail: (id: string) => ['colis', 'detail', id] as const,
  suivi: (numero: string) => ['colis', 'suivi', numero] as const,
};

export function useColisList(params: ColisListParams = {}) {
  return useQuery({
    queryKey: clesColis.liste(params),
    queryFn: async () => {
      const { data } = await api.get<Paginated<Colis>>('/colis', { params });
      return data;
    },
    placeholderData: (precedent) => precedent,
    staleTime: 30_000,
  });
}

export function useColis(id?: string) {
  return useQuery({
    queryKey: clesColis.detail(id ?? ''),
    queryFn: async () => {
      const { data } = await api.get<Colis>(`/colis/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useSuiviPublic(numero?: string) {
  return useQuery({
    queryKey: clesColis.suivi(numero ?? ''),
    queryFn: async () => {
      const { data } = await api.get<Colis>(`/colis/suivi/${numero}`);
      return data;
    },
    enabled: Boolean(numero),
    retry: false,
  });
}

export function useCreerColis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateColisPayload) => {
      const { data } = await api.post<Colis>('/colis', payload);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clesColis.tout });
    },
  });
}

export function useModifierColis(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateColisPayload) => {
      const { data } = await api.patch<Colis>(`/colis/${id}`, payload);
      return data;
    },
    onSuccess: (colis) => {
      queryClient.setQueryData(clesColis.detail(id), colis);
      void queryClient.invalidateQueries({ queryKey: clesColis.tout });
    },
  });
}

export function useSupprimerColis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/colis/${id}`);
      return id;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clesColis.tout });
    },
  });
}
