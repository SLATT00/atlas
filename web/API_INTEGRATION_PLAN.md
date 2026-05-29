# ATLAS — API Integration Plan

## Architecture

```
UI Components
    ↓
Custom Hooks (useAccounts, useCards, etc.)
    ↓
Service Layer (services/)
    ↓
Provider/Adapter Layer (providers/)
    ↓
External APIs
```

---

## External API Integrations

### 1. Exchange Rates — Frankfurter API

**URL:** https://api.frankfurter.app/latest

**Integration:**
```
services/exchange-rate.service.ts
providers/frankfurter.provider.ts
```

**Features:**
- GET /latest?from=USD&to=RUB,EUR,GBP,AED
- 5-minute cache in localStorage
- Fallback to hardcoded rates on failure
- Auto-refresh on exchange page open

**Rate limit:** No key required, generous limits

---

### 2. Crypto Market Data — CoinGecko API

**URL:** https://api.coingecko.com/api/v3

**Integration:**
```
services/crypto-price.service.ts
providers/coingecko.provider.ts
```

**Endpoints:**
- `/simple/price?ids=bitcoin,ethereum,toncoin,solana,tether,usd-coin&vs_currencies=rub,usd`
- `/coins/{id}/market_chart?vs_currency=rub&days=7`

**Features:**
- Price updates every 60 seconds
- 7-day chart data for wallet detail
- LocalStorage cache with TTL
- Fallback to last cached prices

**Rate limit:** 10-30 req/min (free tier)

---

### 3. Geolocation — ip-api.com

**URL:** http://ip-api.com/json

**Integration:**
```
services/geolocation.service.ts
providers/ip-api.provider.ts
```

**Features:**
- Login location detection
- Device location in security page
- No API key required
- 45 req/min limit

---

## Service Layer Pattern

```typescript
// services/exchange-rate.service.ts
interface ExchangeRateService {
  getRates(base: string, targets: string[]): Promise<Record<string, number>>;
  getCachedRate(from: string, to: string): number | null;
}

// providers/frankfurter.provider.ts
class FrankfurterProvider implements ExchangeRateService {
  private cache: Map<string, { rate: number; ts: number }>;
  private TTL = 5 * 60 * 1000; // 5 min

  async getRates(base, targets) { ... }
  getCachedRate(from, to) { ... }
}
```

---

## Migration Path

1. Create `services/` directory with interfaces
2. Create `providers/` directory with implementations
3. Create `adapters/` for data transformation
4. Update hooks to use services instead of direct store access
5. Add environment variable toggles for real vs mock providers
