package handler

import (
	"errors"
	"strconv"

	"github.com/atlas-platform/atlas/backend/internal/ledger/service"
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

func (h *Handler) CreateEntry(c *gin.Context) {
	var input service.CreateEntryInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	journal, err := h.svc.CreateEntry(c.Request.Context(), input)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrUnbalancedEntry):
			response.BadRequest(c, "UNBALANCED_ENTRY", "Debits must equal credits")
		case errors.Is(err, service.ErrNoEntries):
			response.BadRequest(c, "INVALID_ENTRIES", "At least two entries required")
		default:
			h.log.Error("create entry failed", zap.Error(err))
			response.InternalError(c)
		}
		return
	}

	response.Created(c, journal)
}

func (h *Handler) GetEntry(c *gin.Context) {
	id := c.Param("id")
	journal, entries, err := h.svc.GetEntry(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrEntryNotFound) {
			response.NotFound(c, "Entry not found")
			return
		}
		h.log.Error("get entry failed", zap.Error(err))
		response.InternalError(c)
		return
	}

	response.OK(c, gin.H{
		"journal": journal,
		"entries": entries,
	})
}

func (h *Handler) GetBalance(c *gin.Context) {
	accountID := c.Param("account_id")
	balance, err := h.svc.GetBalance(c.Request.Context(), accountID)
	if err != nil {
		h.log.Error("get balance failed", zap.Error(err))
		response.InternalError(c)
		return
	}

	response.OK(c, gin.H{
		"account_id": accountID,
		"balance":    balance,
	})
}

func (h *Handler) ListEntries(c *gin.Context) {
	accountID := c.Param("account_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))

	entries, err := h.svc.ListEntries(c.Request.Context(), accountID, page, perPage)
	if err != nil {
		h.log.Error("list entries failed", zap.Error(err))
		response.InternalError(c)
		return
	}

	response.OK(c, entries)
}
