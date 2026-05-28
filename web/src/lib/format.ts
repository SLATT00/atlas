export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    RUB: '₽',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AED: 'د.إ',
    BTC: '₿',
    ETH: 'Ξ',
    USDT: '₮',
    USDC: '₮',
    TON: '◎',
    SOL: '◎',
  };

  const isCrypto = ['BTC', 'ETH', 'TON', 'SOL', 'USDT', 'USDC'].includes(currency);
  const decimals = isCrypto ? (amount < 1 ? 8 : 4) : 2;

  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: isCrypto ? 0 : 2,
    maximumFractionDigits: decimals,
  }).format(amount);

  const symbol = symbols[currency] || currency;
  return `${symbol}${formatted}`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function shortenAddress(address: string, chars = 6): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
