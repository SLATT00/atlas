package handler

import (
	"errors"

	"github.com/atlas-platform/atlas/backend/internal/user/service"
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

func (h *Handler) GetProfile(c *gin.Context) {
	userID := c.GetString("user_id")
	profile, err := h.svc.GetProfile(c.Request.Context(), userID)
	if err != nil {
		if errors.Is(err, service.ErrProfileNotFound) {
			response.NotFound(c, "Profile not found")
			return
		}
		h.log.Error("get profile failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, profile)
}

func (h *Handler) UpdateProfile(c *gin.Context) {
	var input service.UpdateProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	userID := c.GetString("user_id")
	profile, err := h.svc.UpdateProfile(c.Request.Context(), userID, input)
	if err != nil {
		h.log.Error("update profile failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, profile)
}

func (h *Handler) GetPreferences(c *gin.Context) {
	userID := c.GetString("user_id")
	prefs, err := h.svc.GetPreferences(c.Request.Context(), userID)
	if err != nil {
		h.log.Error("get preferences failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, prefs)
}

func (h *Handler) UpdatePreferences(c *gin.Context) {
	var input service.UpdatePreferencesInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	userID := c.GetString("user_id")
	prefs, err := h.svc.UpdatePreferences(c.Request.Context(), userID, input)
	if err != nil {
		h.log.Error("update preferences failed", zap.Error(err))
		response.InternalError(c)
		return
	}
	response.OK(c, prefs)
}
