package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/atlas-platform/atlas/backend/internal/kyc/repository"
)

var (
	ErrVerificationNotFound = errors.New("verification not found")
	ErrInvalidLevel         = errors.New("invalid verification level")
	ErrInvalidDocType       = errors.New("invalid document type")
)

var validLevels = map[string]bool{
	"basic": true, "verified": true, "enhanced": true, "private": true, "business": true,
}

var validDocTypes = map[string]bool{
	"passport": true, "national_id": true, "driver_license": true,
	"residence_permit": true, "selfie": true, "proof_of_address": true,
	"business_registration": true, "tax_document": true,
}

type SubmitInput struct {
	Level string `json:"level" binding:"required"`
}

type UploadDocumentInput struct {
	DocumentType string `json:"document_type" binding:"required"`
	FileURL      string `json:"file_url" binding:"required"`
}

type Service struct {
	repo *repository.Repository
}

func New(repo *repository.Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetStatus(ctx context.Context, userID string) (*repository.Verification, error) {
	v, err := s.repo.GetLatestVerification(ctx, userID)
	if err != nil {
		return nil, ErrVerificationNotFound
	}
	return v, nil
}

func (s *Service) Submit(ctx context.Context, userID string, input SubmitInput) (*repository.Verification, error) {
	if !validLevels[input.Level] {
		return nil, ErrInvalidLevel
	}

	v := &repository.Verification{
		UserID: userID,
		Level:  input.Level,
	}

	if err := s.repo.CreateVerification(ctx, v); err != nil {
		return nil, fmt.Errorf("create verification: %w", err)
	}

	return v, nil
}

func (s *Service) UploadDocument(ctx context.Context, userID string, input UploadDocumentInput) (*repository.Document, error) {
	if !validDocTypes[input.DocumentType] {
		return nil, ErrInvalidDocType
	}

	v, err := s.repo.GetLatestVerification(ctx, userID)
	if err != nil {
		return nil, ErrVerificationNotFound
	}

	doc := &repository.Document{
		VerificationID: v.ID,
		DocumentType:   input.DocumentType,
		FileURL:        input.FileURL,
	}

	if err := s.repo.CreateDocument(ctx, doc); err != nil {
		return nil, fmt.Errorf("create document: %w", err)
	}

	return doc, nil
}

func (s *Service) ListDocuments(ctx context.Context, userID string) ([]repository.Document, error) {
	v, err := s.repo.GetLatestVerification(ctx, userID)
	if err != nil {
		return nil, ErrVerificationNotFound
	}

	return s.repo.GetDocumentsByVerificationID(ctx, v.ID)
}
