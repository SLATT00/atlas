package handler

import (
	"errors"
	"strconv"

	"github.com/atlas-platform/atlas/backend/internal/account/service"
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

func (h *Handler) OpenAccount(c *gin.Context) {
	var input service.OpenAccountInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	userID := c.GetString("user_id")
	acc, err := h.svc.OpenAccount(c.Request.Context(), userID, input)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidCurrency):
			response.BadRequest(c, "INVALID_CURRENCY", "Unsupported currency")
		default:
			h.log.Error("open account failed", zap.Error(err))
			response.InternalError(c)
		}
		return
	}

	response.Created(c, acc)
}

func (h *Handler) GetAccount(c *gin.Context) {
	id := c.Param("id")
	acc, err := h.svc.GetAccount(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrAccountNotFound) {
			response.NotFound(c, "Account not found")
			return
		}
		h.log.Error("get account failed", zap.Error(err))
		response.InternalError(c)
		return
	}

	response.OK(c, acc)
}

func (h *Handler) ListAccounts(c *gin.Context) {
	userID := c.GetString("user_id")
	accounts, err := h.svc.ListAccounts(c.Request.Context(), userID)
	if err != nil {
		h.log.Error("list accounts failed", zap.Error(err))
		response.InternalError(c)
		return
	}

	response.OK(c, accounts)
}

func (h *Handler) GetTransactions(c *gin.Context) {
	accountID := c.Param("id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))

	txns, err := h.svc.GetTransactions(c.Request.Context(), accountID, page, perPage)
	if err != nil {
		h.log.Error("get transactions failed", zap.Error(err))
		response.InternalError(c)
		return
	}

	response.OK(c, txns)
}

func (h *Handler) GetStatement(c *gin.Context) {
	response.OK(c, gin.H{"message": "Statement generation not yet implemented"})
}
