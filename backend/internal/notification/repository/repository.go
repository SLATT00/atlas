package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Notification struct {
	ID        string     `json:"id"`
	UserID    string     `json:"user_id"`
	Type      string     `json:"type"` // transfer, card, security, loan, savings, system
	Channel   string     `json:"channel"` // push, email, sms, in_app
	Title     string     `json:"title"`
	Body      string     `json:"body"`
	Data      *string    `json:"data,omitempty"`
	Status    string     `json:"status"`
	Read      bool       `json:"read"`
	CreatedAt time.Time  `json:"created_at"`
	SentAt    *time.Time `json:"sent_at,omitempty"`
}

type Repository struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) Create(ctx context.Context, n *Notification) error {
	n.ID = uuid.New().String()
	n.Status = "pending"
	n.Read = false
	n.CreatedAt = time.Now()

	_, err := r.pool.Exec(ctx, `
		INSERT INTO notifications (id, user_id, type, channel, title, body, data, status, read, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`, n.ID, n.UserID, n.Type, n.Channel, n.Title, n.Body, n.Data, n.Status, n.Read, n.CreatedAt)
	return err
}

func (r *Repository) GetByUserID(ctx context.Context, userID string, limit, offset int) ([]Notification, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, user_id, type, channel, title, body, data, status, read, created_at, sent_at
		FROM notifications WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []Notification
	for rows.Next() {
		var n Notification
		if err := rows.Scan(&n.ID, &n.UserID, &n.Type, &n.Channel, &n.Title, &n.Body,
			&n.Data, &n.Status, &n.Read, &n.CreatedAt, &n.SentAt); err != nil {
			return nil, err
		}
		notifications = append(notifications, n)
	}
	return notifications, nil
}

func (r *Repository) MarkRead(ctx context.Context, id, userID string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2
	`, id, userID)
	return err
}

func (r *Repository) MarkAllRead(ctx context.Context, userID string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE notifications SET read = TRUE WHERE user_id = $1 AND read = FALSE
	`, userID)
	return err
}

func (r *Repository) UnreadCount(ctx context.Context, userID string) (int64, error) {
	var count int64
	err := r.pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = FALSE
	`, userID).Scan(&count)
	return count, err
}
