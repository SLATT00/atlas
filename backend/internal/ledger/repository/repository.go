package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type JournalEntry struct {
	ID            string    `json:"id"`
	TransactionID string    `json:"transaction_id"`
	Description   string    `json:"description"`
	CreatedAt     time.Time `json:"created_at"`
}

type LedgerEntry struct {
	ID             string    `json:"id"`
	JournalEntryID string    `json:"journal_entry_id"`
	AccountID      string    `json:"account_id"`
	EntryType      string    `json:"entry_type"` // debit or credit
	Amount         string    `json:"amount"`
	Currency       string    `json:"currency"`
	Balance        string    `json:"balance"`
	CreatedAt      time.Time `json:"created_at"`
}

type Repository struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) CreateJournalEntry(ctx context.Context, txID, description string, entries []LedgerEntry) (*JournalEntry, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	journal := &JournalEntry{
		ID:            uuid.New().String(),
		TransactionID: txID,
		Description:   description,
		CreatedAt:     time.Now(),
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO journal_entries (id, transaction_id, description, created_at)
		VALUES ($1, $2, $3, $4)
	`, journal.ID, journal.TransactionID, journal.Description, journal.CreatedAt)
	if err != nil {
		return nil, err
	}

	for i := range entries {
		entries[i].ID = uuid.New().String()
		entries[i].JournalEntryID = journal.ID
		entries[i].CreatedAt = time.Now()

		_, err = tx.Exec(ctx, `
			INSERT INTO ledger_entries (id, journal_entry_id, account_id, entry_type, amount, currency, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
		`, entries[i].ID, entries[i].JournalEntryID, entries[i].AccountID,
			entries[i].EntryType, entries[i].Amount, entries[i].Currency, entries[i].CreatedAt)
		if err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return journal, nil
}

func (r *Repository) GetJournalEntry(ctx context.Context, id string) (*JournalEntry, []LedgerEntry, error) {
	journal := &JournalEntry{}
	err := r.pool.QueryRow(ctx, `
		SELECT id, transaction_id, description, created_at
		FROM journal_entries WHERE id = $1
	`, id).Scan(&journal.ID, &journal.TransactionID, &journal.Description, &journal.CreatedAt)
	if err != nil {
		return nil, nil, err
	}

	rows, err := r.pool.Query(ctx, `
		SELECT id, journal_entry_id, account_id, entry_type, amount, currency, created_at
		FROM ledger_entries WHERE journal_entry_id = $1
		ORDER BY created_at ASC
	`, id)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	var entries []LedgerEntry
	for rows.Next() {
		var e LedgerEntry
		if err := rows.Scan(&e.ID, &e.JournalEntryID, &e.AccountID, &e.EntryType,
			&e.Amount, &e.Currency, &e.CreatedAt); err != nil {
			return nil, nil, err
		}
		entries = append(entries, e)
	}

	return journal, entries, nil
}

func (r *Repository) GetBalance(ctx context.Context, accountID string) (string, error) {
	var balance string
	err := r.pool.QueryRow(ctx, `
		SELECT COALESCE(
			(SELECT SUM(CASE WHEN entry_type = 'credit' THEN amount::numeric ELSE -amount::numeric END)
			 FROM ledger_entries WHERE account_id = $1),
			0
		)::text
	`, accountID).Scan(&balance)
	return balance, err
}

func (r *Repository) GetEntriesByAccountID(ctx context.Context, accountID string, limit, offset int) ([]LedgerEntry, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, journal_entry_id, account_id, entry_type, amount, currency, created_at
		FROM ledger_entries WHERE account_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`, accountID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []LedgerEntry
	for rows.Next() {
		var e LedgerEntry
		if err := rows.Scan(&e.ID, &e.JournalEntryID, &e.AccountID, &e.EntryType,
			&e.Amount, &e.Currency, &e.CreatedAt); err != nil {
			return nil, err
		}
		entries = append(entries, e)
	}
	return entries, nil
}
