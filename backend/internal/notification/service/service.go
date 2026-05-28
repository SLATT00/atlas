package service

import (
	"context"

	"github.com/atlas-platform/atlas/backend/internal/notification/repository"
)

type Service struct {
	repo *repository.Repository
}

func New(repo *repository.Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) List(ctx context.Context, userID string, page, perPage int) ([]repository.Notification, error) {
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}
	offset := (page - 1) * perPage
	return s.repo.GetByUserID(ctx, userID, perPage, offset)
}

func (s *Service) MarkRead(ctx context.Context, id, userID string) error {
	return s.repo.MarkRead(ctx, id, userID)
}

func (s *Service) MarkAllRead(ctx context.Context, userID string) error {
	return s.repo.MarkAllRead(ctx, userID)
}

func (s *Service) UnreadCount(ctx context.Context, userID string) (int64, error) {
	return s.repo.UnreadCount(ctx, userID)
}

func (s *Service) Send(ctx context.Context, n *repository.Notification) error {
	return s.repo.Create(ctx, n)
}
