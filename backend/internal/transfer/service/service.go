package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/atlas-platform/atlas/backend/internal/transfer/repository"
)

var (
	ErrTransferNotFound   = errors.New("transfer not found")
	ErrInvalidTransferType = errors.New("invalid transfer type")
	ErrInsufficientFunds  = errors.New("insufficient funds")
)

var validTransferTypes = map[string]bool{
	"internal":      true,
	"domestic":      true,
	"international": true,
	"card":          true,
	"crypto":        true,
}

type CreateTransferInput struct {
	Type              string `json:"type" binding:"required"`
	SourceAccountID   string `json:"source_account_id" binding:"required"`
	DestinationID     string `json:"destination_id" binding:"required"`
	DestinationType   string `json:"destination_type" binding:"required"`
	Amount            string `json:"amount" binding:"required"`
	Currency          string `json:"currency" binding:"required"`
	RecipientCurrency string `json:"recipient_currency"`
	Description       string `json:"description"`
}

type EstimateInput struct {
	Type              string `json:"type" binding:"required"`
	Amount            string `json:"amount" binding:"required"`
	Currency          string `json:"currency" binding:"required"`
	RecipientCurrency string `json:"recipient_currency"`
	DestinationType   string `json:"destination_type" binding:"required"`
}

type Estimate struct {
	Fee              string `json:"fee"`
	ExchangeRate     string `json:"exchange_rate,omitempty"`
	RecipientAmount  string `json:"recipient_amount,omitempty"`
	EstimatedArrival string `json:"estimated_arrival"`
	TotalCost        string `json:"total_cost"`
}

type Service struct {
	repo *repository.Repository
}

func New(repo *repository.Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) CreateTransfer(ctx context.Context, userID string, input CreateTransferInput) (*repository.Transfer, error) {
	if !validTransferTypes[input.Type] {
		return nil, ErrInvalidTransferType
	}

	transfer := &repository.Transfer{
		UserID:            userID,
		Type:              input.Type,
		SourceAccountID:   input.SourceAccountID,
		DestinationID:     input.DestinationID,
		DestinationType:   input.DestinationType,
		Amount:            input.Amount,
		Currency:          input.Currency,
		RecipientCurrency: input.RecipientCurrency,
		Description:       input.Description,
		Fee:               calculateFee(input.Type, input.Amount),
		EstimatedArrival:  estimateArrival(input.Type),
	}

	if err := s.repo.CreateTransfer(ctx, transfer); err != nil {
		return nil, fmt.Errorf("create transfer: %w", err)
	}

	return transfer, nil
}

func (s *Service) GetTransfer(ctx context.Context, id string) (*repository.Transfer, error) {
	t, err := s.repo.GetTransferByID(ctx, id)
	if err != nil {
		return nil, ErrTransferNotFound
	}
	return t, nil
}

func (s *Service) ListTransfers(ctx context.Context, userID string, page, perPage int) ([]repository.Transfer, error) {
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}
	offset := (page - 1) * perPage
	return s.repo.GetTransfersByUserID(ctx, userID, perPage, offset)
}

func (s *Service) EstimateTransfer(ctx context.Context, input EstimateInput) (*Estimate, error) {
	if !validTransferTypes[input.Type] {
		return nil, ErrInvalidTransferType
	}

	return &Estimate{
		Fee:              calculateFee(input.Type, input.Amount),
		EstimatedArrival: estimateArrival(input.Type),
		TotalCost:        input.Amount,
	}, nil
}

func (s *Service) CreateBeneficiary(ctx context.Context, b *repository.Beneficiary) error {
	return s.repo.CreateBeneficiary(ctx, b)
}

func (s *Service) ListBeneficiaries(ctx context.Context, userID string) ([]repository.Beneficiary, error) {
	return s.repo.GetBeneficiariesByUserID(ctx, userID)
}

func (s *Service) DeleteBeneficiary(ctx context.Context, id, userID string) error {
	return s.repo.DeleteBeneficiary(ctx, id, userID)
}

func calculateFee(transferType, amount string) string {
	switch transferType {
	case "internal":
		return "0.00"
	case "domestic":
		return "50.00"
	case "international":
		return "500.00"
	case "card":
		return "100.00"
	case "crypto":
		return "0.00"
	default:
		return "0.00"
	}
}

func estimateArrival(transferType string) string {
	switch transferType {
	case "internal":
		return "Instant"
	case "domestic":
		return "1-2 hours"
	case "international":
		return "15-60 minutes"
	case "card":
		return "5-30 minutes"
	case "crypto":
		return "10-60 minutes"
	default:
		return "Unknown"
	}
}
