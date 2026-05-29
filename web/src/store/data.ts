import { create } from 'zustand';

export interface Account {
  id: string;
  currency: string;
  type: string;
  balance: number;
  available: number;
  number: string;
  iban: string;
  swift: string;
  status: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  description: string;
  amount: number;
  currency: string;
  type: string;
  date: string;
  status: string;
}

export interface CardData {
  id: string;
  type: string;
  typeName: string;
  last4: string;
  network: string;
  status: 'active' | 'frozen';
  currency: string;
  spent: number;
  dailyLimit: number;
  monthlyLimit: number;
  transactionLimit: number;
  expiryMonth: number;
  expiryYear: number;
  holder: string;
  controls: {
    online: boolean;
    contactless: boolean;
    atm: boolean;
    international: boolean;
    subscriptions: boolean;
  };
}

export interface WalletData {
  id: string;
  asset: string;
  name: string;
  network: string;
  balance: number;
  address: string;
  change24h: number;
}

export interface WalletTx {
  id: string;
  walletId: string;
  direction: 'in' | 'out';
  amount: number;
  fee: number;
  txHash: string;
  confirmations: number;
  status: string;
  date: string;
}

export interface TransferRecord {
  id: string;
  recipient: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  fee: number;
  date: string;
}

export interface SavingsProduct {
  id: string;
  name: string;
  currency: string;
  balance: number;
  apy: number;
  status: string;
}

export interface LoanRecord {
  id: string;
  collateral: string;
  amount: number;
  currency: string;
  ltv: number;
  rate: number;
  status: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  date: string;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(`atlas-${key}`);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`atlas-${key}`, JSON.stringify(value));
}

// ─── Default Data ───

const defaultAccounts: Account[] = [
  { id: '1', currency: 'RUB', type: 'checking', balance: 8_450_000, available: 8_200_000, number: '40817810000012345678', iban: 'RU12 3456 7890 1234 5678 9012 345', swift: 'ATLSRUMM', status: 'active' },
  { id: '2', currency: 'USD', type: 'checking', balance: 12_500, available: 12_500, number: '40817840000056789012', iban: 'RU98 7654 3210 9876 5432 1098 765', swift: 'ATLSRUMM', status: 'active' },
  { id: '3', currency: 'EUR', type: 'checking', balance: 8_200, available: 8_200, number: '40817978000090123456', iban: 'RU55 1234 5678 9012 3456 7890 123', swift: 'ATLSRUMM', status: 'active' },
  { id: '4', currency: 'AED', type: 'checking', balance: 45_000, available: 45_000, number: '40817840000034567890', iban: '', swift: 'ATLSRUMM', status: 'active' },
];

const defaultTransactions: Transaction[] = [
  { id: 't1', accountId: '1', description: 'Перевод Алексею П.', amount: -25000, currency: 'RUB', type: 'transfer', date: '2026-05-29T10:30:00Z', status: 'completed' },
  { id: 't2', accountId: '1', description: 'Зарплата ООО "Техно"', amount: 450000, currency: 'RUB', type: 'deposit', date: '2026-05-28T09:00:00Z', status: 'completed' },
  { id: 't3', accountId: '1', description: 'Netflix подписка', amount: -999, currency: 'RUB', type: 'payment', date: '2026-05-27T18:45:00Z', status: 'completed' },
  { id: 't4', accountId: '1', description: 'Обмен BTC → RUB', amount: 180000, currency: 'RUB', type: 'exchange', date: '2026-05-27T14:20:00Z', status: 'completed' },
  { id: 't5', accountId: '1', description: 'Яндекс.Еда', amount: -2350, currency: 'RUB', type: 'payment', date: '2026-05-26T20:10:00Z', status: 'completed' },
  { id: 't6', accountId: '1', description: 'Перевод от Марии И.', amount: 15000, currency: 'RUB', type: 'transfer', date: '2026-05-26T12:00:00Z', status: 'completed' },
  { id: 't7', accountId: '2', description: 'Freelance payment', amount: 2500, currency: 'USD', type: 'deposit', date: '2026-05-25T14:00:00Z', status: 'completed' },
];

