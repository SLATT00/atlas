package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	Phone        string    `json:"phone"`
	PasswordHash string    `json:"-"`
	Status       string    `json:"status"`
	Language     string    `json:"language"`
	Country      string    `json:"country"`
	Timezone     string    `json:"timezone"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	DeletedAt    *time.Time `json:"-"`
	Version      int       `json:"version"`
}

type Session struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Device    string    `json:"device"`
	IP        string    `json:"ip"`
	Location  string    `json:"location"`
	CreatedAt time.Time `json:"created_at"`
	ExpiresAt time.Time `json:"expires_at"`
}

type Repository struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) CreateUser(ctx context.Context, email, phone, passwordHash, language, country string) (*User, error) {
	user := &User{
		ID:           uuid.New().String(),
		Email:        email,
		Phone:        phone,
		PasswordHash: passwordHash,
		Status:       "active",
		Language:     language,
		Country:      country,
		Timezone:     "UTC",
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
		Version:      1,
	}

	_, err := r.pool.Exec(ctx, `
		INSERT INTO users (id, email, phone, password_hash, status, language, country, timezone, created_at, updated_at, version)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`, user.ID, user.Email, user.Phone, user.PasswordHash, user.Status,
		user.Language, user.Country, user.Timezone, user.CreatedAt, user.UpdatedAt, user.Version)

	if err != nil {
		return nil, err
	}

	return user, nil
}

func (r *Repository) GetUserByEmail(ctx context.Context, email string) (*User, error) {
	user := &User{}
	err := r.pool.QueryRow(ctx, `
		SELECT id, email, phone, password_hash, status, language, country, timezone, created_at, updated_at, version
		FROM users WHERE email = $1 AND deleted_at IS NULL
	`, email).Scan(
		&user.ID, &user.Email, &user.Phone, &user.PasswordHash,
		&user.Status, &user.Language, &user.Country, &user.Timezone,
		&user.CreatedAt, &user.UpdatedAt, &user.Version,
	)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *Repository) GetUserByPhone(ctx context.Context, phone string) (*User, error) {
	user := &User{}
	err := r.pool.QueryRow(ctx, `
		SELECT id, email, phone, password_hash, status, language, country, timezone, created_at, updated_at, version
		FROM users WHERE phone = $1 AND deleted_at IS NULL
	`, phone).Scan(
		&user.ID, &user.Email, &user.Phone, &user.PasswordHash,
		&user.Status, &user.Language, &user.Country, &user.Timezone,
		&user.CreatedAt, &user.UpdatedAt, &user.Version,
	)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *Repository) GetUserByID(ctx context.Context, id string) (*User, error) {
	user := &User{}
	err := r.pool.QueryRow(ctx, `
		SELECT id, email, phone, password_hash, status, language, country, timezone, created_at, updated_at, version
		FROM users WHERE id = $1 AND deleted_at IS NULL
	`, id).Scan(
		&user.ID, &user.Email, &user.Phone, &user.PasswordHash,
		&user.Status, &user.Language, &user.Country, &user.Timezone,
		&user.CreatedAt, &user.UpdatedAt, &user.Version,
	)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *Repository) CreateSession(ctx context.Context, session *Session) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO sessions (id, user_id, device, ip, location, created_at, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, session.ID, session.UserID, session.Device, session.IP, session.Location,
		session.CreatedAt, session.ExpiresAt)
	return err
}

func (r *Repository) GetSessionsByUserID(ctx context.Context, userID string) ([]Session, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, user_id, device, ip, location, created_at, expires_at
		FROM sessions WHERE user_id = $1 AND expires_at > NOW()
		ORDER BY created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []Session
	for rows.Next() {
		var s Session
		if err := rows.Scan(&s.ID, &s.UserID, &s.Device, &s.IP, &s.Location,
			&s.CreatedAt, &s.ExpiresAt); err != nil {
			return nil, err
		}
		sessions = append(sessions, s)
	}
	return sessions, nil
}

func (r *Repository) DeleteSession(ctx context.Context, sessionID, userID string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM sessions WHERE id = $1 AND user_id = $2`, sessionID, userID)
	return err
}

func (r *Repository) DeleteAllSessions(ctx context.Context, userID string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM sessions WHERE user_id = $1`, userID)
	return err
}

func (r *Repository) EmailExists(ctx context.Context, email string) (bool, error) {
	var exists bool
	err := r.pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1 AND deleted_at IS NULL)`, email).Scan(&exists)
	return exists, err
}

func (r *Repository) PhoneExists(ctx context.Context, phone string) (bool, error) {
	var exists bool
	err := r.pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM users WHERE phone = $1 AND deleted_at IS NULL)`, phone).Scan(&exists)
	return exists, err
}
