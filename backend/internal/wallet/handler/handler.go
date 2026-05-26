package handler

import (
	"errors"
	"strconv"

	"github.com/atlas-platform/atlas/backend/internal/wallet/service"
	"github.com/atlas-platform/atlas/backend/pkg/response"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type Handler struct {
	svc *service.Service
	log *zap.Logger
}

func New(svc *service.Service, log *zap.Logger) *Handler {
	return &Handler{svc: svc, log: log}
}

func (h *Handler) ListWallets(c *gin.Context) {
	userID := c.GetString("user_id")
	wallets, err := h.svc.ListWallets(c.Request.Context(), userID)
	if err != nil {
		h.log.Error("list wallets failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, wallets)
}

func (h *Handler) GetWallet(c *gin.Context) {
	id := c.Param("id")
	wallet, err := h.svc.GetWallet(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrWalletNotFound) {
			response.NotFound(c, "Wallet not found")
			return
		}
		h.log.Error("get wallet failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, wallet)
}

func (h *Handler) Send(c *gin.Context) {
	var input service.SendInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	userID := c.GetString("user_id")
	tx, err := h.svc.Send(c.Request.Context(), userID, input)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrWalletNotFound):
			response.NotFound(c, "Wallet not found")
		case errors.Is(err, service.ErrInsufficientBalance):
			response.BadRequest(c, "INSUFFICIENT_BALANCE", "Insufficient balance")
		default:
			h.log.Error("send failed", zap.Error(err))
			response.InternalError(c)
		}
		return
	}
	response.Created(c, tx)
}

func (h *Handler) GenerateAddress(c *gin.Context) {
	var input struct {
		Asset string `json:"asset" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	userID := c.GetString("user_id")
	wallet, err := h.svc.GenerateAddress(c.Request.Context(), userID, input.Asset)
	if err != nil {
		if errors.Is(err, service.ErrInvalidAsset) {
			response.BadRequest(c, "INVALID_ASSET", "Unsupported asset")
			return
		}
		h.log.Error("generate address failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.Created(c, wallet)
}

func (h *Handler) GetHistory(c *gin.Context) {
	userID := c.GetString("user_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))

	txns, err := h.svc.GetHistory(c.Request.Context(), userID, page, perPage)
	if err != nil {
		h.log.Error("get history failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, txns)
}
