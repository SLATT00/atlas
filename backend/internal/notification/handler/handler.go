package handler

import (
	"strconv"

	"github.com/atlas-platform/atlas/backend/internal/notification/service"
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

func (h *Handler) List(c *gin.Context) {
	userID := c.GetString("user_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))

	notifications, err := h.svc.List(c.Request.Context(), userID, page, perPage)
	if err != nil {
		h.log.Error("list notifications failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, notifications)
}

func (h *Handler) MarkRead(c *gin.Context) {
	id := c.Param("id")
	userID := c.GetString("user_id")

	if err := h.svc.MarkRead(c.Request.Context(), id, userID); err != nil {
		h.log.Error("mark read failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, gin.H{"read": true})
}

func (h *Handler) MarkAllRead(c *gin.Context) {
	userID := c.GetString("user_id")

	if err := h.svc.MarkAllRead(c.Request.Context(), userID); err != nil {
		h.log.Error("mark all read failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, gin.H{"read": true})
}

func (h *Handler) UnreadCount(c *gin.Context) {
	userID := c.GetString("user_id")

	count, err := h.svc.UnreadCount(c.Request.Context(), userID)
	if err != nil {
		h.log.Error("unread count failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, gin.H{"unread_count": count})
}
