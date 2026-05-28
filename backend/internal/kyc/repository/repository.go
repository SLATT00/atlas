package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Verification struct {
	ID              string     `json:"id"`
	UserID          string     `json:"user_id"`
	Level           string     `json:"level"`
	Status          string     `json:"status"`
	SubmittedAt     *time.Time `json:"submitted_at,omitempty"`
	ReviewedAt      *time.Time `json:"reviewed_at,omitempty"`
	ReviewerID      *string    `json:"reviewer_id,omitempty"`
	RejectionReason *string    `json:"rejection_reason,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

type Document struct {
	ID             string    `json:"id"`
	VerificationID string    `json:"verification_id"`
	DocumentType   string    `json:"document_type"`
	FileURL        string    `json:"file_url"`
	Status         string    `json:"status"`
	CreatedAt      time.Time `json:"created_at"`
}

type Repository struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) GetLatestVerification(ctx context.Context, userID string) (*Verification, error) {
	v := &Verification{}
	err := r.pool.QueryRow(ctx, `
		SELECT id, user_id, level, status, submitted_at, reviewed_at, reviewer_id,
			rejection_reason, created_at, updated_at
		FROM kyc_verifications WHERE user_id = $1
		ORDER BY created_at DESC LIMIT 1
	`, userID).Scan(&v.ID, &v.UserID, &v.Level, &v.Status, &v.SubmittedAt,
		&v.ReviewedAt, &v.ReviewerID, &v.RejectionReason, &v.CreatedAt, &v.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return v, nil
}

func (r *Repository) CreateVerification(ctx context.Context, v *Verification) error {
	v.ID = uuid.New().String()
	v.Status = "pending"
	now := time.Now()
	v.CreatedAt = now
	v.UpdatedAt = now
	v.SubmittedAt = &now

	_, err := r.pool.Exec(ctx, `
		INSERT INTO kyc_verifications (id, user_id, level, status, submitted_at, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, v.ID, v.UserID, v.Level, v.Status, v.SubmittedAt, v.CreatedAt, v.UpdatedAt)
	return err
}

func (r *Repository) CreateDocument(ctx context.Context, doc *Document) error {
	doc.ID = uuid.New().String()
	doc.Status = "pending"
	doc.CreatedAt = time.Now()

	_, err := r.pool.Exec(ctx, `
		INSERT INTO kyc_documents (id, verification_id, document_type, file_url, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, doc.ID, doc.VerificationID, doc.DocumentType, doc.FileURL, doc.Status, doc.CreatedAt)
	return err
}

func (r *Repository) GetDocumentsByVerificationID(ctx context.Context, verificationID string) ([]Document, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, verification_id, document_type, file_url, status, created_at
		FROM kyc_documents WHERE verification_id = $1
		ORDER BY created_at ASC
	`, verificationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var docs []Document
	for rows.Next() {
		var d Document
		if err := rows.Scan(&d.ID, &d.VerificationID, &d.DocumentType,
			&d.FileURL, &d.Status, &d.CreatedAt); err != nil {
			return nil, err
		}
		docs = append(docs, d)
	}
	return docs, nil
}
