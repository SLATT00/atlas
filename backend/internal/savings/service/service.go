package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/atlas-platform/atlas/backend/internal/savings/repository"
)

var (
	ErrSavingsNotFound  = errors.New("savings account not found")
	ErrInvalidProduct   = errors.New("unsupported savings product")
	ErrInvalidCurrency  = errors.New("unsupported currency")
	ErrSavingsInactive  = errors.New("savings account is inactive")
)

var validProducts = map[string]string{
	"rub_savings":        "5.50",
	"usd_savings":        "3.00",
	"eur_savings":        "2.50",
	"stablecoin_savings": "8.00",
}

type OpenSavingsInput struct {
	ProductType string `json:"product_type" binding:"required"`
	Currency    string `json:"currency" binding:"required"`
}

type AmountInput struct {
	Amount string `json:"amount" binding:"required"`
}

type Service struct {
	repo *repository.Repository
}

func New(repo *repository.Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) OpenSavings(ctx context.Context, userID string, input OpenSavingsInput) (*repository.SavingsAccount, error) {
	apy, ok := validProducts[input.ProductType]
	if !ok {
		return nil, ErrInvalidProduct
	}

	sa := &repository.SavingsAccount{
		UserID:      userID,
		ProductType: input.ProductType,
		Currency:    input.Currency,
		APY:         apy,
	}

	if err := s.repo.CreateSavingsAccount(ctx, sa); err != nil {
		return nil, fmt.Errorf("create savings: %w", err)
	}

	return sa, nil
}

func (s *Service) GetSavings(ctx context.Context, id string) (*repository.SavingsAccount, error) {
	sa, err := s.repo.GetSavingsAccountByID(ctx, id)
	if err != nil {
		return nil, ErrSavingsNotFound
	}
	return sa, nil
}

func (s *Service) ListSavings(ctx context.Context, userID string) ([]repository.SavingsAccount, error) {
	return s.repo.GetSavingsAccountsByUserID(ctx, userID)
}

func (s *Service) Deposit(ctx context.Context, savingsID string, input AmountInput) (*repository.SavingsTransaction, error) {
	_, err := s.repo.GetSavingsAccountByID(ctx, savingsID)
	if err != nil {
		return nil, ErrSavingsNotFound
	}

	tx := &repository.SavingsTransaction{
		SavingsAccountID: savingsID,
		Type:             "deposit",
		Amount:           input.Amount,
	}

	if err := s.repo.CreateTransaction(ctx, tx); err != nil {
		return nil, fmt.Errorf("create deposit: %w", err)
	}

	return tx, nil
}

func (s *Service) Withdraw(ctx context.Context, savingsID string, input AmountInput) (*repository.SavingsTransaction, error) {
	_, err := s.repo.GetSavingsAccountByID(ctx, savingsID)
	if err != nil {
		return nil, ErrSavingsNotFound
	}

	tx := &repository.SavingsTransaction{
		SavingsAccountID: savingsID,
		Type:             "withdrawal",
		Amount:           input.Amount,
	}

	if err := s.repo.CreateTransaction(ctx, tx); err != nil {
		return nil, fmt.Errorf("create withdrawal: %w", err)
	}

	return tx, nil
}
