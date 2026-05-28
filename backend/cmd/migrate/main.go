package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/atlas-platform/atlas/backend/pkg/config"
	"github.com/jackc/pgx/v5/pgxpool"
)

var migrations = map[string][]string{
	"auth_db": {
		`CREATE TABLE IF NOT EXISTS users (
			id VARCHAR(36) PRIMARY KEY,
			email VARCHAR(255) UNIQUE NOT NULL,
			phone VARCHAR(20) UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			status VARCHAR(20) NOT NULL DEFAULT 'active',
			language VARCHAR(5) NOT NULL DEFAULT 'ru',
			country VARCHAR(5),
			timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			deleted_at TIMESTAMPTZ,
			version INTEGER NOT NULL DEFAULT 1
		)`,
		`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL`,
		`CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE deleted_at IS NULL`,
		`CREATE TABLE IF NOT EXISTS sessions (
			id VARCHAR(36) PRIMARY KEY,
			user_id VARCHAR(36) NOT NULL REFERENCES users(id),
			device TEXT,
			ip VARCHAR(45),
			location TEXT,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			expires_at TIMESTAMPTZ NOT NULL
		)`,
		`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`,
	},
	"accounts_db": {
		`CREATE TABLE IF NOT EXISTS accounts (
			id VARCHAR(36) PRIMARY KEY,
			user_id VARCHAR(36) NOT NULL,
			currency VARCHAR(5) NOT NULL,
			account_type VARCHAR(20) NOT NULL DEFAULT 'checking',
			account_number VARCHAR(30) UNIQUE NOT NULL,
			iban VARCHAR(34),
			swift VARCHAR(11),
			status VARCHAR(20) NOT NULL DEFAULT 'active',
			available_balance NUMERIC(20,2) NOT NULL DEFAULT 0,
			current_balance NUMERIC(20,2) NOT NULL DEFAULT 0,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			deleted_at TIMESTAMPTZ,
			version INTEGER NOT NULL DEFAULT 1
		)`,
		`CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id) WHERE deleted_at IS NULL`,
		`CREATE TABLE IF NOT EXISTS transactions (
			id VARCHAR(36) PRIMARY KEY,
			account_id VARCHAR(36) NOT NULL REFERENCES accounts(id),
			type VARCHAR(30) NOT NULL,
			currency VARCHAR(5) NOT NULL,
			amount NUMERIC(20,8) NOT NULL,
			fee NUMERIC(20,8) NOT NULL DEFAULT 0,
			status VARCHAR(20) NOT NULL DEFAULT 'completed',
			reference VARCHAR(50),
			description TEXT,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id)`,
		`CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC)`,
	},
	"ledger_db": {
		`CREATE TABLE IF NOT EXISTS journal_entries (
			id VARCHAR(36) PRIMARY KEY,
			transaction_id VARCHAR(36) NOT NULL,
			description TEXT NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS ledger_entries (
			id VARCHAR(36) PRIMARY KEY,
			journal_entry_id VARCHAR(36) NOT NULL REFERENCES journal_entries(id),
			account_id VARCHAR(36) NOT NULL,
			entry_type VARCHAR(6) NOT NULL CHECK (entry_type IN ('debit', 'credit')),
			amount NUMERIC(20,8) NOT NULL,
			currency VARCHAR(5) NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_ledger_entries_account ON ledger_entries(account_id)`,
		`CREATE INDEX IF NOT EXISTS idx_ledger_entries_journal ON ledger_entries(journal_entry_id)`,
	},
	"transfers_db": {
		`CREATE TABLE IF NOT EXISTS transfers (
			id VARCHAR(36) PRIMARY KEY,
			user_id VARCHAR(36) NOT NULL,
			type VARCHAR(20) NOT NULL,
			source_account_id VARCHAR(36) NOT NULL,
			destination_id VARCHAR(100) NOT NULL,
			destination_type VARCHAR(20) NOT NULL,
			amount NUMERIC(20,8) NOT NULL,
			currency VARCHAR(5) NOT NULL,
			fee NUMERIC(20,8) NOT NULL DEFAULT 0,
			exchange_rate VARCHAR(30),
			recipient_currency VARCHAR(5),
			recipient_amount NUMERIC(20,8),
			status VARCHAR(20) NOT NULL DEFAULT 'created',
			reference VARCHAR(50) UNIQUE NOT NULL,
			description TEXT,
			estimated_arrival TEXT,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			completed_at TIMESTAMPTZ,
			version INTEGER NOT NULL DEFAULT 1
		)`,
		`CREATE INDEX IF NOT EXISTS idx_transfers_user_id ON transfers(user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_transfers_status ON transfers(status)`,
		`CREATE TABLE IF NOT EXISTS beneficiaries (
			id VARCHAR(36) PRIMARY KEY,
			user_id VARCHAR(36) NOT NULL,
			name VARCHAR(255) NOT NULL,
			nickname VARCHAR(100),
			country VARCHAR(5),
			bank_name VARCHAR(255),
			iban VARCHAR(34),
			swift VARCHAR(11),
			account_number VARCHAR(30),
			email VARCHAR(255),
			phone VARCHAR(20),
			is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_beneficiaries_user_id ON beneficiaries(user_id)`,
	},
	"cards_db": {
		`CREATE TABLE IF NOT EXISTS cards (
			id VARCHAR(36) PRIMARY KEY,
			user_id VARCHAR(36) NOT NULL,
			card_type VARCHAR(20) NOT NULL,
			network VARCHAR(20) NOT NULL DEFAULT 'visa',
			status VARCHAR(20) NOT NULL DEFAULT 'active',
			last4 VARCHAR(4) NOT NULL,
			expiry_month INTEGER NOT NULL,
			expiry_year INTEGER NOT NULL,
			tokenized BOOLEAN NOT NULL DEFAULT FALSE,
			currency VARCHAR(5) NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			deleted_at TIMESTAMPTZ,
			version INTEGER NOT NULL DEFAULT 1
		)`,
		`CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id) WHERE deleted_at IS NULL`,
		`CREATE TABLE IF NOT EXISTS card_controls (
			card_id VARCHAR(36) PRIMARY KEY REFERENCES cards(id),
			online_enabled BOOLEAN NOT NULL DEFAULT TRUE,
			atm_enabled BOOLEAN NOT NULL DEFAULT TRUE,
			contactless_enabled BOOLEAN NOT NULL DEFAULT TRUE,
			country_restrictions TEXT,
			merchant_restrictions TEXT,
			daily_limit NUMERIC(20,2) NOT NULL DEFAULT 100000,
			monthly_limit NUMERIC(20,2) NOT NULL DEFAULT 1000000,
			transaction_limit NUMERIC(20,2) NOT NULL DEFAULT 50000
		)`,
	},
	"wallet_db": {
		`CREATE TABLE IF NOT EXISTS wallets (
			id VARCHAR(36) PRIMARY KEY,
			user_id VARCHAR(36) NOT NULL,
			asset VARCHAR(10) NOT NULL,
			network VARCHAR(20) NOT NULL,
			address VARCHAR(100) NOT NULL,
			balance NUMERIC(30,8) NOT NULL DEFAULT 0,
			status VARCHAR(20) NOT NULL DEFAULT 'active',
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			version INTEGER NOT NULL DEFAULT 1
		)`,
		`CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id)`,
		`CREATE TABLE IF NOT EXISTS wallet_transactions (
			id VARCHAR(36) PRIMARY KEY,
			wallet_id VARCHAR(36) NOT NULL REFERENCES wallets(id),
			tx_hash VARCHAR(100),
			network VARCHAR(20) NOT NULL,
			direction VARCHAR(3) NOT NULL CHECK (direction IN ('in', 'out')),
			amount NUMERIC(30,8) NOT NULL,
			fee NUMERIC(30,8) NOT NULL DEFAULT 0,
			status VARCHAR(20) NOT NULL DEFAULT 'pending',
			confirmations INTEGER NOT NULL DEFAULT 0,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet_id ON wallet_transactions(wallet_id)`,
	},
	"loan_db": {
		`CREATE TABLE IF NOT EXISTS loans (
			id VARCHAR(36) PRIMARY KEY,
			user_id VARCHAR(36) NOT NULL,
			loan_type VARCHAR(30) NOT NULL DEFAULT 'fixed',
			loan_amount NUMERIC(20,2) NOT NULL,
			loan_currency VARCHAR(5) NOT NULL,
			interest_rate NUMERIC(5,2) NOT NULL,
			status VARCHAR(20) NOT NULL DEFAULT 'pending',
			ltv NUMERIC(5,2) NOT NULL,
			term_months INTEGER,
			monthly_payment NUMERIC(20,2),
			total_repaid NUMERIC(20,2) NOT NULL DEFAULT 0,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			version INTEGER NOT NULL DEFAULT 1
		)`,
		`CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status)`,
		`CREATE TABLE IF NOT EXISTS loan_collateral (
			id VARCHAR(36) PRIMARY KEY,
			loan_id VARCHAR(36) NOT NULL REFERENCES loans(id),
			asset VARCHAR(10) NOT NULL,
			amount NUMERIC(30,8) NOT NULL,
			market_value NUMERIC(20,2) NOT NULL,
			liquidation_price NUMERIC(20,8),
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_collateral_loan_id ON loan_collateral(loan_id)`,
		`CREATE TABLE IF NOT EXISTS loan_repayments (
			id VARCHAR(36) PRIMARY KEY,
			loan_id VARCHAR(36) NOT NULL REFERENCES loans(id),
			amount NUMERIC(20,2) NOT NULL,
			type VARCHAR(20) NOT NULL DEFAULT 'scheduled',
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
	},
	"savings_db": {
		`CREATE TABLE IF NOT EXISTS savings_accounts (
			id VARCHAR(36) PRIMARY KEY,
			user_id VARCHAR(36) NOT NULL,
			product_type VARCHAR(30) NOT NULL,
			currency VARCHAR(5) NOT NULL,
			balance NUMERIC(20,8) NOT NULL DEFAULT 0,
			apy NUMERIC(5,2) NOT NULL,
			status VARCHAR(20) NOT NULL DEFAULT 'active',
			accrued_interest NUMERIC(20,8) NOT NULL DEFAULT 0,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			version INTEGER NOT NULL DEFAULT 1
		)`,
		`CREATE INDEX IF NOT EXISTS idx_savings_user_id ON savings_accounts(user_id)`,
		`CREATE TABLE IF NOT EXISTS savings_transactions (
			id VARCHAR(36) PRIMARY KEY,
			savings_account_id VARCHAR(36) NOT NULL REFERENCES savings_accounts(id),
			type VARCHAR(20) NOT NULL,
			amount NUMERIC(20,8) NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
	},
	"exchange_db": {
		`CREATE TABLE IF NOT EXISTS exchange_quotes (
			id VARCHAR(36) PRIMARY KEY,
			user_id VARCHAR(36) NOT NULL,
			source_asset VARCHAR(10) NOT NULL,
			destination_asset VARCHAR(10) NOT NULL,
			source_amount NUMERIC(30,8) NOT NULL,
			destination_amount NUMERIC(30,8) NOT NULL,
			rate NUMERIC(20,8) NOT NULL,
			fee NUMERIC(20,8) NOT NULL DEFAULT 0,
			status VARCHAR(20) NOT NULL DEFAULT 'pending',
			expires_at TIMESTAMPTZ NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_exchange_quotes_user_id ON exchange_quotes(user_id)`,
		`CREATE TABLE IF NOT EXISTS exchange_rates (
			id VARCHAR(36) PRIMARY KEY,
			base_asset VARCHAR(10) NOT NULL,
			quote_asset VARCHAR(10) NOT NULL,
			rate NUMERIC(20,8) NOT NULL,
			source VARCHAR(50) NOT NULL DEFAULT 'internal',
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			UNIQUE(base_asset, quote_asset)
		)`,
	},
	"notification_db": {
		`CREATE TABLE IF NOT EXISTS notifications (
			id VARCHAR(36) PRIMARY KEY,
			user_id VARCHAR(36) NOT NULL,
			type VARCHAR(20) NOT NULL,
			channel VARCHAR(20) NOT NULL,
			title VARCHAR(255) NOT NULL,
			body TEXT NOT NULL,
			data JSONB,
			status VARCHAR(20) NOT NULL DEFAULT 'pending',
			read BOOLEAN NOT NULL DEFAULT FALSE,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			sent_at TIMESTAMPTZ
		)`,
		`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status)`,
	},
	"user_db": {
		`CREATE TABLE IF NOT EXISTS user_profiles (
			user_id VARCHAR(36) PRIMARY KEY,
			first_name VARCHAR(100),
			last_name VARCHAR(100),
			middle_name VARCHAR(100),
			date_of_birth DATE,
			citizenship VARCHAR(5),
			tax_residency VARCHAR(5),
			address JSONB,
			verification_status VARCHAR(20) NOT NULL DEFAULT 'unverified',
			avatar_url TEXT,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS user_preferences (
			user_id VARCHAR(36) PRIMARY KEY,
			language VARCHAR(5) NOT NULL DEFAULT 'ru',
			theme VARCHAR(10) NOT NULL DEFAULT 'dark',
			notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
			biometric_enabled BOOLEAN NOT NULL DEFAULT FALSE,
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
	},
	"kyc_db": {
		`CREATE TABLE IF NOT EXISTS kyc_verifications (
			id VARCHAR(36) PRIMARY KEY,
			user_id VARCHAR(36) NOT NULL,
			level VARCHAR(20) NOT NULL DEFAULT 'basic',
			status VARCHAR(20) NOT NULL DEFAULT 'pending',
			submitted_at TIMESTAMPTZ,
			reviewed_at TIMESTAMPTZ,
			reviewer_id VARCHAR(36),
			rejection_reason TEXT,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_kyc_user_id ON kyc_verifications(user_id)`,
		`CREATE TABLE IF NOT EXISTS kyc_documents (
			id VARCHAR(36) PRIMARY KEY,
			verification_id VARCHAR(36) NOT NULL REFERENCES kyc_verifications(id),
			document_type VARCHAR(30) NOT NULL,
			file_url TEXT NOT NULL,
			status VARCHAR(20) NOT NULL DEFAULT 'pending',
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
	},
	"compliance_db": {
		`CREATE TABLE IF NOT EXISTS compliance_cases (
			id VARCHAR(36) PRIMARY KEY,
			user_id VARCHAR(36) NOT NULL,
			type VARCHAR(30) NOT NULL,
			status VARCHAR(20) NOT NULL DEFAULT 'open',
			risk_score INTEGER NOT NULL DEFAULT 0,
			notes TEXT,
			assigned_to VARCHAR(36),
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_compliance_cases_user_id ON compliance_cases(user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_compliance_cases_status ON compliance_cases(status)`,
		`CREATE TABLE IF NOT EXISTS screening_results (
			id VARCHAR(36) PRIMARY KEY,
			user_id VARCHAR(36) NOT NULL,
			screening_type VARCHAR(20) NOT NULL,
			result VARCHAR(20) NOT NULL DEFAULT 'clear',
			matched_entity TEXT,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
	},
	"audit_db": {
		`CREATE TABLE IF NOT EXISTS audit_logs (
			id VARCHAR(36) PRIMARY KEY,
			actor_id VARCHAR(36) NOT NULL,
			event_type VARCHAR(50) NOT NULL,
			entity_type VARCHAR(50) NOT NULL,
			entity_id VARCHAR(36) NOT NULL,
			old_value JSONB,
			new_value JSONB,
			ip_address VARCHAR(45),
			user_agent TEXT,
			correlation_id VARCHAR(36),
			timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_audit_actor_id ON audit_logs(actor_id)`,
		`CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id)`,
		`CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC)`,
	},
	"analytics_db": {
		`CREATE TABLE IF NOT EXISTS analytics_events (
			id VARCHAR(36) PRIMARY KEY,
			user_id VARCHAR(36),
			event_name VARCHAR(100) NOT NULL,
			properties JSONB,
			session_id VARCHAR(36),
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON analytics_events(event_name)`,
		`CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at DESC)`,
	},
	"transactions_db": {
		`CREATE TABLE IF NOT EXISTS transactions (
			id VARCHAR(36) PRIMARY KEY,
			account_id VARCHAR(36) NOT NULL,
			type VARCHAR(30) NOT NULL,
			currency VARCHAR(5) NOT NULL,
			amount NUMERIC(20,8) NOT NULL,
			fee NUMERIC(20,8) NOT NULL DEFAULT 0,
			status VARCHAR(20) NOT NULL DEFAULT 'completed',
			reference VARCHAR(50),
			description TEXT,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_txn_account_id ON transactions(account_id)`,
		`CREATE INDEX IF NOT EXISTS idx_txn_created_at ON transactions(created_at DESC)`,
	},
	"blockchain_db": {
		`CREATE TABLE IF NOT EXISTS monitored_addresses (
			id VARCHAR(36) PRIMARY KEY,
			address VARCHAR(100) NOT NULL,
			network VARCHAR(20) NOT NULL,
			wallet_id VARCHAR(36) NOT NULL,
			last_checked_block BIGINT NOT NULL DEFAULT 0,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_monitored_addresses_network ON monitored_addresses(network)`,
		`CREATE TABLE IF NOT EXISTS blockchain_deposits (
			id VARCHAR(36) PRIMARY KEY,
			address VARCHAR(100) NOT NULL,
			network VARCHAR(20) NOT NULL,
			tx_hash VARCHAR(100) UNIQUE NOT NULL,
			amount NUMERIC(30,8) NOT NULL,
			confirmations INTEGER NOT NULL DEFAULT 0,
			required_confirmations INTEGER NOT NULL DEFAULT 6,
			status VARCHAR(20) NOT NULL DEFAULT 'pending',
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			confirmed_at TIMESTAMPTZ
		)`,
	},
}

func main() {
	if len(os.Args) < 2 {
		log.Fatal("Usage: migrate [up|down]")
	}

	action := os.Args[1]
	if action != "up" {
		log.Fatal("Only 'up' is supported currently")
	}

	cfg := config.Load("migrate")
	ctx := context.Background()

	for dbName, stmts := range migrations {
		dsn := fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=%s",
			cfg.Postgres.User, cfg.Postgres.Password, cfg.Postgres.Host,
			cfg.Postgres.Port, dbName, cfg.Postgres.SSLMode)

		pool, err := pgxpool.New(ctx, dsn)
		if err != nil {
			log.Printf("WARN: cannot connect to %s: %v (skipping)", dbName, err)
			continue
		}

		for _, stmt := range stmts {
			_, err := pool.Exec(ctx, stmt)
			if err != nil {
				log.Printf("ERROR: %s: %v", dbName, err)
				pool.Close()
				continue
			}
		}

		log.Printf("OK: %s migrated (%d statements)", dbName, len(stmts))
		pool.Close()
	}

	log.Println("Migration complete")
}
