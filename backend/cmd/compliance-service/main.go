package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/atlas-platform/atlas/backend/pkg/config"
	"github.com/atlas-platform/atlas/backend/pkg/database"
	"github.com/atlas-platform/atlas/backend/pkg/logger"
	"github.com/atlas-platform/atlas/backend/pkg/middleware"
	"github.com/atlas-platform/atlas/backend/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"go.uber.org/zap"
)

func main() {
	cfg := config.Load("compliance-service")
	cfg.Port = 8004
	cfg.Postgres.DBName = "compliance_db"

	log := logger.New(cfg.ServiceName, cfg.LogLevel)
	defer log.Sync()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	pool, err := database.NewPool(ctx, database.Config{DSN: cfg.Postgres.DSN()})
	if err != nil {
		log.Fatal(fmt.Sprintf("failed to connect to database: %v", err))
	}
	defer pool.Close()

	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.Logger(log))
	r.Use(middleware.CorrelationID())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "service": cfg.ServiceName})
	})

	compliance := r.Group("/api/v1/compliance")
	compliance.Use(middleware.Auth(cfg.JWT.Secret))
	{
		compliance.POST("/screen", screenHandler(pool, log))
		compliance.GET("/cases", listCasesHandler(pool, log))
		compliance.GET("/cases/:id", getCaseHandler(pool, log))
	}

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Port),
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	go func() {
		log.Info(fmt.Sprintf("%s starting on port %d", cfg.ServiceName, cfg.Port))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal(fmt.Sprintf("server error: %v", err))
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()
	srv.Shutdown(shutdownCtx)
}

func screenHandler(pool *pgxpool.Pool, log *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			UserID        string `json:"user_id" binding:"required"`
			ScreeningType string `json:"screening_type" binding:"required"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			response.ValidationError(c, err.Error())
			return
		}

		id := uuid.New().String()
		_, err := pool.Exec(c.Request.Context(), `
			INSERT INTO screening_results (id, user_id, screening_type, result, created_at)
			VALUES ($1, $2, $3, 'clear', NOW())
		`, id, input.UserID, input.ScreeningType)
		if err != nil {
			log.Error("screening failed", zap.Error(err))
			response.InternalError(c)
			return
		}

		response.Created(c, gin.H{
			"id":              id,
			"user_id":         input.UserID,
			"screening_type":  input.ScreeningType,
			"result":          "clear",
		})
	}
}

func listCasesHandler(pool *pgxpool.Pool, log *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.Query("user_id")
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))
		offset := (page - 1) * perPage

		var rows interface{}
		var err error
		if userID != "" {
			rows, err = queryCases(c.Request.Context(), pool, "WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3", userID, perPage, offset)
		} else {
			rows, err = queryCases(c.Request.Context(), pool, "ORDER BY created_at DESC LIMIT $1 OFFSET $2", perPage, offset)
		}

		if err != nil {
			log.Error("list cases failed", zap.Error(err))
			response.InternalError(c)
			return
		}
		response.OK(c, rows)
	}
}

func getCaseHandler(pool *pgxpool.Pool, log *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		var caseData struct {
			ID        string `json:"id"`
			UserID    string `json:"user_id"`
			Type      string `json:"type"`
			Status    string `json:"status"`
			RiskScore int    `json:"risk_score"`
			Notes     *string `json:"notes"`
		}

		err := pool.QueryRow(c.Request.Context(), `
			SELECT id, user_id, type, status, risk_score, notes
			FROM compliance_cases WHERE id = $1
		`, id).Scan(&caseData.ID, &caseData.UserID, &caseData.Type,
			&caseData.Status, &caseData.RiskScore, &caseData.Notes)
		if err != nil {
			response.NotFound(c, "Case not found")
			return
		}
		response.OK(c, caseData)
	}
}

func queryCases(ctx context.Context, pool *pgxpool.Pool, where string, args ...interface{}) ([]json.RawMessage, error) {
	rows, err := pool.Query(ctx, `
		SELECT json_build_object('id', id, 'user_id', user_id, 'type', type,
			'status', status, 'risk_score', risk_score, 'created_at', created_at)
		FROM compliance_cases `+where, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []json.RawMessage
	for rows.Next() {
		var raw json.RawMessage
		if err := rows.Scan(&raw); err != nil {
			return nil, err
		}
		results = append(results, raw)
	}
	return results, nil
}
