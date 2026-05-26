package handler

import (
	"errors"
	"strconv"

	"github.com/atlas-platform/atlas/backend/internal/transfer/repository"
	"github.com/atlas-platform/atlas/backend/internal/transfer/service"
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

func (h *Handler) CreateTransfer(c *gin.Context) {
	var input service.CreateTransferInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	userID := c.GetString("user_id")
	transfer, err := h.svc.CreateTransfer(c.Request.Context(), userID, input)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidTransferType):
			response.BadRequest(c, "INVALID_TYPE", "Invalid transfer type")
		case errors.Is(err, service.ErrInsufficientFunds):
			response.BadRequest(c, "INSUFFICIENT_FUNDS", "Insufficient funds")
		default:
			h.log.Error("create transfer failed", zap.Error(err))
			response.InternalError(c)
		}
		return
	}

	response.Created(c, transfer)
}

func (h *Handler) GetTransfer(c *gin.Context) {
	id := c.Param("id")
	transfer, err := h.svc.GetTransfer(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrTransferNotFound) {
			response.NotFound(c, "Transfer not found")
			return
		}
		h.log.Error("get transfer failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, transfer)
}

func (h *Handler) ListTransfers(c *gin.Context) {
	userID := c.GetString("user_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))

	transfers, err := h.svc.ListTransfers(c.Request.Context(), userID, page, perPage)
	if err != nil {
		h.log.Error("list transfers failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, transfers)
}

func (h *Handler) EstimateTransfer(c *gin.Context) {
	var input service.EstimateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	estimate, err := h.svc.EstimateTransfer(c.Request.Context(), input)
	if err != nil {
		h.log.Error("estimate transfer failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, estimate)
}

func (h *Handler) ListBeneficiaries(c *gin.Context) {
	userID := c.GetString("user_id")
	beneficiaries, err := h.svc.ListBeneficiaries(c.Request.Context(), userID)
	if err != nil {
		h.log.Error("list beneficiaries failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, beneficiaries)
}

func (h *Handler) CreateBeneficiary(c *gin.Context) {
	var b repository.Beneficiary
	if err := c.ShouldBindJSON(&b); err != nil {
		response.ValidationError(c, err.Error())
		return
	}
	b.UserID = c.GetString("user_id")

	if err := h.svc.CreateBeneficiary(c.Request.Context(), &b); err != nil {
		h.log.Error("create beneficiary failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.Created(c, b)
}

func (h *Handler) DeleteBeneficiary(c *gin.Context) {
	id := c.Param("id")
	userID := c.GetString("user_id")

	if err := h.svc.DeleteBeneficiary(c.Request.Context(), id, userID); err != nil {
		h.log.Error("delete beneficiary failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, gin.H{"deleted": true})
}
