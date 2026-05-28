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
	cfg := config.Load("audit-service")
	cfg.Port = 8017
	cfg.Postgres.DBName = "audit_db"

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

	audit := r.Group("/api/v1/audit")
	audit.Use(middleware.Auth(cfg.JWT.Secret))
	{
		audit.POST("/log", createLogHandler(pool, log))
		audit.GET("/logs", listLogsHandler(pool, log))
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

func createLogHandler(pool *pgxpool.Pool, log *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			EventType  string      `json:"event_type" binding:"required"`
			EntityType string      `json:"entity_type" binding:"required"`
			EntityID   string      `json:"entity_id" binding:"required"`
			OldValue   interface{} `json:"old_value"`
			NewValue   interface{} `json:"new_value"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			response.ValidationError(c, err.Error())
			return
		}

		actorID := c.GetString("user_id")
		correlationID := c.GetString("correlation_id")
		id := uuid.New().String()

		_, err := pool.Exec(c.Request.Context(), `
			INSERT INTO audit_logs (id, actor_id, event_type, entity_type, entity_id,
				old_value, new_value, ip_address, correlation_id, timestamp)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
		`, id, actorID, input.EventType, input.EntityType, input.EntityID,
			input.OldValue, input.NewValue, c.ClientIP(), correlationID)
		if err != nil {
			log.Error("create audit log failed", zap.Error(err))
			response.InternalError(c)
			return
		}

		response.Created(c, gin.H{"id": id})
	}
}

func listLogsHandler(pool *pgxpool.Pool, log *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		entityType := c.Query("entity_type")
		entityID := c.Query("entity_id")
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))
		offset := (page - 1) * perPage

		query := `SELECT id, actor_id, event_type, entity_type, entity_id, ip_address, timestamp
			FROM audit_logs`

		var args []interface{}
		argIdx := 1

		if entityType != "" && entityID != "" {
			query += fmt.Sprintf(" WHERE entity_type = $%d AND entity_id = $%d", argIdx, argIdx+1)
			args = append(args, entityType, entityID)
			argIdx += 2
		}

		query += fmt.Sprintf(" ORDER BY timestamp DESC LIMIT $%d OFFSET $%d", argIdx, argIdx+1)
		args = append(args, perPage, offset)

		rows, err := pool.Query(c.Request.Context(), query, args...)
		if err != nil {
			log.Error("list audit logs failed", zap.Error(err))
			response.InternalError(c)
			return
		}
		defer rows.Close()

		var logs []gin.H
		for rows.Next() {
			var id, actorID, eventType, entType, entID, ip string
			var ts time.Time
			if err := rows.Scan(&id, &actorID, &eventType, &entType, &entID, &ip, &ts); err != nil {
				continue
			}
			logs = append(logs, gin.H{
				"id": id, "actor_id": actorID, "event_type": eventType,
				"entity_type": entType, "entity_id": entID,
				"ip_address": ip, "timestamp": ts,
			})
		}
		response.OK(c, logs)
	}
}
