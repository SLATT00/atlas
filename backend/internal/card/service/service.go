package service

import (
	"context"
	"errors"

	"github.com/atlas-platform/atlas/backend/internal/card/repository"
)

var (
	ErrCardNotFound   = errors.New("card not found")
	ErrInvalidCardType = errors.New("invalid card type")
	ErrCardFrozen     = errors.New("card is already frozen")
	ErrCardNotFrozen  = errors.New("card is not frozen")
)

var validCardTypes = map[string]bool{
	"virtual":  true,
	"standard": true,
	"travel":   true,
	"metal":    true,
	"business": true,
	"family":   true,
	"teen":     true,
}

type IssueCardInput struct {
	CardType string `json:"card_type" binding:"required"`
	Network  string `json:"network"`
	Currency string `json:"currency" binding:"required"`
}

type UpdateLimitsInput struct {
	DailyLimit       string `json:"daily_limit"`
	MonthlyLimit     string `json:"monthly_limit"`
	TransactionLimit string `json:"transaction_limit"`
}

type UpdateControlsInput struct {
	OnlineEnabled      *bool  `json:"online_enabled"`
	ATMEnabled         *bool  `json:"atm_enabled"`
	ContactlessEnabled *bool  `json:"contactless_enabled"`
	CountryRestrictions string `json:"country_restrictions"`
	MerchantRestrictions string `json:"merchant_restrictions"`
}

type Service struct {
	repo *repository.Repository
}

func New(repo *repository.Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) IssueCard(ctx context.Context, userID string, input IssueCardInput) (*repository.Card, error) {
	if !validCardTypes[input.CardType] {
		return nil, ErrInvalidCardType
	}

	network := input.Network
	if network == "" {
		network = "visa"
	}

	return s.repo.CreateCard(ctx, userID, input.CardType, network, input.Currency)
}

func (s *Service) GetCard(ctx context.Context, id string) (*repository.Card, *repository.CardControls, error) {
	card, err := s.repo.GetCardByID(ctx, id)
	if err != nil {
		return nil, nil, ErrCardNotFound
	}

	controls, _ := s.repo.GetCardControls(ctx, id)
	return card, controls, nil
}

func (s *Service) ListCards(ctx context.Context, userID string) ([]repository.Card, error) {
	return s.repo.GetCardsByUserID(ctx, userID)
}

func (s *Service) FreezeCard(ctx context.Context, id string) error {
	card, err := s.repo.GetCardByID(ctx, id)
	if err != nil {
		return ErrCardNotFound
	}
	if card.Status == "frozen" {
		return ErrCardFrozen
	}
	return s.repo.UpdateCardStatus(ctx, id, "frozen")
}

func (s *Service) UnfreezeCard(ctx context.Context, id string) error {
	card, err := s.repo.GetCardByID(ctx, id)
	if err != nil {
		return ErrCardNotFound
	}
	if card.Status != "frozen" {
		return ErrCardNotFrozen
	}
	return s.repo.UpdateCardStatus(ctx, id, "active")
}

func (s *Service) UpdateLimits(ctx context.Context, id string, input UpdateLimitsInput) error {
	controls, err := s.repo.GetCardControls(ctx, id)
	if err != nil {
		return ErrCardNotFound
	}

	if input.DailyLimit != "" {
		controls.DailyLimit = input.DailyLimit
	}
	if input.MonthlyLimit != "" {
		controls.MonthlyLimit = input.MonthlyLimit
	}
	if input.TransactionLimit != "" {
		controls.TransactionLimit = input.TransactionLimit
	}

	return s.repo.UpdateCardControls(ctx, controls)
}

func (s *Service) UpdateControls(ctx context.Context, id string, input UpdateControlsInput) error {
	controls, err := s.repo.GetCardControls(ctx, id)
	if err != nil {
		return ErrCardNotFound
	}

	if input.OnlineEnabled != nil {
		controls.OnlineEnabled = *input.OnlineEnabled
	}
	if input.ATMEnabled != nil {
		controls.ATMEnabled = *input.ATMEnabled
	}
	if input.ContactlessEnabled != nil {
		controls.ContactlessEnabled = *input.ContactlessEnabled
	}
	if input.CountryRestrictions != "" {
		controls.CountryRestrictions = input.CountryRestrictions
	}
	if input.MerchantRestrictions != "" {
		controls.MerchantRestrictions = input.MerchantRestrictions
	}

	return s.repo.UpdateCardControls(ctx, controls)
}