const defaultCards: CardData[] = [
  { id: '1', type: 'metal', typeName: 'Atlas Metal', last4: '4829', network: 'Visa', status: 'active', currency: 'RUB', spent: 145000, dailyLimit: 500000, monthlyLimit: 5000000, transactionLimit: 200000, expiryMonth: 12, expiryYear: 2028, holder: 'MIKHAIL IVANOV', controls: { online: true, contactless: true, atm: true, international: true, subscriptions: true } },
  { id: '2', type: 'virtual', typeName: 'Atlas Virtual', last4: '7712', network: 'Mastercard', status: 'active', currency: 'USD', spent: 890, dailyLimit: 5000, monthlyLimit: 50000, transactionLimit: 5000, expiryMonth: 6, expiryYear: 2027, holder: 'MIKHAIL IVANOV', controls: { online: true, contactless: true, atm: false, international: true, subscriptions: true } },
  { id: '3', type: 'travel', typeName: 'Atlas Travel', last4: '3301', network: 'Visa', status: 'frozen', currency: 'EUR', spent: 0, dailyLimit: 10000, monthlyLimit: 100000, transactionLimit: 10000, expiryMonth: 3, expiryYear: 2028, holder: 'MIKHAIL IVANOV', controls: { online: true, contactless: true, atm: true, international: true, subscriptions: false } },
];

