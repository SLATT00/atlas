package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"

	"github.com/atlas-platform/atlas/backend/internal/wallet/repository"
)

var (
	ErrWalletNotFound  = errors.New("wallet not found")
	ErrInvalidAsset    = errors.New("unsupported asset")
	ErrInvalidNetwork  = errors.New("unsupported network")
	ErrInsufficientBalance = errors.New("insufficient balance")
)

var supportedAssets = map[string]string{
	"BTC":  "bitcoin",
	"ETH":  "ethereum",
	"TON":  "ton",
	"SOL":  "solana",
	"USDT": "ethereum",
	"USDC": "ethereum",
}

type SendInput struct {
	WalletID string `json:"wallet_id" binding:"required"`
	Address  string `json:"address" binding:"required"`
	Amount   string `json:"amount" binding:"required"`
	Network  string `json:"network"`
}

type Service struct {
	repo *repository.Repository
}

func New(repo *repository.Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) ListWallets(ctx context.Context, userID string) ([]repository.Wallet, error) {
	return s.repo.GetWalletsByUserID(ctx, userID)
}

func (s *Service) GetWallet(ctx context.Context, id string) (*repository.Wallet, error) {
	w, err := s.repo.GetWalletByID(ctx, id)
	if err != nil {
		return nil, ErrWalletNotFound
	}
	return w, nil
}

func (s *Service) Send(ctx context.Context, userID string, input SendInput) (*repository.WalletTransaction, error) {
	wallet, err := s.repo.GetWalletByID(ctx, input.WalletID)
	if err != nil {
		return nil, ErrWalletNotFound
	}
	if wallet.UserID != userID {
		return nil, ErrWalletNotFound
	}

	tx := &repository.WalletTransaction{
		WalletID:  input.WalletID,
		TxHash:    generateTxHash(),
		Network:   wallet.Network,
		Direction: "out",
		Amount:    input.Amount,
		Fee:       "0.00001000",
		Status:    "pending",
	}

	if err := s.repo.CreateTransaction(ctx, tx); err != nil {
		return nil, err
	}

	return tx, nil
}

func (s *Service) GenerateAddress(ctx context.Context, userID, asset string) (*repository.Wallet, error) {
	network, ok := supportedAssets[asset]
	if !ok {
		return nil, ErrInvalidAsset
	}

	address := generateAddress()
	return s.repo.CreateWallet(ctx, userID, asset, network, address)
}

func (s *Service) GetHistory(ctx context.Context, userID string, page, perPage int) ([]repository.WalletTransaction, error) {
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}
	offset := (page - 1) * perPage
	return s.repo.GetTransactionsByUserID(ctx, userID, perPage, offset)
}

func generateAddress() string {
	b := make([]byte, 20)
	rand.Read(b)
	return "0x" + hex.EncodeToString(b)
}

func generateTxHash() string {
	b := make([]byte, 32)
	rand.Read(b)
	return "0x" + hex.EncodeToString(b)
}
