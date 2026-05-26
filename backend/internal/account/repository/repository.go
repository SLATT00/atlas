package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Account struct {
	ID               string     `json:"id"`
	UserID           string     `json:"user_id"`
	Currency         string     `json:"currency"`
	AccountType      string     `json:"account_type"`
	AccountNumber    string     `json:"account_number"`
	IBAN             string     `json:"iban,omitempty"`
	SWIFT            string     `json:"swift,omitempty"`
	Status           string     `json:"status"`
	AvailableBalance string     `json:"available_balance"`
	CurrentBalance   string     `json:"current_balance"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
	DeletedAt        *time.Time `json:"-"`
	Version          int        `json:"version"`
}

type Transaction struct {
	ID          string    `json:"id"`
	AccountID   string    `json:"account_id"`
	Type        string    `json:"type"`
	Currency    string    `json:"currency"`
	Amount      string    `json:"amount"`
	Fee         string    `json:"fee"`
	Status      string    `json:"status"`
	Reference   string    `json:"reference"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

type Repository struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) CreateAccount(ctx context.Context, userID, currency, accountType string) (*Account, error) {
	acc := &Account{
		ID:               uuid.New().String(),
		UserID:           userID,
		Currency:         currency,
		AccountType:      accountType,
		AccountNumber:    generateAccountNumber(),
		Status:           "active",
		AvailableBalance: "0.00",
		CurrentBalance:   "0.00",
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
		Version:          1,
	}

	_, err := r.pool.Exec(ctx, `
		INSERT INTO accounts (id, user_id, currency, account_type, account_number, status,
			available_balance, current_balance, created_at, updated_at, version)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`, acc.ID, acc.UserID, acc.Currency, acc.AccountType, acc.AccountNumber,
		acc.Status, acc.AvailableBalance, acc.CurrentBalance, acc.CreatedAt, acc.UpdatedAt, acc.Version)

	if err != nil {
		return nil, err
	}
	return acc, nil
}

func (r *Repository) GetAccountByID(ctx context.Context, id string) (*Account, error) {
	acc := &Account{}
	err := r.pool.QueryRow(ctx, `
		SELECT id, user_id, currency, account_type, account_number, COALESCE(iban, ''),
			COALESCE(swift, ''), status, available_balance, current_balance, created_at, updated_at, version
		FROM accounts WHERE id = $1 AND deleted_at IS NULL
	`, id).Scan(
		&acc.ID, &acc.UserID, &acc.Currency, &acc.AccountType, &acc.AccountNumber,
		&acc.IBAN, &acc.SWIFT, &acc.Status, &acc.AvailableBalance, &acc.CurrentBalance,
		&acc.CreatedAt, &acc.UpdatedAt, &acc.Version,
	)
	if err != nil {
		return nil, err
	}
	return acc, nil
}

func (r *Repository) GetAccountsByUserID(ctx context.Context, userID string) ([]Account, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, user_id, currency, account_type, account_number, COALESCE(iban, ''),
			COALESCE(swift, ''), status, available_balance, current_balance, created_at, updated_at, version
		FROM accounts WHERE user_id = $1 AND deleted_at IS NULL
		ORDER BY created_at ASC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var accounts []Account
	for rows.Next() {
		var acc Account
		if err := rows.Scan(&acc.ID, &acc.UserID, &acc.Currency, &acc.AccountType,
			&acc.AccountNumber, &acc.IBAN, &acc.SWIFT, &acc.Status,
			&acc.AvailableBalance, &acc.CurrentBalance, &acc.CreatedAt, &acc.UpdatedAt, &acc.Version); err != nil {
			return nil, err
		}
		accounts = append(accounts, acc)
	}
	return accounts, nil
}

func (r *Repository) GetTransactionsByAccountID(ctx context.Context, accountID string, limit, offset int) ([]Transaction, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, account_id, type, currency, amount, fee, status, reference, description, created_at
		FROM transactions WHERE account_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`, accountID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var txns []Transaction
	for rows.Next() {
		var t Transaction
		if err := rows.Scan(&t.ID, &t.AccountID, &t.Type, &t.Currency, &t.Amount,
			&t.Fee, &t.Status, &t.Reference, &t.Description, &t.CreatedAt); err != nil {
			return nil, err
		}
		txns = append(txns, t)
	}
	return txns, nil
}

func generateAccountNumber() string {
	return fmt.Sprintf("ATLAS%s", uuid.New().String()[:12])
}
