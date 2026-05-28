package handler

import (
	"errors"

	"github.com/atlas-platform/atlas/backend/internal/kyc/service"
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

func (h *Handler) GetStatus(c *gin.Context) {
	userID := c.GetString("user_id")
	v, err := h.svc.GetStatus(c.Request.Context(), userID)
	if err != nil {
		if errors.Is(err, service.ErrVerificationNotFound) {
			response.OK(c, gin.H{"status": "none", "level": "none"})
			return
		}
		h.log.Error("get kyc status failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, v)
}

func (h *Handler) Submit(c *gin.Context) {
	var input service.SubmitInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	userID := c.GetString("user_id")
	v, err := h.svc.Submit(c.Request.Context(), userID, input)
	if err != nil {
		if errors.Is(err, service.ErrInvalidLevel) {
			response.BadRequest(c, "INVALID_LEVEL", "Invalid verification level")
			return
		}
		h.log.Error("submit kyc failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.Created(c, v)
}

func (h *Handler) UploadDocument(c *gin.Context) {
	var input service.UploadDocumentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	userID := c.GetString("user_id")
	doc, err := h.svc.UploadDocument(c.Request.Context(), userID, input)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrVerificationNotFound):
			response.BadRequest(c, "NO_VERIFICATION", "Submit a verification first")
		case errors.Is(err, service.ErrInvalidDocType):
			response.BadRequest(c, "INVALID_DOC_TYPE", "Invalid document type")
		default:
			h.log.Error("upload document failed", zap.Error(err))
			response.InternalError(c)
		}
		return
	}
	response.Created(c, doc)
}

func (h *Handler) ListDocuments(c *gin.Context) {
	userID := c.GetString("user_id")
	docs, err := h.svc.ListDocuments(c.Request.Context(), userID)
	if err != nil {
		if errors.Is(err, service.ErrVerificationNotFound) {
			response.OK(c, []interface{}{})
			return
		}
		h.log.Error("list documents failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, docs)
}
