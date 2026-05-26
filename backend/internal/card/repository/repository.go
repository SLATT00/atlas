package repository

import (
	"context"
	"crypto/rand"
	"fmt"
	"math/big"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Card struct {
	ID          string    `json:"id"`
	UserID      string    `json:"user_id"`
	CardType    string    `json:"card_type"`
	Network     string    `json:"network"`
	Status      string    `json:"status"`
	Last4       string    `json:"last4"`
	ExpiryMonth int       `json:"expiry_month"`
	ExpiryYear  int       `json:"expiry_year"`
	Tokenized   bool      `json:"tokenized"`
	Currency    string    `json:"currency"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   *time.Time `json:"-"`
	Version     int       `json:"version"`
}

type CardControls struct {
	CardID               string `json:"card_id"`
	OnlineEnabled        bool   `json:"online_enabled"`
	ATMEnabled           bool   `json:"atm_enabled"`
	ContactlessEnabled   bool   `json:"contactless_enabled"`
	CountryRestrictions  string `json:"country_restrictions"`
	MerchantRestrictions string `json:"merchant_restrictions"`
	DailyLimit           string `json:"daily_limit"`
	MonthlyLimit         string `json:"monthly_limit"`
	TransactionLimit     string `json:"transaction_limit"`
}

type Repository struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) CreateCard(ctx context.Context, userID, cardType, network, currency string) (*Card, error) {
	now := time.Now()
	card := &Card{
		ID:          uuid.New().String(),
		UserID:      userID,
		CardType:    cardType,
		Network:     network,
		Status:      "active",
		Last4:       generateLast4(),
		ExpiryMonth: int(now.Month()),
		ExpiryYear:  now.Year() + 4,
		Currency:    currency,
		CreatedAt:   now,
		UpdatedAt:   now,
		Version:     1,
	}

	_, err := r.pool.Exec(ctx, `
		INSERT INTO cards (id, user_id, card_type, network, status, last4,
			expiry_month, expiry_year, tokenized, currency, created_at, updated_at, version)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
	`, card.ID, card.UserID, card.CardType, card.Network, card.Status,
		card.Last4, card.ExpiryMonth, card.ExpiryYear, card.Tokenized,
		card.Currency, card.CreatedAt, card.UpdatedAt, card.Version)

	if err != nil {
		return nil, err
	}

	// Create default controls
	_, err = r.pool.Exec(ctx, `
		INSERT INTO card_controls (card_id, online_enabled, atm_enabled, contactless_enabled,
			daily_limit, monthly_limit, transaction_limit)
		VALUES ($1, true, true, true, '100000.00', '1000000.00', '50000.00')
	`, card.ID)
	if err != nil {
		return nil, err
	}

	return card, nil
}

func (r *Repository) GetCardByID(ctx context.Context, id string) (*Card, error) {
	card := &Card{}
	err := r.pool.QueryRow(ctx, `
		SELECT id, user_id, card_type, network, status, last4, expiry_month, expiry_year,
			tokenized, currency, created_at, updated_at, version
		FROM cards WHERE id = $1 AND deleted_at IS NULL
	`, id).Scan(
		&card.ID, &card.UserID, &card.CardType, &card.Network, &card.Status,
		&card.Last4, &card.ExpiryMonth, &card.ExpiryYear, &card.Tokenized,
		&card.Currency, &card.CreatedAt, &card.UpdatedAt, &card.Version,
	)
	if err != nil {
		return nil, err
	}
	return card, nil
}

func (r *Repository) GetCardsByUserID(ctx context.Context, userID string) ([]Card, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, user_id, card_type, network, status, last4, expiry_month, expiry_year,
			tokenized, currency, created_at, updated_at, version
		FROM cards WHERE user_id = $1 AND deleted_at IS NULL
		ORDER BY created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cards []Card
	for rows.Next() {
		var c Card
		if err := rows.Scan(&c.ID, &c.UserID, &c.CardType, &c.Network, &c.Status,
			&c.Last4, &c.ExpiryMonth, &c.ExpiryYear, &c.Tokenized,
			&c.Currency, &c.CreatedAt, &c.UpdatedAt, &c.Version); err != nil {
			return nil, err
		}
		cards = append(cards, c)
	}
	return cards, nil
}

func (r *Repository) UpdateCardStatus(ctx context.Context, id, status string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE cards SET status = $2, updated_at = NOW(), version = version + 1
		WHERE id = $1
	`, id, status)
	return err
}

func (r *Repository) GetCardControls(ctx context.Context, cardID string) (*CardControls, error) {
	cc := &CardControls{}
	err := r.pool.QueryRow(ctx, `
		SELECT card_id, online_enabled, atm_enabled, contactless_enabled,
			COALESCE(country_restrictions, ''), COALESCE(merchant_restrictions, ''),
			daily_limit, monthly_limit, transaction_limit
		FROM card_controls WHERE card_id = $1
	`, cardID).Scan(
		&cc.CardID, &cc.OnlineEnabled, &cc.ATMEnabled, &cc.ContactlessEnabled,
		&cc.CountryRestrictions, &cc.MerchantRestrictions,
		&cc.DailyLimit, &cc.MonthlyLimit, &cc.TransactionLimit,
	)
	if err != nil {
		return nil, err
	}
	return cc, nil
}

func (r *Repository) UpdateCardControls(ctx context.Context, cc *CardControls) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE card_controls SET online_enabled = $2, atm_enabled = $3, contactless_enabled = $4,
			country_restrictions = $5, merchant_restrictions = $6,
			daily_limit = $7, monthly_limit = $8, transaction_limit = $9
		WHERE card_id = $1
	`, cc.CardID, cc.OnlineEnabled, cc.ATMEnabled, cc.ContactlessEnabled,
		cc.CountryRestrictions, cc.MerchantRestrictions,
		cc.DailyLimit, cc.MonthlyLimit, cc.TransactionLimit)
	return err
}

func generateLast4() string {
	n, _ := rand.Int(rand.Reader, big.NewInt(10000))
	return fmt.Sprintf("%04d", n.Int64())
}
