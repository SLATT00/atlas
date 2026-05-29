export interface Account {
  id: string;
  user_id: string;
  currency: string;
  account_type: string;
  account_number: string;
  iban: string;
  swift: string;
  status: string;
  available_balance: number;
  current_balance: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  account_id: string;
  type: string;
  currency: string;
  amount: number;
  fee: number;
  status: string;
  reference: string;
  description: string;
  created_at: string;
}

export interface Card {
  id: string;
  user_id: string;
  card_type: string;
  network: string;
  status: string;
  last4: string;
  expiry_month: number;
  expiry_year: number;
  tokenized: boolean;
  currency: string;
}

export interface CardControls {
  card_id: string;
  online_enabled: boolean;
  atm_enabled: boolean;
  contactless_enabled: boolean;
  country_restrictions: string;
  merchant_restrictions: string;
  daily_limit: number;
  monthly_limit: number;
  transaction_limit: number;
}

export interface Transfer {
  id: string;
  user_id: string;
  type: string;
  source_account_id: string;
  destination_id: string;
  destination_type: string;
  amount: string;
  currency: string;
  fee: string;
  exchange_rate: string;
  recipient_currency: string;
  recipient_amount: string;
  status: string;
  reference: string;
  description: string;
  estimated_arrival: string;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  asset: string;
  network: string;
  address: string;
  balance: number;
  status: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  tx_hash: string;
  network: string;
  direction: 'in' | 'out';
  amount: number;
  fee: number;
  status: string;
  confirmations: number;
  created_at: string;
}

export interface Loan {
  id: string;
  user_id: string;
  loan_type: string;
  loan_amount: number;
  loan_currency: string;
  interest_rate: number;
  status: string;
  ltv: number;
  created_at: string;
}

export interface SavingsAccount {
  id: string;
  user_id: string;
  product_type: string;
  currency: string;
  balance: number;
  apy: number;
  status: string;
}

export interface Beneficiary {
  id: string;
  user_id: string;
  name: string;
  nickname: string;
  country: string;
  bank_name: string;
  iban: string;
  swift: string;
  account_number: string;
  email: string;
  phone: string;
  is_favorite: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  channel: string;
  title: string;
  body: string;
  status: string;
  read: boolean;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  status: string;
  language: string;
  country: string;
  timezone: string;
  created_at: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}
