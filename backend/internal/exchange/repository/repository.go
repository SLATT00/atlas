package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ExchangeQuote struct {
	ID                string    `json:"id"`
	UserID            string    `json:"user_id"`
	SourceAsset       string    `json:"source_asset"`
	DestinationAsset  string    `json:"destination_asset"`
	SourceAmount      string    `json:"source_amount"`
	DestinationAmount string    `json:"destination_amount"`
	Rate              string    `json:"rate"`
	Fee               string    `json:"fee"`
	Status            string    `json:"status"`
	ExpiresAt         time.Time `json:"expires_at"`
	CreatedAt         time.Time `json:"created_at"`
}

type ExchangeRate struct {
	ID         string    `json:"id"`
	BaseAsset  string    `json:"base_asset"`
	QuoteAsset string    `json:"quote_asset"`
	Rate       string    `json:"rate"`
	Source     string    `json:"source"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type Repository struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) CreateQuote(ctx context.Context, q *ExchangeQuote) error {
	q.ID = uuid.New().String()
	q.CreatedAt = time.Now()

	_, err := r.pool.Exec(ctx, `
		INSERT INTO exchange_quotes (id, user_id, source_asset, destination_asset, source_amount,
			destination_amount, rate, fee, status, expires_at, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`, q.ID, q.UserID, q.SourceAsset, q.DestinationAsset, q.SourceAmount,
		q.DestinationAmount, q.Rate, q.Fee, q.Status, q.ExpiresAt, q.CreatedAt)
	return err
}

func (r *Repository) GetQuoteByID(ctx context.Context, id string) (*ExchangeQuote, error) {
	q := &ExchangeQuote{}
	err := r.pool.QueryRow(ctx, `
		SELECT id, user_id, source_asset, destination_asset, source_amount,
			destination_amount, rate, fee, status, expires_at, created_at
		FROM exchange_quotes WHERE id = $1
	`, id).Scan(&q.ID, &q.UserID, &q.SourceAsset, &q.DestinationAsset,
		&q.SourceAmount, &q.DestinationAmount, &q.Rate, &q.Fee, &q.Status,
		&q.ExpiresAt, &q.CreatedAt)
	if err != nil {
		return nil, err
	}
	return q, nil
}

func (r *Repository) UpdateQuoteStatus(ctx context.Context, id, status string) error {
	_, err := r.pool.Exec(ctx, `UPDATE exchange_quotes SET status = $2 WHERE id = $1`, id, status)
	return err
}

func (r *Repository) GetQuotesByUserID(ctx context.Context, userID string, limit, offset int) ([]ExchangeQuote, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, user_id, source_asset, destination_asset, source_amount,
			destination_amount, rate, fee, status, expires_at, created_at
		FROM exchange_quotes WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var quotes []ExchangeQuote
	for rows.Next() {
		var q ExchangeQuote
		if err := rows.Scan(&q.ID, &q.UserID, &q.SourceAsset, &q.DestinationAsset,
			&q.SourceAmount, &q.DestinationAmount, &q.Rate, &q.Fee, &q.Status,
			&q.ExpiresAt, &q.CreatedAt); err != nil {
			return nil, err
		}
		quotes = append(quotes, q)
	}
	return quotes, nil
}

func (r *Repository) GetRates(ctx context.Context) ([]ExchangeRate, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, base_asset, quote_asset, rate, source, updated_at
		FROM exchange_rates ORDER BY base_asset, quote_asset
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rates []ExchangeRate
	for rows.Next() {
		var rate ExchangeRate
		if err := rows.Scan(&rate.ID, &rate.BaseAsset, &rate.QuoteAsset, &rate.Rate,
			&rate.Source, &rate.UpdatedAt); err != nil {
			return nil, err
		}
		rates = append(rates, rate)
	}
	return rates, nil
}

func (r *Repository) GetRate(ctx context.Context, base, quote string) (*ExchangeRate, error) {
	rate := &ExchangeRate{}
	err := r.pool.QueryRow(ctx, `
		SELECT id, base_asset, quote_asset, rate, source, updated_at
		FROM exchange_rates WHERE base_asset = $1 AND quote_asset = $2
	`, base, quote).Scan(&rate.ID, &rate.BaseAsset, &rate.QuoteAsset,
		&rate.Rate, &rate.Source, &rate.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return rate, nil
}
