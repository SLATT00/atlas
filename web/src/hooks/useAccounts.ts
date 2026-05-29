import { useApi, useMutation } from './useApi';
import type { Account, Transaction } from '@/types/api';

export function useAccounts() {
  return useApi<Account[]>('/api/v1/accounts');
}

export function useAccount(id: string) {
  return useApi<Account>(`/api/v1/accounts/${id}`);
}

export function useAccountTransactions(accountId: string, page = 1) {
  return useApi<Transaction[]>(`/api/v1/accounts/${accountId}/transactions?page=${page}`);
}

export function useOpenAccount() {
  return useMutation<{ currency: string; account_type?: string }, Account>('/api/v1/accounts/open');
}
