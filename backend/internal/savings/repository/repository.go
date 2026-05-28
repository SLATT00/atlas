package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SavingsAccount struct {
	ID              string    `json:"id"`
	UserID          string    `json:"user_id"`
	ProductType     string    `json:"product_type"`
	Currency        string    `json:"currency"`
	Balance         string    `json:"balance"`
	APY             string    `json:"apy"`
	Status          string    `json:"status"`
	AccruedInterest string    `json:"accrued_interest"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	Version         int       `json:"version"`
}

type SavingsTransaction struct {
	ID               string    `json:"id"`
	SavingsAccountID string    `json:"savings_account_id"`
	Type             string    `json:"type"` // deposit, withdrawal, interest
	Amount           string    `json:"amount"`
	CreatedAt        time.Time `json:"created_at"`
}

type Repository struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) CreateSavingsAccount(ctx context.Context, sa *SavingsAccount) error {
	sa.ID = uuid.New().String()
	sa.Balance = "0.00"
	sa.Status = "active"
	sa.AccruedInterest = "0.00"
	sa.CreatedAt = time.Now()
	sa.UpdatedAt = time.Now()
	sa.Version = 1

	_, err := r.pool.Exec(ctx, `
		INSERT INTO savings_accounts (id, user_id, product_type, currency, balance, apy, status,
			accrued_interest, created_at, updated_at, version)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`, sa.ID, sa.UserID, sa.ProductType, sa.Currency, sa.Balance, sa.APY,
		sa.Status, sa.AccruedInterest, sa.CreatedAt, sa.UpdatedAt, sa.Version)
	return err
}

func (r *Repository) GetSavingsAccountByID(ctx context.Context, id string) (*SavingsAccount, error) {
	sa := &SavingsAccount{}
	err := r.pool.QueryRow(ctx, `
		SELECT id, user_id, product_type, currency, balance, apy, status,
			accrued_interest, created_at, updated_at, version
		FROM savings_accounts WHERE id = $1
	`, id).Scan(&sa.ID, &sa.UserID, &sa.ProductType, &sa.Currency, &sa.Balance,
		&sa.APY, &sa.Status, &sa.AccruedInterest, &sa.CreatedAt, &sa.UpdatedAt, &sa.Version)
	if err != nil {
		return nil, err
	}
	return sa, nil
}

func (r *Repository) GetSavingsAccountsByUserID(ctx context.Context, userID string) ([]SavingsAccount, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, user_id, product_type, currency, balance, apy, status,
			accrued_interest, created_at, updated_at, version
		FROM savings_accounts WHERE user_id = $1
		ORDER BY created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var accounts []SavingsAccount
	for rows.Next() {
		var sa SavingsAccount
		if err := rows.Scan(&sa.ID, &sa.UserID, &sa.ProductType, &sa.Currency, &sa.Balance,
			&sa.APY, &sa.Status, &sa.AccruedInterest, &sa.CreatedAt, &sa.UpdatedAt, &sa.Version); err != nil {
			return nil, err
		}
		accounts = append(accounts, sa)
	}
	return accounts, nil
}

func (r *Repository) CreateTransaction(ctx context.Context, tx *SavingsTransaction) error {
	tx.ID = uuid.New().String()
	tx.CreatedAt = time.Now()

	_, err := r.pool.Exec(ctx, `
		INSERT INTO savings_transactions (id, savings_account_id, type, amount, created_at)
		VALUES ($1, $2, $3, $4, $5)
	`, tx.ID, tx.SavingsAccountID, tx.Type, tx.Amount, tx.CreatedAt)
	return err
}

func (r *Repository) UpdateBalance(ctx context.Context, id, balance string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE savings_accounts SET balance = $2, updated_at = NOW(), version = version + 1
		WHERE id = $1
	`, id, balance)
	return err
}
