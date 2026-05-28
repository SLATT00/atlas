package handler

import (
	"errors"

	"github.com/atlas-platform/atlas/backend/internal/loan/service"
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

func (h *Handler) CreateLoan(c *gin.Context) {
	var input service.CreateLoanInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	userID := c.GetString("user_id")
	loan, err := h.svc.CreateLoan(c.Request.Context(), userID, input)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidLoanType):
			response.BadRequest(c, "INVALID_LOAN_TYPE", "Invalid loan type")
		case errors.Is(err, service.ErrInvalidCollateral):
			response.BadRequest(c, "INVALID_COLLATERAL", "Unsupported collateral asset")
		default:
			h.log.Error("create loan failed", zap.Error(err))
			response.InternalError(c)
		}
		return
	}

	response.Created(c, loan)
}

func (h *Handler) GetLoan(c *gin.Context) {
	id := c.Param("id")
	loan, err := h.svc.GetLoan(c.Request.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrLoanNotFound) {
			response.NotFound(c, "Loan not found")
			return
		}
		h.log.Error("get loan failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, loan)
}

func (h *Handler) ListLoans(c *gin.Context) {
	userID := c.GetString("user_id")
	loans, err := h.svc.ListLoans(c.Request.Context(), userID)
	if err != nil {
		h.log.Error("list loans failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, loans)
}

func (h *Handler) Repay(c *gin.Context) {
	id := c.Param("id")
	var input service.RepayInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	rep, err := h.svc.Repay(c.Request.Context(), id, input)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrLoanNotFound):
			response.NotFound(c, "Loan not found")
		case errors.Is(err, service.ErrLoanAlreadyClosed):
			response.Conflict(c, "LOAN_CLOSED", "Loan is already closed")
		default:
			h.log.Error("repay failed", zap.Error(err))
			response.InternalError(c)
		}
		return
	}
	response.Created(c, rep)
}

func (h *Handler) TopupCollateral(c *gin.Context) {
	id := c.Param("id")
	var input service.TopupInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	col, err := h.svc.TopupCollateral(c.Request.Context(), id, input)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrLoanNotFound):
			response.NotFound(c, "Loan not found")
		case errors.Is(err, service.ErrInvalidCollateral):
			response.BadRequest(c, "INVALID_COLLATERAL", "Unsupported collateral asset")
		default:
			h.log.Error("topup collateral failed", zap.Error(err))
			response.InternalError(c)
		}
		return
	}
	response.Created(c, col)
}

func (h *Handler) GetCollateral(c *gin.Context) {
	id := c.Param("id")
	collateral, err := h.svc.GetCollateral(c.Request.Context(), id)
	if err != nil {
		h.log.Error("get collateral failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, collateral)
}
