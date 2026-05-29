import { useApi, useMutation } from './useApi';
import type { Wallet, WalletTransaction } from '@/types/api';

export function useWallets() {
  return useApi<Wallet[]>('/api/v1/wallets');
}

export function useWallet(id: string) {
  return useApi<Wallet>(`/api/v1/wallets/${id}`);
}

export function useWalletHistory(walletId: string) {
  return useApi<WalletTransaction[]>(`/api/v1/wallets/${walletId}/history`);
}

export function useSendCrypto() {
  return useMutation<{
    wallet_id: string;
    address: string;
    amount: string;
    network: string;
  }, WalletTransaction>('/api/v1/wallet/send');
}
