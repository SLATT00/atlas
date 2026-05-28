package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/atlas-platform/atlas/backend/internal/loan/repository"
)

var (
	ErrLoanNotFound       = errors.New("loan not found")
	ErrInvalidCollateral  = errors.New("unsupported collateral asset")
	ErrInvalidLoanType    = errors.New("invalid loan type")
	ErrLoanAlreadyClosed  = errors.New("loan is already closed")
)

var supportedCollateral = map[string]bool{
	"BTC":  true,
	"ETH":  true,
	"TON":  true,
	"USDT": true,
	"USDC": true,
}

var validLoanTypes = map[string]bool{
	"fixed":          true,
	"flexible":       true,
	"credit_line":    true,
	"premium_credit": true,
	"private_credit": true,
}

type CreateLoanInput struct {
	LoanType     string           `json:"loan_type" binding:"required"`
	LoanAmount   string           `json:"loan_amount" binding:"required"`
	LoanCurrency string           `json:"loan_currency" binding:"required"`
	TermMonths   *int             `json:"term_months"`
	Collateral   []CollateralItem `json:"collateral" binding:"required,min=1"`
}

type CollateralItem struct {
	Asset       string `json:"asset" binding:"required"`
	Amount      string `json:"amount" binding:"required"`
	MarketValue string `json:"market_value" binding:"required"`
}

type RepayInput struct {
	Amount string `json:"amount" binding:"required"`
	Type   string `json:"type"` // partial, full, scheduled, early
}

type TopupInput struct {
	Asset       string `json:"asset" binding:"required"`
	Amount      string `json:"amount" binding:"required"`
	MarketValue string `json:"market_value" binding:"required"`
}

type Service struct {
	repo *repository.Repository
}

func New(repo *repository.Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) CreateLoan(ctx context.Context, userID string, input CreateLoanInput) (*repository.Loan, error) {
	if !validLoanTypes[input.LoanType] {
		return nil, ErrInvalidLoanType
	}

	for _, c := range input.Collateral {
		if !supportedCollateral[c.Asset] {
			return nil, ErrInvalidCollateral
		}
	}

	loan := &repository.Loan{
		UserID:       userID,
		LoanType:     input.LoanType,
		LoanAmount:   input.LoanAmount,
		LoanCurrency: input.LoanCurrency,
		InterestRate: calculateInterestRate(input.LoanType),
		LTV:          "50.00",
		TermMonths:   input.TermMonths,
	}

	if err := s.repo.CreateLoan(ctx, loan); err != nil {
		return nil, fmt.Errorf("create loan: %w", err)
	}

	for _, c := range input.Collateral {
		col := &repository.Collateral{
			LoanID:      loan.ID,
			Asset:       c.Asset,
			Amount:      c.Amount,
			MarketValue: c.MarketValue,
		}
		if err := s.repo.CreateCollateral(ctx, col); err != nil {
			return nil, fmt.Errorf("create collateral: %w", err)
		}
	}

	return loan, nil
}

func (s *Service) GetLoan(ctx context.Context, id string) (*repository.Loan, error) {
	loan, err := s.repo.GetLoanByID(ctx, id)
	if err != nil {
		return nil, ErrLoanNotFound
	}
	return loan, nil
}

func (s *Service) ListLoans(ctx context.Context, userID string) ([]repository.Loan, error) {
	return s.repo.GetLoansByUserID(ctx, userID)
}

func (s *Service) Repay(ctx context.Context, loanID string, input RepayInput) (*repository.Repayment, error) {
	loan, err := s.repo.GetLoanByID(ctx, loanID)
	if err != nil {
		return nil, ErrLoanNotFound
	}
	if loan.Status == "closed" {
		return nil, ErrLoanAlreadyClosed
	}

	repType := input.Type
	if repType == "" {
		repType = "partial"
	}

	rep := &repository.Repayment{
		LoanID: loanID,
		Amount: input.Amount,
		Type:   repType,
	}

	if err := s.repo.CreateRepayment(ctx, rep); err != nil {
		return nil, fmt.Errorf("create repayment: %w", err)
	}

	return rep, nil
}

func (s *Service) TopupCollateral(ctx context.Context, loanID string, input TopupInput) (*repository.Collateral, error) {
	_, err := s.repo.GetLoanByID(ctx, loanID)
	if err != nil {
		return nil, ErrLoanNotFound
	}

	if !supportedCollateral[input.Asset] {
		return nil, ErrInvalidCollateral
	}

	col := &repository.Collateral{
		LoanID:      loanID,
		Asset:       input.Asset,
		Amount:      input.Amount,
		MarketValue: input.MarketValue,
	}

	if err := s.repo.CreateCollateral(ctx, col); err != nil {
		return nil, fmt.Errorf("create collateral: %w", err)
	}

	return col, nil
}

func (s *Service) GetCollateral(ctx context.Context, loanID string) ([]repository.Collateral, error) {
	return s.repo.GetCollateralByLoanID(ctx, loanID)
}

func calculateInterestRate(loanType string) string {
	switch loanType {
	case "fixed":
		return "8.50"
	case "flexible":
		return "10.00"
	case "credit_line":
		return "12.00"
	case "premium_credit":
		return "7.00"
	case "private_credit":
		return "5.50"
	default:
		return "10.00"
	}
}
