import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  Role,
  Utilisateur,
} from '../types';

export const clesUsers = {
  tout: ['users'] as const,
  liste: (role?: Role) => ['users', 'liste', role ?? 'tous'] as const,
  moi: ['users', 'moi'] as const,
};

export function useConnexion() {
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await api.post<AuthResponse>('/users/login', payload);
      return data;
    },
  });
}

export function useInscription() {
  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const { data } = await api.post<AuthResponse>('/users/register', payload);
      return data;
    },
  });
}

export function useMoi(actif = true) {
  return useQuery({
    queryKey: clesUsers.moi,
    queryFn: async () => {
      const { data } = await api.get<Utilisateur>('/users/me');
      return data;
    },
    enabled: actif,
    staleTime: 60_000,
  });
}

export function useUtilisateurs(role?: Role) {
  return useQuery({
    queryKey: clesUsers.liste(role),
    queryFn: async () => {
      const { data } = await api.get<Utilisateur[]>('/users', {
        params: role ? { role } : undefined,
      });
      return data;
    },
  });
}

export function useMajProfil() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Utilisateur>) => {
      const { data } = await api.patch<Utilisateur>('/users/me', payload);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clesUsers.tout });
    },
  });
}

export function useMajMotDePasse() {
  return useMutation({
    mutationFn: async (payload: { actuel: string; nouveau: string }) => {
      await api.patch('/users/me/password', payload);
      return true;
    },
  });
}

export function useBasculerUtilisateur() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, actif }: { id: string; actif: boolean }) => {
      const { data } = await api.patch<Utilisateur>(`/users/${id}`, { actif });
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: clesUsers.tout });
    },
  });
}
