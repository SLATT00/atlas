package service

import (
	"context"
	"errors"

	"github.com/atlas-platform/atlas/backend/internal/user/repository"
)

var (
	ErrProfileNotFound = errors.New("profile not found")
)

type UpdateProfileInput struct {
	FirstName    *string `json:"first_name"`
	LastName     *string `json:"last_name"`
	MiddleName   *string `json:"middle_name"`
	DateOfBirth  *string `json:"date_of_birth"`
	Citizenship  *string `json:"citizenship"`
	TaxResidency *string `json:"tax_residency"`
	Address      *string `json:"address"`
	AvatarURL    *string `json:"avatar_url"`
}

type UpdatePreferencesInput struct {
	Language             *string `json:"language"`
	Theme                *string `json:"theme"`
	NotificationsEnabled *bool   `json:"notifications_enabled"`
	BiometricEnabled     *bool   `json:"biometric_enabled"`
}

type Service struct {
	repo *repository.Repository
}

func New(repo *repository.Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetProfile(ctx context.Context, userID string) (*repository.UserProfile, error) {
	p, err := s.repo.GetProfile(ctx, userID)
	if err != nil {
		return nil, ErrProfileNotFound
	}
	return p, nil
}

func (s *Service) UpdateProfile(ctx context.Context, userID string, input UpdateProfileInput) (*repository.UserProfile, error) {
	profile := &repository.UserProfile{
		UserID:             userID,
		FirstName:          input.FirstName,
		LastName:           input.LastName,
		MiddleName:         input.MiddleName,
		DateOfBirth:        input.DateOfBirth,
		Citizenship:        input.Citizenship,
		TaxResidency:       input.TaxResidency,
		Address:            input.Address,
		AvatarURL:          input.AvatarURL,
		VerificationStatus: "unverified",
	}

	if err := s.repo.UpsertProfile(ctx, profile); err != nil {
		return nil, err
	}

	return profile, nil
}

func (s *Service) GetPreferences(ctx context.Context, userID string) (*repository.UserPreferences, error) {
	pref, err := s.repo.GetPreferences(ctx, userID)
	if err != nil {
		// Return defaults
		return &repository.UserPreferences{
			UserID:               userID,
			Language:             "ru",
			Theme:                "dark",
			NotificationsEnabled: true,
			BiometricEnabled:     false,
		}, nil
	}
	return pref, nil
}

func (s *Service) UpdatePreferences(ctx context.Context, userID string, input UpdatePreferencesInput) (*repository.UserPreferences, error) {
	pref, _ := s.repo.GetPreferences(ctx, userID)
	if pref == nil {
		pref = &repository.UserPreferences{
			UserID:               userID,
			Language:             "ru",
			Theme:                "dark",
			NotificationsEnabled: true,
			BiometricEnabled:     false,
		}
	}

	if input.Language != nil {
		pref.Language = *input.Language
	}
	if input.Theme != nil {
		pref.Theme = *input.Theme
	}
	if input.NotificationsEnabled != nil {
		pref.NotificationsEnabled = *input.NotificationsEnabled
	}
	if input.BiometricEnabled != nil {
		pref.BiometricEnabled = *input.BiometricEnabled
	}

	if err := s.repo.UpsertPreferences(ctx, pref); err != nil {
		return nil, err
	}

	return pref, nil
}
