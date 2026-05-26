package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Transfer struct {
	ID                string    `json:"id"`
	UserID            string    `json:"user_id"`
	Type              string    `json:"type"` // internal, domestic, international, card, crypto
	SourceAccountID   string    `json:"source_account_id"`
	DestinationID     string    `json:"destination_id"`
	DestinationType   string    `json:"destination_type"` // account, iban, swift, phone, email, wallet
	Amount            string    `json:"amount"`
	Currency          string    `json:"currency"`
	Fee               string    `json:"fee"`
	ExchangeRate      string    `json:"exchange_rate,omitempty"`
	RecipientCurrency string    `json:"recipient_currency,omitempty"`
	RecipientAmount   string    `json:"recipient_amount,omitempty"`
	Status            string    `json:"status"`
	Reference         string    `json:"reference"`
	Description       string    `json:"description"`
	EstimatedArrival  string    `json:"estimated_arrival,omitempty"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
	CompletedAt       *time.Time `json:"completed_at,omitempty"`
	Version           int       `json:"version"`
}

type Beneficiary struct {
	ID            string    `json:"id"`
	UserID        string    `json:"user_id"`
	Name          string    `json:"name"`
	Nickname      string    `json:"nickname,omitempty"`
	Country       string    `json:"country"`
	BankName      string    `json:"bank_name,omitempty"`
	IBAN          string    `json:"iban,omitempty"`
	SWIFT         string    `json:"swift,omitempty"`
	AccountNumber string    `json:"account_number,omitempty"`
	Email         string    `json:"email,omitempty"`
	Phone         string    `json:"phone,omitempty"`
	IsFavorite    bool      `json:"is_favorite"`
	CreatedAt     time.Time `json:"created_at"`
}

type Repository struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) CreateTransfer(ctx context.Context, t *Transfer) error {
	t.ID = uuid.New().String()
	t.Reference = "TRF-" + uuid.New().String()[:8]
	t.Status = "created"
	t.CreatedAt = time.Now()
	t.UpdatedAt = time.Now()
	t.Version = 1

	_, err := r.pool.Exec(ctx, `
		INSERT INTO transfers (id, user_id, type, source_account_id, destination_id, destination_type,
			amount, currency, fee, exchange_rate, recipient_currency, recipient_amount,
			status, reference, description, estimated_arrival, created_at, updated_at, version)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
	`, t.ID, t.UserID, t.Type, t.SourceAccountID, t.DestinationID, t.DestinationType,
		t.Amount, t.Currency, t.Fee, t.ExchangeRate, t.RecipientCurrency, t.RecipientAmount,
		t.Status, t.Reference, t.Description, t.EstimatedArrival, t.CreatedAt, t.UpdatedAt, t.Version)

	return err
}

func (r *Repository) GetTransferByID(ctx context.Context, id string) (*Transfer, error) {
	t := &Transfer{}
	err := r.pool.QueryRow(ctx, `
		SELECT id, user_id, type, source_account_id, destination_id, destination_type,
			amount, currency, fee, COALESCE(exchange_rate, ''), COALESCE(recipient_currency, ''),
			COALESCE(recipient_amount, ''), status, reference, description,
			COALESCE(estimated_arrival, ''), created_at, updated_at, version
		FROM transfers WHERE id = $1
	`, id).Scan(
		&t.ID, &t.UserID, &t.Type, &t.SourceAccountID, &t.DestinationID, &t.DestinationType,
		&t.Amount, &t.Currency, &t.Fee, &t.ExchangeRate, &t.RecipientCurrency,
		&t.RecipientAmount, &t.Status, &t.Reference, &t.Description,
		&t.EstimatedArrival, &t.CreatedAt, &t.UpdatedAt, &t.Version,
	)
	if err != nil {
		return nil, err
	}
	return t, nil
}

func (r *Repository) GetTransfersByUserID(ctx context.Context, userID string, limit, offset int) ([]Transfer, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, user_id, type, source_account_id, destination_id, destination_type,
			amount, currency, fee, COALESCE(exchange_rate, ''), COALESCE(recipient_currency, ''),
			COALESCE(recipient_amount, ''), status, reference, description,
			COALESCE(estimated_arrival, ''), created_at, updated_at, version
		FROM transfers WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transfers []Transfer
	for rows.Next() {
		var t Transfer
		if err := rows.Scan(&t.ID, &t.UserID, &t.Type, &t.SourceAccountID, &t.DestinationID,
			&t.DestinationType, &t.Amount, &t.Currency, &t.Fee, &t.ExchangeRate,
			&t.RecipientCurrency, &t.RecipientAmount, &t.Status, &t.Reference,
			&t.Description, &t.EstimatedArrival, &t.CreatedAt, &t.UpdatedAt, &t.Version); err != nil {
			return nil, err
		}
		transfers = append(transfers, t)
	}
	return transfers, nil
}

func (r *Repository) UpdateTransferStatus(ctx context.Context, id, status string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE transfers SET status = $2, updated_at = NOW(), version = version + 1
		WHERE id = $1
	`, id, status)
	return err
}

func (r *Repository) CreateBeneficiary(ctx context.Context, b *Beneficiary) error {
	b.ID = uuid.New().String()
	b.CreatedAt = time.Now()

	_, err := r.pool.Exec(ctx, `
		INSERT INTO beneficiaries (id, user_id, name, nickname, country, bank_name,
			iban, swift, account_number, email, phone, is_favorite, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
	`, b.ID, b.UserID, b.Name, b.Nickname, b.Country, b.BankName,
		b.IBAN, b.SWIFT, b.AccountNumber, b.Email, b.Phone, b.IsFavorite, b.CreatedAt)

	return err
}

func (r *Repository) GetBeneficiariesByUserID(ctx context.Context, userID string) ([]Beneficiary, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, user_id, name, COALESCE(nickname, ''), country, COALESCE(bank_name, ''),
			COALESCE(iban, ''), COALESCE(swift, ''), COALESCE(account_number, ''),
			COALESCE(email, ''), COALESCE(phone, ''), is_favorite, created_at
		FROM beneficiaries WHERE user_id = $1
		ORDER BY is_favorite DESC, name ASC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var beneficiaries []Beneficiary
	for rows.Next() {
		var b Beneficiary
		if err := rows.Scan(&b.ID, &b.UserID, &b.Name, &b.Nickname, &b.Country, &b.BankName,
			&b.IBAN, &b.SWIFT, &b.AccountNumber, &b.Email, &b.Phone, &b.IsFavorite, &b.CreatedAt); err != nil {
			return nil, err
		}
		beneficiaries = append(beneficiaries, b)
	}
	return beneficiaries, nil
}

func (r *Repository) DeleteBeneficiary(ctx context.Context, id, userID string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM beneficiaries WHERE id = $1 AND user_id = $2`, id, userID)
	return err
}
