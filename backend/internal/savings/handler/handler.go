package handler

import (
	"errors"

	"github.com/atlas-platform/atlas/backend/internal/savings/service"
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

func (h *Handler) OpenSavings(c *gin.Context) {
	var input service.OpenSavingsInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	userID := c.GetString("user_id")
	sa, err := h.svc.OpenSavings(c.Request.Context(), userID, input)
	if err != nil {
		if errors.Is(err, service.ErrInvalidProduct) {
			response.BadRequest(c, "INVALID_PRODUCT", "Unsupported savings product")
			return
		}
		h.log.Error("open savings failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.Created(c, sa)
}

func (h *Handler) GetSavings(c *gin.Context) {
	id := c.Param("id")
	sa, err := h.svc.GetSavings(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrSavingsNotFound) {
			response.NotFound(c, "Savings account not found")
			return
		}
		h.log.Error("get savings failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, sa)
}

func (h *Handler) ListSavings(c *gin.Context) {
	userID := c.GetString("user_id")
	savings, err := h.svc.ListSavings(c.Request.Context(), userID)
	if err != nil {
		h.log.Error("list savings failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, savings)
}

func (h *Handler) Deposit(c *gin.Context) {
	id := c.Param("id")
	var input service.AmountInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	tx, err := h.svc.Deposit(c.Request.Context(), id, input)
	if err != nil {
		if errors.Is(err, service.ErrSavingsNotFound) {
			response.NotFound(c, "Savings account not found")
			return
		}
		h.log.Error("deposit failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.Created(c, tx)
}

func (h *Handler) Withdraw(c *gin.Context) {
	id := c.Param("id")
	var input service.AmountInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	tx, err := h.svc.Withdraw(c.Request.Context(), id, input)
	if err != nil {
		if errors.Is(err, service.ErrSavingsNotFound) {
			response.NotFound(c, "Savings account not found")
			return
		}
		h.log.Error("withdraw failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.Created(c, tx)
}
