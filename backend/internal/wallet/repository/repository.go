package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Wallet struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Asset     string    `json:"asset"`
	Network   string    `json:"network"`
	Address   string    `json:"address"`
	Balance   string    `json:"balance"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Version   int       `json:"version"`
}

type WalletTransaction struct {
	ID            string    `json:"id"`
	WalletID      string    `json:"wallet_id"`
	TxHash        string    `json:"tx_hash"`
	Network       string    `json:"network"`
	Direction     string    `json:"direction"` // in, out
	Amount        string    `json:"amount"`
	Fee           string    `json:"fee"`
	Status        string    `json:"status"`
	Confirmations int       `json:"confirmations"`
	CreatedAt     time.Time `json:"created_at"`
}

type Repository struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) CreateWallet(ctx context.Context, userID, asset, network, address string) (*Wallet, error) {
	w := &Wallet{
		ID:        uuid.New().String(),
		UserID:    userID,
		Asset:     asset,
		Network:   network,
		Address:   address,
		Balance:   "0.00000000",
		Status:    "active",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		Version:   1,
	}

	_, err := r.pool.Exec(ctx, `
		INSERT INTO wallets (id, user_id, asset, network, address, balance, status, created_at, updated_at, version)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`, w.ID, w.UserID, w.Asset, w.Network, w.Address, w.Balance, w.Status,
		w.CreatedAt, w.UpdatedAt, w.Version)

	if err != nil {
		return nil, err
	}
	return w, nil
}

func (r *Repository) GetWalletByID(ctx context.Context, id string) (*Wallet, error) {
	w := &Wallet{}
	err := r.pool.QueryRow(ctx, `
		SELECT id, user_id, asset, network, address, balance, status, created_at, updated_at, version
		FROM wallets WHERE id = $1
	`, id).Scan(&w.ID, &w.UserID, &w.Asset, &w.Network, &w.Address,
		&w.Balance, &w.Status, &w.CreatedAt, &w.UpdatedAt, &w.Version)
	if err != nil {
		return nil, err
	}
	return w, nil
}

func (r *Repository) GetWalletsByUserID(ctx context.Context, userID string) ([]Wallet, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, user_id, asset, network, address, balance, status, created_at, updated_at, version
		FROM wallets WHERE user_id = $1
		ORDER BY created_at ASC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var wallets []Wallet
	for rows.Next() {
		var w Wallet
		if err := rows.Scan(&w.ID, &w.UserID, &w.Asset, &w.Network, &w.Address,
			&w.Balance, &w.Status, &w.CreatedAt, &w.UpdatedAt, &w.Version); err != nil {
			return nil, err
		}
		wallets = append(wallets, w)
	}
	return wallets, nil
}

func (r *Repository) CreateTransaction(ctx context.Context, tx *WalletTransaction) error {
	tx.ID = uuid.New().String()
	tx.CreatedAt = time.Now()

	_, err := r.pool.Exec(ctx, `
		INSERT INTO wallet_transactions (id, wallet_id, tx_hash, network, direction, amount, fee, status, confirmations, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`, tx.ID, tx.WalletID, tx.TxHash, tx.Network, tx.Direction,
		tx.Amount, tx.Fee, tx.Status, tx.Confirmations, tx.CreatedAt)

	return err
}

func (r *Repository) GetTransactionsByUserID(ctx context.Context, userID string, limit, offset int) ([]WalletTransaction, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT wt.id, wt.wallet_id, wt.tx_hash, wt.network, wt.direction, wt.amount, wt.fee,
			wt.status, wt.confirmations, wt.created_at
		FROM wallet_transactions wt
		JOIN wallets w ON w.id = wt.wallet_id
		WHERE w.user_id = $1
		ORDER BY wt.created_at DESC
		LIMIT $2 OFFSET $3
	`, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var txns []WalletTransaction
	for rows.Next() {
		var t WalletTransaction
		if err := rows.Scan(&t.ID, &t.WalletID, &t.TxHash, &t.Network, &t.Direction,
			&t.Amount, &t.Fee, &t.Status, &t.Confirmations, &t.CreatedAt); err != nil {
			return nil, err
		}
		txns = append(txns, t)
	}
	return txns, nil
}
