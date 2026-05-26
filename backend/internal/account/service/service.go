package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/atlas-platform/atlas/backend/internal/account/repository"
)

var (
	ErrAccountNotFound = errors.New("account not found")
	ErrInvalidCurrency = errors.New("unsupported currency")
)

var supportedCurrencies = map[string]bool{
	"RUB": true,
	"USD": true,
	"EUR": true,
	"GBP": true,
	"AED": true,
}

type OpenAccountInput struct {
	Currency    string `json:"currency" binding:"required"`
	AccountType string `json:"account_type"`
}

type Service struct {
	repo *repository.Repository
}

func New(repo *repository.Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) OpenAccount(ctx context.Context, userID string, input OpenAccountInput) (*repository.Account, error) {
	if !supportedCurrencies[input.Currency] {
		return nil, ErrInvalidCurrency
	}

	accountType := input.AccountType
	if accountType == "" {
		accountType = "checking"
	}

	acc, err := s.repo.CreateAccount(ctx, userID, input.Currency, accountType)
	if err != nil {
		return nil, fmt.Errorf("create account: %w", err)
	}

	return acc, nil
}

func (s *Service) GetAccount(ctx context.Context, id string) (*repository.Account, error) {
	acc, err := s.repo.GetAccountByID(ctx, id)
	if err != nil {
		return nil, ErrAccountNotFound
	}
	return acc, nil
}

func (s *Service) ListAccounts(ctx context.Context, userID string) ([]repository.Account, error) {
	return s.repo.GetAccountsByUserID(ctx, userID)
}

func (s *Service) GetTransactions(ctx context.Context, accountID string, page, perPage int) ([]repository.Transaction, error) {
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}
	offset := (page - 1) * perPage
	return s.repo.GetTransactionsByAccountID(ctx, accountID, perPage, offset)
}
