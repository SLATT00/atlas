package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/atlas-platform/atlas/backend/internal/auth/repository"
	"github.com/atlas-platform/atlas/backend/pkg/config"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrEmailExists        = errors.New("email already registered")
	ErrPhoneExists        = errors.New("phone already registered")
	ErrAccountSuspended   = errors.New("account is suspended")
	ErrInvalidToken       = errors.New("invalid token")
)

type RegisterInput struct {
	Email    string `json:"email" binding:"required,email"`
	Phone    string `json:"phone" binding:"required"`
	Password string `json:"password" binding:"required,min=12"`
	Language string `json:"language"`
	Country  string `json:"country"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
	Device   string `json:"device"`
	IP       string `json:"-"`
}

type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
}

type Service struct {
	repo  *repository.Repository
	redis *redis.Client
	jwt   config.JWTConfig
}

func New(repo *repository.Repository, rdb *redis.Client, jwtCfg config.JWTConfig) *Service {
	return &Service{
		repo:  repo,
		redis: rdb,
		jwt:   jwtCfg,
	}
}

func (s *Service) Register(ctx context.Context, input RegisterInput) (*repository.User, *TokenPair, error) {
	exists, err := s.repo.EmailExists(ctx, input.Email)
	if err != nil {
		return nil, nil, fmt.Errorf("check email: %w", err)
	}
	if exists {
		return nil, nil, ErrEmailExists
	}

	exists, err = s.repo.PhoneExists(ctx, input.Phone)
	if err != nil {
		return nil, nil, fmt.Errorf("check phone: %w", err)
	}
	if exists {
		return nil, nil, ErrPhoneExists
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, nil, fmt.Errorf("hash password: %w", err)
	}

	lang := input.Language
	if lang == "" {
		lang = "ru"
	}

	user, err := s.repo.CreateUser(ctx, input.Email, input.Phone, string(hash), lang, input.Country)
	if err != nil {
		return nil, nil, fmt.Errorf("create user: %w", err)
	}

	tokens, err := s.generateTokenPair(user.ID, user.Email, "user")
	if err != nil {
		return nil, nil, fmt.Errorf("generate tokens: %w", err)
	}

	return user, tokens, nil
}

func (s *Service) Login(ctx context.Context, input LoginInput) (*repository.User, *TokenPair, error) {
	user, err := s.repo.GetUserByEmail(ctx, input.Email)
	if err != nil {
		return nil, nil, ErrInvalidCredentials
	}

	if user.Status == "suspended" {
		return nil, nil, ErrAccountSuspended
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		return nil, nil, ErrInvalidCredentials
	}

	tokens, err := s.generateTokenPair(user.ID, user.Email, "user")
	if err != nil {
		return nil, nil, fmt.Errorf("generate tokens: %w", err)
	}

	session := &repository.Session{
		ID:        uuid.New().String(),
		UserID:    user.ID,
		Device:    input.Device,
		IP:        input.IP,
		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(s.jwt.RefreshTTL),
	}
	_ = s.repo.CreateSession(ctx, session)

	return user, tokens, nil
}

func (s *Service) RefreshToken(ctx context.Context, refreshToken string) (*TokenPair, error) {
	claims := &jwt.RegisteredClaims{}
	token, err := jwt.ParseWithClaims(refreshToken, claims, func(t *jwt.Token) (interface{}, error) {
		return []byte(s.jwt.Secret), nil
	})
	if err != nil || !token.Valid {
		return nil, ErrInvalidToken
	}

	blacklisted, _ := s.redis.Get(ctx, "blacklist:"+refreshToken).Result()
	if blacklisted != "" {
		return nil, ErrInvalidToken
	}

	userID := claims.Subject
	user, err := s.repo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, ErrInvalidToken
	}

	// Blacklist old refresh token
	s.redis.Set(ctx, "blacklist:"+refreshToken, "1", s.jwt.RefreshTTL)

	return s.generateTokenPair(user.ID, user.Email, "user")
}

func (s *Service) Logout(ctx context.Context, userID, token string) error {
	s.redis.Set(ctx, "blacklist:"+token, "1", s.jwt.AccessTTL)
	return nil
}

func (s *Service) GetSessions(ctx context.Context, userID string) ([]repository.Session, error) {
	return s.repo.GetSessionsByUserID(ctx, userID)
}

func (s *Service) RevokeSession(ctx context.Context, sessionID, userID string) error {
	return s.repo.DeleteSession(ctx, sessionID, userID)
}

func (s *Service) generateTokenPair(userID, email, role string) (*TokenPair, error) {
	now := time.Now()

	accessClaims := jwt.MapClaims{
		"user_id": userID,
		"email":   email,
		"role":    role,
		"exp":     now.Add(s.jwt.AccessTTL).Unix(),
		"iat":     now.Unix(),
		"jti":     uuid.New().String(),
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessStr, err := accessToken.SignedString([]byte(s.jwt.Secret))
	if err != nil {
		return nil, err
	}

	refreshClaims := jwt.RegisteredClaims{
		Subject:   userID,
		ExpiresAt: jwt.NewNumericDate(now.Add(s.jwt.RefreshTTL)),
		IssuedAt:  jwt.NewNumericDate(now),
		ID:        uuid.New().String(),
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshStr, err := refreshToken.SignedString([]byte(s.jwt.Secret))
	if err != nil {
		return nil, err
	}

	return &TokenPair{
		AccessToken:  accessStr,
		RefreshToken: refreshStr,
		ExpiresIn:    int64(s.jwt.AccessTTL.Seconds()),
	}, nil
}
