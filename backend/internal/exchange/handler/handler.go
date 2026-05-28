package handler

import (
	"errors"
	"strconv"

	"github.com/atlas-platform/atlas/backend/internal/exchange/service"
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

func (h *Handler) GetQuote(c *gin.Context) {
	var input service.QuoteInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	userID := c.GetString("user_id")
	quote, err := h.svc.GetQuote(c.Request.Context(), userID, input)
	if err != nil {
		if errors.Is(err, service.ErrInvalidPair) {
			response.BadRequest(c, "INVALID_PAIR", "Unsupported currency pair")
			return
		}
		h.log.Error("get quote failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, quote)
}

func (h *Handler) Execute(c *gin.Context) {
	var input service.ExecuteInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	userID := c.GetString("user_id")
	quote, err := h.svc.Execute(c.Request.Context(), userID, input)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrQuoteNotFound):
			response.NotFound(c, "Quote not found")
		case errors.Is(err, service.ErrQuoteExpired):
			response.BadRequest(c, "QUOTE_EXPIRED", "Quote has expired")
		case errors.Is(err, service.ErrAlreadyExecuted):
			response.Conflict(c, "ALREADY_EXECUTED", "Quote already executed")
		default:
			h.log.Error("execute failed", zap.Error(err))
			response.InternalError(c)
		}
		return
	}
	response.OK(c, quote)
}

func (h *Handler) GetRates(c *gin.Context) {
	rates, err := h.svc.GetRates(c.Request.Context())
	if err != nil {
		h.log.Error("get rates failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, rates)
}

func (h *Handler) GetHistory(c *gin.Context) {
	userID := c.GetString("user_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))

	history, err := h.svc.GetHistory(c.Request.Context(), userID, page, perPage)
	if err != nil {
		h.log.Error("get history failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, history)
}
