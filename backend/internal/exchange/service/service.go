package service

import (
	"context"
	"errors"
	"fmt"
	"math/big"
	"time"

	"github.com/atlas-platform/atlas/backend/internal/exchange/repository"
)

var (
	ErrQuoteNotFound  = errors.New("quote not found")
	ErrQuoteExpired   = errors.New("quote has expired")
	ErrInvalidPair    = errors.New("unsupported currency pair")
	ErrAlreadyExecuted = errors.New("quote already executed")
)

var supportedAssets = map[string]bool{
	"RUB": true, "USD": true, "EUR": true, "GBP": true, "AED": true,
	"BTC": true, "ETH": true, "TON": true, "SOL": true, "USDT": true, "USDC": true,
}

// Hardcoded rates for demo (in production, fetched from providers)
var demoRates = map[string]map[string]string{
	"USD": {"RUB": "89.50", "EUR": "0.92", "GBP": "0.79", "AED": "3.67"},
	"RUB": {"USD": "0.0112", "EUR": "0.0103", "GBP": "0.0088"},
	"BTC": {"USD": "67500.00", "RUB": "6041250.00"},
	"ETH": {"USD": "3450.00", "RUB": "308775.00"},
	"TON": {"USD": "6.50", "RUB": "581.75"},
	"SOL": {"USD": "172.00", "RUB": "15394.00"},
}

type QuoteInput struct {
	SourceAsset      string `json:"source_asset" binding:"required"`
	DestinationAsset string `json:"destination_asset" binding:"required"`
	SourceAmount     string `json:"source_amount" binding:"required"`
}

type ExecuteInput struct {
	QuoteID string `json:"quote_id" binding:"required"`
}

type Service struct {
	repo *repository.Repository
}

func New(repo *repository.Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetQuote(ctx context.Context, userID string, input QuoteInput) (*repository.ExchangeQuote, error) {
	if !supportedAssets[input.SourceAsset] || !supportedAssets[input.DestinationAsset] {
		return nil, ErrInvalidPair
	}

	rate := getRate(input.SourceAsset, input.DestinationAsset)
	if rate == "" {
		return nil, ErrInvalidPair
	}

	srcAmount, _, _ := new(big.Float).Parse(input.SourceAmount, 10)
	rateFloat, _, _ := new(big.Float).Parse(rate, 10)
	destAmount := new(big.Float).Mul(srcAmount, rateFloat)

	feeRate := new(big.Float).SetFloat64(0.005) // 0.5% fee
	fee := new(big.Float).Mul(srcAmount, feeRate)

	quote := &repository.ExchangeQuote{
		UserID:            userID,
		SourceAsset:       input.SourceAsset,
		DestinationAsset:  input.DestinationAsset,
		SourceAmount:      input.SourceAmount,
		DestinationAmount: destAmount.Text('f', 8),
		Rate:              rate,
		Fee:               fee.Text('f', 8),
		Status:            "pending",
		ExpiresAt:         time.Now().Add(30 * time.Second),
	}

	if err := s.repo.CreateQuote(ctx, quote); err != nil {
		return nil, fmt.Errorf("create quote: %w", err)
	}

	return quote, nil
}

func (s *Service) Execute(ctx context.Context, userID string, input ExecuteInput) (*repository.ExchangeQuote, error) {
	quote, err := s.repo.GetQuoteByID(ctx, input.QuoteID)
	if err != nil {
		return nil, ErrQuoteNotFound
	}

	if quote.UserID != userID {
		return nil, ErrQuoteNotFound
	}

	if quote.Status != "pending" {
		return nil, ErrAlreadyExecuted
	}

	if time.Now().After(quote.ExpiresAt) {
		s.repo.UpdateQuoteStatus(ctx, quote.ID, "expired")
		return nil, ErrQuoteExpired
	}

	if err := s.repo.UpdateQuoteStatus(ctx, quote.ID, "completed"); err != nil {
		return nil, fmt.Errorf("execute quote: %w", err)
	}

	quote.Status = "completed"
	return quote, nil
}

func (s *Service) GetRates(ctx context.Context) ([]repository.ExchangeRate, error) {
	return s.repo.GetRates(ctx)
}

func (s *Service) GetHistory(ctx context.Context, userID string, page, perPage int) ([]repository.ExchangeQuote, error) {
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}
	offset := (page - 1) * perPage
	return s.repo.GetQuotesByUserID(ctx, userID, perPage, offset)
}

func getRate(source, dest string) string {
	if rates, ok := demoRates[source]; ok {
		if rate, ok := rates[dest]; ok {
			return rate
		}
	}
	// Try reverse
	if rates, ok := demoRates[dest]; ok {
		if rate, ok := rates[source]; ok {
			r, _, _ := new(big.Float).Parse(rate, 10)
			one := new(big.Float).SetFloat64(1.0)
			inverse := new(big.Float).Quo(one, r)
			return inverse.Text('f', 8)
		}
	}
	return ""
}
