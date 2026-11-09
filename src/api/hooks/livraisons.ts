import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import type { AffectationPayload, Livraison, UpdateStatutPayload } from '../types';
import { clesColis } from './colis';

export const clesLivraisons = {
  tout: ['livraisons'] as const,
  liste: (livreurId?: string) => ['livraisons', 'liste', livreurId ?? 'toutes'] as const,
};

export function useLivraisons(livreurId?: string) {
  return useQuery({
    queryKey: clesLivraisons.liste(livreurId),
    queryFn: async () => {
      const { data } = await api.get<Livraison[]>('/livraisons', {
        params: livreurId ? { livreurId } : undefined,
      });
      return data;
    },
    staleTime: 20_000,
  });
}

export function useMajStatutLivraison() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateStatutPayload;
    }) => {
      const { data } = await api.patch<Livraison>(`/livraisons/${id}/statut`, payload);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clesLivraisons.tout });
      void queryClient.invalidateQueries({ queryKey: clesColis.tout });
    },
  });
}

export function useAffecterColis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AffectationPayload) => {
      const { data } = await api.post<Livraison>('/livraisons', payload);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clesLivraisons.tout });
      void queryClient.invalidateQueries({ queryKey: clesColis.tout });
    },
  });
}
