# ATLAS — Global Digital Bank

> One account. All money. Everywhere.

ATLAS is a global financial operating system combining banking, payments, cards, international transfers, digital asset infrastructure, savings products, asset-backed lending, and wealth management inside a single ecosystem.

## Architecture

```
├── backend/          # Go microservices
├── web/              # Next.js frontend (TypeScript)
├── mobile/           # Flutter mobile app (Dart)
├── infrastructure/   # Terraform, K8s, Docker
├── docs/             # Architecture & API documentation
├── proto/            # Shared protobuf definitions
└── scripts/          # Development & deployment scripts
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Go 1.22+, PostgreSQL, Redis, Kafka, OpenSearch |
| Frontend | Next.js 14, TypeScript, Zustand, TailwindCSS |
| Mobile | Flutter 3.x, Dart |
| Infrastructure | Docker, Kubernetes, Terraform |
| Observability | Prometheus, Grafana, OpenTelemetry |
| CI/CD | GitHub Actions |

## Microservices

| Service | Port | Database | Description |
|---------|------|----------|-------------|
| api-gateway | 8080 | — | API Gateway, routing, rate limiting |
| auth-service | 8001 | auth_db | Authentication, MFA, sessions |
| user-service | 8002 | user_db | User profiles, preferences |
| kyc-service | 8003 | kyc_db | Identity & document verification |
| compliance-service | 8004 | compliance_db | AML, sanctions, PEP screening |
| account-service | 8005 | accounts_db | Fiat accounts, balances |
| ledger-service | 8006 | ledger_db | Double-entry accounting |
| transaction-service | 8007 | transactions_db | Transaction lifecycle |
| transfer-service | 8008 | transfers_db | Payment routing & transfers |
| exchange-service | 8009 | exchange_db | FX & crypto conversion |
| card-service | 8010 | cards_db | Card management |
| wallet-service | 8011 | wallet_db | Custodial crypto wallets |
| blockchain-service | 8012 | blockchain_db | Blockchain monitoring |
| loan-service | 8013 | loan_db | Asset-backed lending |
| savings-service | 8014 | savings_db | Savings & yield |
| notification-service | 8015 | notification_db | Push, email, SMS |
| analytics-service | 8016 | analytics_db | Reporting & metrics |
| audit-service | 8017 | audit_db | Event logging & compliance |

## Quick Start

```bash
# Start infrastructure
docker-compose up -d

# Run migrations
make migrate

# Start all services
make run

# Run tests
make test
```

## Development

```bash
# Install dependencies
make deps

# Generate protobuf
make proto

# Lint
make lint

# Run specific service
make run-service SERVICE=auth-service
```

## Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

## Documentation

- [Architecture Overview](docs/architecture/README.md)
- [API Reference](docs/api/README.md)
- [Database Schema](docs/database/README.md)
- [Deployment Guide](docs/deployment/README.md)
- [Security](docs/security/README.md)

## License

Proprietary — All rights reserved.
