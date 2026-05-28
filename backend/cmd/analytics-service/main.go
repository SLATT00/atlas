package main

import (
	"context"
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
	cfg := config.Load("analytics-service")
	cfg.Port = 8016
	cfg.Postgres.DBName = "analytics_db"

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

	analytics := r.Group("/api/v1/analytics")
	analytics.Use(middleware.Auth(cfg.JWT.Secret))
	{
		analytics.POST("/track", trackHandler(pool, log))
		analytics.GET("/events", listEventsHandler(pool, log))
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

func trackHandler(pool *pgxpool.Pool, log *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			EventName  string      `json:"event_name" binding:"required"`
			Properties interface{} `json:"properties"`
			SessionID  string      `json:"session_id"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			response.ValidationError(c, err.Error())
			return
		}

		userID := c.GetString("user_id")
		id := uuid.New().String()

		_, err := pool.Exec(c.Request.Context(), `
			INSERT INTO analytics_events (id, user_id, event_name, properties, session_id, created_at)
			VALUES ($1, $2, $3, $4, $5, NOW())
		`, id, userID, input.EventName, input.Properties, input.SessionID)
		if err != nil {
			log.Error("track event failed", zap.Error(err))
			response.InternalError(c)
			return
		}

		response.Created(c, gin.H{"id": id})
	}
}

func listEventsHandler(pool *pgxpool.Pool, log *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("user_id")
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))
		offset := (page - 1) * perPage

		rows, err := pool.Query(c.Request.Context(), `
			SELECT id, event_name, properties, session_id, created_at
			FROM analytics_events WHERE user_id = $1
			ORDER BY created_at DESC
			LIMIT $2 OFFSET $3
		`, userID, perPage, offset)
		if err != nil {
			log.Error("list events failed", zap.Error(err))
			response.InternalError(c)
			return
		}
		defer rows.Close()

		var events []gin.H
		for rows.Next() {
			var id, eventName string
			var properties interface{}
			var sessionID *string
			var createdAt time.Time
			if err := rows.Scan(&id, &eventName, &properties, &sessionID, &createdAt); err != nil {
				continue
			}
			events = append(events, gin.H{
				"id": id, "event_name": eventName, "properties": properties,
				"session_id": sessionID, "created_at": createdAt,
			})
		}
		response.OK(c, events)
	}
}
