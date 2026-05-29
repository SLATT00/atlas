import { useApi, useMutation } from './useApi';
import type { Transfer, Beneficiary } from '@/types/api';

export function useTransfers(page = 1) {
  return useApi<Transfer[]>(`/api/v1/transfers?page=${page}`);
}

export function useTransfer(id: string) {
  return useApi<Transfer>(`/api/v1/transfers/${id}`);
}

export function useCreateTransfer() {
  return useMutation<{
    type: string;
    source_account_id: string;
    destination_id: string;
    destination_type: string;
    amount: string;
    currency: string;
    description?: string;
  }, Transfer>('/api/v1/transfers');
}

export function useEstimateTransfer() {
  return useMutation<{
    type: string;
    amount: string;
    currency: string;
    destination_type: string;
  }, { fee: string; exchange_rate: string; estimated_arrival: string; total_cost: string }>('/api/v1/transfers/estimate');
}

export function useBeneficiaries() {
  return useApi<Beneficiary[]>('/api/v1/beneficiaries');
}

export function useCreateBeneficiary() {
  return useMutation<Partial<Beneficiary>, Beneficiary>('/api/v1/beneficiaries');
}
