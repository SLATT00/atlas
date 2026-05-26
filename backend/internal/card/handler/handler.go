package handler

import (
	"errors"

	"github.com/atlas-platform/atlas/backend/internal/card/service"
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

func (h *Handler) IssueCard(c *gin.Context) {
	var input service.IssueCardInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	userID := c.GetString("user_id")
	card, err := h.svc.IssueCard(c.Request.Context(), userID, input)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCardType) {
			response.BadRequest(c, "INVALID_CARD_TYPE", "Invalid card type")
			return
		}
		h.log.Error("issue card failed", zap.Error(err))
		response.InternalError(c)
		return
	}

	response.Created(c, card)
}

func (h *Handler) GetCard(c *gin.Context) {
	id := c.Param("id")
	card, controls, err := h.svc.GetCard(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrCardNotFound) {
			response.NotFound(c, "Card not found")
			return
		}
		h.log.Error("get card failed", zap.Error(err))
		response.InternalError(c)
		return
	}

	response.OK(c, gin.H{"card": card, "controls": controls})
}

func (h *Handler) ListCards(c *gin.Context) {
	userID := c.GetString("user_id")
	cards, err := h.svc.ListCards(c.Request.Context(), userID)
	if err != nil {
		h.log.Error("list cards failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, cards)
}

func (h *Handler) FreezeCard(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.FreezeCard(c.Request.Context(), id); err != nil {
		switch {
		case errors.Is(err, service.ErrCardNotFound):
			response.NotFound(c, "Card not found")
		case errors.Is(err, service.ErrCardFrozen):
			response.Conflict(c, "ALREADY_FROZEN", "Card is already frozen")
		default:
			h.log.Error("freeze card failed", zap.Error(err))
			response.InternalError(c)
		}
		return
	}
	response.OK(c, gin.H{"frozen": true})
}

func (h *Handler) UnfreezeCard(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.UnfreezeCard(c.Request.Context(), id); err != nil {
		switch {
		case errors.Is(err, service.ErrCardNotFound):
			response.NotFound(c, "Card not found")
		case errors.Is(err, service.ErrCardNotFrozen):
			response.Conflict(c, "NOT_FROZEN", "Card is not frozen")
		default:
			h.log.Error("unfreeze card failed", zap.Error(err))
			response.InternalError(c)
		}
		return
	}
	response.OK(c, gin.H{"frozen": false})
}

func (h *Handler) UpdateLimits(c *gin.Context) {
	id := c.Param("id")
	var input service.UpdateLimitsInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	if err := h.svc.UpdateLimits(c.Request.Context(), id, input); err != nil {
		if errors.Is(err, service.ErrCardNotFound) {
			response.NotFound(c, "Card not found")
			return
		}
		h.log.Error("update limits failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, gin.H{"updated": true})
}

func (h *Handler) UpdateControls(c *gin.Context) {
	id := c.Param("id")
	var input service.UpdateControlsInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	if err := h.svc.UpdateControls(c.Request.Context(), id, input); err != nil {
		if errors.Is(err, service.ErrCardNotFound) {
			response.NotFound(c, "Card not found")
			return
		}
		h.log.Error("update controls failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, gin.H{"updated": true})
}
