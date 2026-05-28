package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type UserProfile struct {
	UserID             string  `json:"user_id"`
	FirstName          *string `json:"first_name"`
	LastName           *string `json:"last_name"`
	MiddleName         *string `json:"middle_name"`
	DateOfBirth        *string `json:"date_of_birth"`
	Citizenship        *string `json:"citizenship"`
	TaxResidency       *string `json:"tax_residency"`
	Address            *string `json:"address"`
	VerificationStatus string  `json:"verification_status"`
	AvatarURL          *string `json:"avatar_url"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

type UserPreferences struct {
	UserID               string `json:"user_id"`
	Language             string `json:"language"`
	Theme                string `json:"theme"`
	NotificationsEnabled bool   `json:"notifications_enabled"`
	BiometricEnabled     bool   `json:"biometric_enabled"`
	UpdatedAt            time.Time `json:"updated_at"`
}

type Repository struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) GetProfile(ctx context.Context, userID string) (*UserProfile, error) {
	p := &UserProfile{}
	err := r.pool.QueryRow(ctx, `
		SELECT user_id, first_name, last_name, middle_name, date_of_birth,
			citizenship, tax_residency, address, verification_status, avatar_url, created_at, updated_at
		FROM user_profiles WHERE user_id = $1
	`, userID).Scan(&p.UserID, &p.FirstName, &p.LastName, &p.MiddleName,
		&p.DateOfBirth, &p.Citizenship, &p.TaxResidency, &p.Address,
		&p.VerificationStatus, &p.AvatarURL, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return p, nil
}

func (r *Repository) UpsertProfile(ctx context.Context, p *UserProfile) error {
	p.UpdatedAt = time.Now()
	_, err := r.pool.Exec(ctx, `
		INSERT INTO user_profiles (user_id, first_name, last_name, middle_name, date_of_birth,
			citizenship, tax_residency, address, verification_status, avatar_url, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), $11)
		ON CONFLICT (user_id) DO UPDATE SET
			first_name = EXCLUDED.first_name,
			last_name = EXCLUDED.last_name,
			middle_name = EXCLUDED.middle_name,
			date_of_birth = EXCLUDED.date_of_birth,
			citizenship = EXCLUDED.citizenship,
			tax_residency = EXCLUDED.tax_residency,
			address = EXCLUDED.address,
			avatar_url = EXCLUDED.avatar_url,
			updated_at = EXCLUDED.updated_at
	`, p.UserID, p.FirstName, p.LastName, p.MiddleName, p.DateOfBirth,
		p.Citizenship, p.TaxResidency, p.Address, p.VerificationStatus,
		p.AvatarURL, p.UpdatedAt)
	return err
}

func (r *Repository) GetPreferences(ctx context.Context, userID string) (*UserPreferences, error) {
	pref := &UserPreferences{}
	err := r.pool.QueryRow(ctx, `
		SELECT user_id, language, theme, notifications_enabled, biometric_enabled, updated_at
		FROM user_preferences WHERE user_id = $1
	`, userID).Scan(&pref.UserID, &pref.Language, &pref.Theme,
		&pref.NotificationsEnabled, &pref.BiometricEnabled, &pref.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return pref, nil
}

func (r *Repository) UpsertPreferences(ctx context.Context, pref *UserPreferences) error {
	pref.UpdatedAt = time.Now()
	_, err := r.pool.Exec(ctx, `
		INSERT INTO user_preferences (user_id, language, theme, notifications_enabled, biometric_enabled, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (user_id) DO UPDATE SET
			language = EXCLUDED.language,
			theme = EXCLUDED.theme,
			notifications_enabled = EXCLUDED.notifications_enabled,
			biometric_enabled = EXCLUDED.biometric_enabled,
			updated_at = EXCLUDED.updated_at
	`, pref.UserID, pref.Language, pref.Theme, pref.NotificationsEnabled,
		pref.BiometricEnabled, pref.UpdatedAt)
	return err
}
