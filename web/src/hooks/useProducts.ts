import { useApi, useMutation } from './useApi';
import type { Loan, SavingsAccount } from '@/types/api';

export function useLoans() {
  return useApi<Loan[]>('/api/v1/loans');
}

export function useLoan(id: string) {
  return useApi<Loan>(`/api/v1/loans/${id}`);
}

export function useCreateLoan() {
  return useMutation<{
    collateral_asset: string;
    collateral_amount: string;
    loan_currency: string;
    loan_amount: string;
  }, Loan>('/api/v1/loans');
}

export function useRepayLoan() {
  return useMutation<{ loan_id: string; amount: string }, Loan>('/api/v1/loans/repay');
}

export function useSavings() {
  return useApi<SavingsAccount[]>('/api/v1/savings');
}

export function useOpenSavings() {
  return useMutation<{
    product_type: string;
    currency: string;
    amount: string;
  }, SavingsAccount>('/api/v1/savings/open');
}
