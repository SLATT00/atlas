import { useApi, useMutation } from './useApi';
import type { Card, CardControls } from '@/types/api';

export function useCards() {
  return useApi<Card[]>('/api/v1/cards');
}

export function useCard(id: string) {
  return useApi<Card>(`/api/v1/cards/${id}`);
}

export function useFreezeCard(id: string) {
  return useMutation<void, Card>(`/api/v1/cards/${id}/freeze`);
}

export function useUnfreezeCard(id: string) {
  return useMutation<void, Card>(`/api/v1/cards/${id}/unfreeze`);
}

export function useUpdateCardLimits(id: string) {
  return useMutation<Partial<CardControls>, CardControls>(`/api/v1/cards/${id}/limits`);
}