const defaultWallets: WalletData[] = [
  { id: '1', asset: 'BTC', name: 'Bitcoin', network: 'bitcoin', balance: 0.4521, address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', change24h: 2.4 },
  { id: '2', asset: 'ETH', name: 'Ethereum', network: 'ethereum', balance: 3.2, address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', change24h: -1.2 },
  { id: '3', asset: 'TON', name: 'Toncoin', network: 'ton', balance: 1500, address: 'EQDtFpEwcFAEcRe5mLVh2N6C0x-_hJEM7W61_JLnSF74p4q2', change24h: 5.1 },
  { id: '4', asset: 'SOL', name: 'Solana', network: 'solana', balance: 25, address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHkv', change24h: 3.8 },
  { id: '5', asset: 'USDT', name: 'Tether', network: 'ethereum', balance: 5000, address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', change24h: 0.01 },
  { id: '6', asset: 'USDC', name: 'USD Coin', network: 'ethereum', balance: 3000, address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', change24h: -0.02 },
];

const defaultSavings: SavingsProduct[] = [
  { id: '1', name: 'RUB Вклад', currency: 'RUB', balance: 500000, apy: 18.5, status: 'active' },
  { id: '2', name: 'USD Вклад', currency: 'USD', balance: 5000, apy: 5.2, status: 'active' },
  { id: '3', name: 'USDT Стейкинг', currency: 'USDT', balance: 10000, apy: 8.0, status: 'active' },
];

const defaultLoans: LoanRecord[] = [
  { id: '1', collateral: 'BTC', amount: 2000000, currency: 'RUB', ltv: 45, rate: 12.5, status: 'active' },
  { id: '2', collateral: 'ETH', amount: 500000, currency: 'RUB', ltv: 52, rate: 13.0, status: 'active' },
];

const defaultNotifications: Notification[] = [
  { id: 'n1', title: 'Перевод получен', body: '+₽15 000 от Марии И.', type: 'transfer', read: false, date: '2026-05-29T10:30:00Z' },
  { id: 'n2', title: 'Карта заморожена', body: 'Atlas Travel •••• 3301 заморожена', type: 'card', read: false, date: '2026-05-28T14:00:00Z' },
  { id: 'n3', title: 'Вход с нового устройства', body: 'MacBook Pro, Москва', type: 'security', read: true, date: '2026-05-27T09:00:00Z' },
  { id: 'n4', title: 'Начислены проценты', body: '+₽253 по RUB Вкладу', type: 'savings', read: true, date: '2026-05-27T00:00:00Z' },
];

// ─── Store ───

interface DataState {
  accounts: Account[];
  transactions: Transaction[];
  cards: CardData[];
  wallets: WalletData[];
  walletTxs: WalletTx[];
  transfers: TransferRecord[];
  savings: SavingsProduct[];
  loans: LoanRecord[];
  notifications: Notification[];

  // Account actions
  updateAccountBalance: (id: string, delta: number) => void;

  // Card actions
  freezeCard: (id: string) => void;
  unfreezeCard: (id: string) => void;
  updateCardControls: (id: string, controls: Partial<CardData['controls']>) => void;
  updateCardLimits: (id: string, limits: { dailyLimit?: number; monthlyLimit?: number; transactionLimit?: number }) => void;

  // Transfer actions
  createTransfer: (transfer: Omit<TransferRecord, 'id' | 'date' | 'status'>) => void;

  // Wallet actions
  createWalletTx: (tx: Omit<WalletTx, 'id' | 'date'>) => void;

  // Exchange
  executeExchange: (fromCurrency: string, toCurrency: string, amount: number, rate: number) => void;

  // Savings
  depositSavings: (id: string, amount: number) => void;
  withdrawSavings: (id: string, amount: number) => void;

  // Loan
  repayLoan: (id: string, amount: number) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (n: Omit<Notification, 'id' | 'date' | 'read'>) => void;

  // Transaction
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
}

let nextId = 1000;
const genId = () => `gen_${++nextId}`;

export const useDataStore = create<DataState>((set, get) => ({
  accounts: loadFromStorage('accounts', defaultAccounts),
  transactions: loadFromStorage('transactions', defaultTransactions),
  cards: loadFromStorage('cards', defaultCards),
  wallets: loadFromStorage('wallets', defaultWallets),
  walletTxs: loadFromStorage('walletTxs', []),
  transfers: loadFromStorage('transfers', []),
  savings: loadFromStorage('savings', defaultSavings),
  loans: loadFromStorage('loans', defaultLoans),
  notifications: loadFromStorage('notifications', defaultNotifications),

  updateAccountBalance: (id, delta) => {
    set((s) => {
      const accounts = s.accounts.map((a) =>
        a.id === id ? { ...a, balance: a.balance + delta, available: a.available + delta } : a
      );
      saveToStorage('accounts', accounts);
      return { accounts };
    });
  },

  freezeCard: (id) => {
    set((s) => {
      const cards = s.cards.map((c) => (c.id === id ? { ...c, status: 'frozen' as const } : c));
      saveToStorage('cards', cards);
      const notif: Notification = { id: genId(), title: 'Карта заморожена', body: `Карта •••• ${cards.find(c => c.id === id)?.last4} заморожена`, type: 'card', read: false, date: new Date().toISOString() };
      const notifications = [notif, ...s.notifications];
      saveToStorage('notifications', notifications);
      return { cards, notifications };
    });
  },

  unfreezeCard: (id) => {
    set((s) => {
      const cards = s.cards.map((c) => (c.id === id ? { ...c, status: 'active' as const } : c));
      saveToStorage('cards', cards);
      return { cards };
    });
  },

  updateCardControls: (id, controls) => {
    set((s) => {
      const cards = s.cards.map((c) =>
        c.id === id ? { ...c, controls: { ...c.controls, ...controls } } : c
      );
      saveToStorage('cards', cards);
      return { cards };
    });
  },

  updateCardLimits: (id, limits) => {
    set((s) => {
      const cards = s.cards.map((c) =>
        c.id === id ? { ...c, ...limits } : c
      );
      saveToStorage('cards', cards);
      return { cards };
    });
  },

  createTransfer: (transfer) => {
    set((s) => {
      const record: TransferRecord = { ...transfer, id: genId(), date: new Date().toISOString(), status: 'completed' };
      const transfers = [record, ...s.transfers];
      saveToStorage('transfers', transfers);

      // Debit sender account (find by currency)
      const senderAcc = s.accounts.find((a) => a.currency === transfer.currency);
      const accounts = senderAcc
        ? s.accounts.map((a) => a.id === senderAcc.id ? { ...a, balance: a.balance - transfer.amount - transfer.fee, available: a.available - transfer.amount - transfer.fee } : a)
        : s.accounts;
      saveToStorage('accounts', accounts);

      // Transaction record
      const tx: Transaction = { id: genId(), accountId: senderAcc?.id || '1', description: `Перевод: ${transfer.recipient}`, amount: -(transfer.amount + transfer.fee), currency: transfer.currency, type: 'transfer', date: new Date().toISOString(), status: 'completed' };
      const transactions = [tx, ...s.transactions];
      saveToStorage('transactions', transactions);

      // Notification
      const notif: Notification = { id: genId(), title: 'Перевод отправлен', body: `-${transfer.amount} ${transfer.currency} → ${transfer.recipient}`, type: 'transfer', read: false, date: new Date().toISOString() };
      const notifications = [notif, ...s.notifications];
      saveToStorage('notifications', notifications);

      return { transfers, accounts, transactions, notifications };
    });
  },

  createWalletTx: (tx) => {
    set((s) => {
      const record: WalletTx = { ...tx, id: genId(), date: new Date().toISOString() };
      const walletTxs = [record, ...s.walletTxs];
      saveToStorage('walletTxs', walletTxs);

      const wallets = s.wallets.map((w) =>
        w.id === tx.walletId
          ? { ...w, balance: tx.direction === 'in' ? w.balance + tx.amount : w.balance - tx.amount - tx.fee }
          : w
      );
      saveToStorage('wallets', wallets);
      return { walletTxs, wallets };
    });
  },

  executeExchange: (fromCurrency, toCurrency, amount, rate) => {
    set((s) => {
      const receiveAmount = amount * rate;

      // Check if fiat or crypto
      const fiatCurrencies = ['RUB', 'USD', 'EUR', 'GBP', 'AED'];
      const isFromFiat = fiatCurrencies.includes(fromCurrency);
      const isToFiat = fiatCurrencies.includes(toCurrency);

      let accounts = [...s.accounts];
      let wallets = [...s.wallets];

      // Debit source
      if (isFromFiat) {
        accounts = accounts.map((a) => a.currency === fromCurrency ? { ...a, balance: a.balance - amount, available: a.available - amount } : a);
      } else {
        wallets = wallets.map((w) => w.asset === fromCurrency ? { ...w, balance: w.balance - amount } : w);
      }

      // Credit destination
      if (isToFiat) {
        accounts = accounts.map((a) => a.currency === toCurrency ? { ...a, balance: a.balance + receiveAmount, available: a.available + receiveAmount } : a);
      } else {
        wallets = wallets.map((w) => w.asset === toCurrency ? { ...w, balance: w.balance + receiveAmount } : w);
      }

      saveToStorage('accounts', accounts);
      saveToStorage('wallets', wallets);

      const tx: Transaction = { id: genId(), accountId: '1', description: `Обмен ${fromCurrency} → ${toCurrency}`, amount: isFromFiat ? -amount : receiveAmount, currency: isFromFiat ? fromCurrency : toCurrency, type: 'exchange', date: new Date().toISOString(), status: 'completed' };
      const transactions = [tx, ...s.transactions];
      saveToStorage('transactions', transactions);

      return { accounts, wallets, transactions };
    });
  },

  depositSavings: (id, amount) => {
    set((s) => {
      const savings = s.savings.map((sa) => sa.id === id ? { ...sa, balance: sa.balance + amount } : sa);
      saveToStorage('savings', savings);

      // Debit main account
      const savingsAcc = s.savings.find((sa) => sa.id === id);
      const currency = savingsAcc?.currency || 'RUB';
      const accounts = s.accounts.map((a) => a.currency === currency ? { ...a, balance: a.balance - amount, available: a.available - amount } : a);
      saveToStorage('accounts', accounts);

      return { savings, accounts };
    });
  },

  withdrawSavings: (id, amount) => {
    set((s) => {
      const savings = s.savings.map((sa) => sa.id === id ? { ...sa, balance: Math.max(0, sa.balance - amount) } : sa);
      saveToStorage('savings', savings);

      const savingsAcc = s.savings.find((sa) => sa.id === id);
      const currency = savingsAcc?.currency || 'RUB';
      const accounts = s.accounts.map((a) => a.currency === currency ? { ...a, balance: a.balance + amount, available: a.available + amount } : a);
      saveToStorage('accounts', accounts);

      return { savings, accounts };
    });
  },

  repayLoan: (id, amount) => {
    set((s) => {
      const loans = s.loans.map((l) => {
        if (l.id !== id) return l;
        const newAmount = l.amount - amount;
        return { ...l, amount: Math.max(0, newAmount), status: newAmount <= 0 ? 'closed' : 'active' };
      });
      saveToStorage('loans', loans);

      const loan = s.loans.find((l) => l.id === id);
      const accounts = s.accounts.map((a) => a.currency === (loan?.currency || 'RUB') ? { ...a, balance: a.balance - amount, available: a.available - amount } : a);
      saveToStorage('accounts', accounts);

      return { loans, accounts };
    });
  },

  markNotificationRead: (id) => {
    set((s) => {
      const notifications = s.notifications.map((n) => n.id === id ? { ...n, read: true } : n);
      saveToStorage('notifications', notifications);
      return { notifications };
    });
  },

  markAllRead: () => {
    set((s) => {
      const notifications = s.notifications.map((n) => ({ ...n, read: true }));
      saveToStorage('notifications', notifications);
      return { notifications };
    });
  },

  addNotification: (n) => {
    set((s) => {
      const notif: Notification = { ...n, id: genId(), date: new Date().toISOString(), read: false };
      const notifications = [notif, ...s.notifications];
      saveToStorage('notifications', notifications);
      return { notifications };
    });
  },

  addTransaction: (t) => {
    set((s) => {
      const tx: Transaction = { ...t, id: genId() };
      const transactions = [tx, ...s.transactions];
      saveToStorage('transactions', transactions);
      return { transactions };
    });
  },
}));
