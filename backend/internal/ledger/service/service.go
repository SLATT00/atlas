package service

import (
	"context"
	"errors"
	"fmt"
	"math/big"

	"github.com/atlas-platform/atlas/backend/internal/ledger/repository"
)

var (
	ErrUnbalancedEntry = errors.New("journal entry must balance to zero")
	ErrNoEntries       = errors.New("at least two entries required")
	ErrEntryNotFound   = errors.New("entry not found")
)

type CreateEntryInput struct {
	TransactionID string        `json:"transaction_id" binding:"required"`
	Description   string        `json:"description" binding:"required"`
	Entries       []EntryInput  `json:"entries" binding:"required,min=2"`
}

type EntryInput struct {
	AccountID string `json:"account_id" binding:"required"`
	EntryType string `json:"entry_type" binding:"required,oneof=debit credit"`
	Amount    string `json:"amount" binding:"required"`
	Currency  string `json:"currency" binding:"required"`
}

type Service struct {
	repo *repository.Repository
}

func New(repo *repository.Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) CreateEntry(ctx context.Context, input CreateEntryInput) (*repository.JournalEntry, error) {
	if len(input.Entries) < 2 {
		return nil, ErrNoEntries
	}

	// Validate double-entry: sum of debits must equal sum of credits
	debits := new(big.Float)
	credits := new(big.Float)

	var entries []repository.LedgerEntry
	for _, e := range input.Entries {
		amount, _, err := new(big.Float).Parse(e.Amount, 10)
		if err != nil {
			return nil, fmt.Errorf("invalid amount: %s", e.Amount)
		}

		if e.EntryType == "debit" {
			debits.Add(debits, amount)
		} else {
			credits.Add(credits, amount)
		}

		entries = append(entries, repository.LedgerEntry{
			AccountID: e.AccountID,
			EntryType: e.EntryType,
			Amount:    e.Amount,
			Currency:  e.Currency,
		})
	}

	if debits.Cmp(credits) != 0 {
		return nil, ErrUnbalancedEntry
	}

	journal, err := s.repo.CreateJournalEntry(ctx, input.TransactionID, input.Description, entries)
	if err != nil {
		return nil, fmt.Errorf("create journal entry: %w", err)
	}

	return journal, nil
}

func (s *Service) GetEntry(ctx context.Context, id string) (*repository.JournalEntry, []repository.LedgerEntry, error) {
	journal, entries, err := s.repo.GetJournalEntry(ctx, id)
	if err != nil {
		return nil, nil, ErrEntryNotFound
	}
	return journal, entries, nil
}

func (s *Service) GetBalance(ctx context.Context, accountID string) (string, error) {
	return s.repo.GetBalance(ctx, accountID)
}

func (s *Service) ListEntries(ctx context.Context, accountID string, page, perPage int) ([]repository.LedgerEntry, error) {
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}
	offset := (page - 1) * perPage
	return s.repo.GetEntriesByAccountID(ctx, accountID, perPage, offset)
}
