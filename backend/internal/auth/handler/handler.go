package handler

import (
	"errors"

	"github.com/atlas-platform/atlas/backend/internal/auth/service"
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

func (h *Handler) Register(c *gin.Context) {
	var input service.RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	user, tokens, err := h.svc.Register(c.Request.Context(), input)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrEmailExists):
			response.Conflict(c, "EMAIL_EXISTS", "Email already registered")
		case errors.Is(err, service.ErrPhoneExists):
			response.Conflict(c, "PHONE_EXISTS", "Phone already registered")
		default:
			h.log.Error("register failed", zap.Error(err))
			response.InternalError(c)
		}
		return
	}

	response.Created(c, gin.H{
		"user":   user,
		"tokens": tokens,
	})
}

func (h *Handler) Login(c *gin.Context) {
	var input service.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.ValidationError(c, err.Error())
		return
	}
	input.IP = c.ClientIP()

	user, tokens, err := h.svc.Login(c.Request.Context(), input)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidCredentials):
			response.Unauthorized(c, "Invalid email or password")
		case errors.Is(err, service.ErrAccountSuspended):
			response.Forbidden(c, "Account is suspended")
		default:
			h.log.Error("login failed", zap.Error(err))
			response.InternalError(c)
		}
		return
	}

	response.OK(c, gin.H{
		"user":   user,
		"tokens": tokens,
	})
}

func (h *Handler) RefreshToken(c *gin.Context) {
	var input struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	tokens, err := h.svc.RefreshToken(c.Request.Context(), input.RefreshToken)
	if err != nil {
		response.Unauthorized(c, "Invalid refresh token")
		return
	}

	response.OK(c, tokens)
}

func (h *Handler) Logout(c *gin.Context) {
	userID := c.GetString("user_id")
	token := c.GetHeader("Authorization")

	if err := h.svc.Logout(c.Request.Context(), userID, token); err != nil {
		h.log.Error("logout failed", zap.Error(err))
		response.InternalError(c)
		return
	}

	response.OK(c, gin.H{"message": "Logged out successfully"})
}

func (h *Handler) VerifyPhone(c *gin.Context) {
	var input struct {
		Phone string `json:"phone" binding:"required"`
		Code  string `json:"code" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	response.OK(c, gin.H{"verified": true})
}

func (h *Handler) VerifyEmail(c *gin.Context) {
	var input struct {
		Token string `json:"token" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	response.OK(c, gin.H{"verified": true})
}

func (h *Handler) Enable2FA(c *gin.Context) {
	response.OK(c, gin.H{
		"secret":  "JBSWY3DPEHPK3PXP",
		"qr_url":  "otpauth://totp/ATLAS:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=ATLAS",
		"enabled": false,
	})
}

func (h *Handler) ListSessions(c *gin.Context) {
	userID := c.GetString("user_id")

	sessions, err := h.svc.GetSessions(c.Request.Context(), userID)
	if err != nil {
		h.log.Error("list sessions failed", zap.Error(err))
		response.InternalError(c)
		return
	}

	response.OK(c, sessions)
}

func (h *Handler) RevokeSession(c *gin.Context) {
	userID := c.GetString("user_id")
	sessionID := c.Param("id")

	if err := h.svc.RevokeSession(c.Request.Context(), sessionID, userID); err != nil {
		h.log.Error("revoke session failed", zap.Error(err))
		response.InternalError(c)
		return
	}

	response.OK(c, gin.H{"message": "Session revoked"})
}
