package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
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
	cfg := config.Load("blockchain-service")
	cfg.Port = 8012
	cfg.Postgres.DBName = "blockchain_db"

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

	blockchain := r.Group("/api/v1/blockchain")
	blockchain.Use(middleware.Auth(cfg.JWT.Secret))
	{
		blockchain.POST("/monitor", monitorHandler(pool, log))
		blockchain.GET("/deposits", depositsHandler(pool, log))
		blockchain.GET("/networks", networksHandler())
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

func monitorHandler(pool *pgxpool.Pool, log *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			Address  string `json:"address" binding:"required"`
			Network  string `json:"network" binding:"required"`
			WalletID string `json:"wallet_id" binding:"required"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			response.ValidationError(c, err.Error())
			return
		}

		id := uuid.New().String()
		_, err := pool.Exec(c.Request.Context(), `
			INSERT INTO monitored_addresses (id, address, network, wallet_id, created_at)
			VALUES ($1, $2, $3, $4, NOW())
		`, id, input.Address, input.Network, input.WalletID)
		if err != nil {
			log.Error("monitor address failed", zap.Error(err))
			response.InternalError(c)
			return
		}

		response.Created(c, gin.H{"id": id, "address": input.Address, "network": input.Network})
	}
}

func depositsHandler(pool *pgxpool.Pool, log *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		network := c.Query("network")
		query := `SELECT id, address, network, tx_hash, amount, confirmations,
			required_confirmations, status, created_at
			FROM blockchain_deposits`
		var args []interface{}

		if network != "" {
			query += " WHERE network = $1"
			args = append(args, network)
		}
		query += " ORDER BY created_at DESC LIMIT 50"

		rows, err := pool.Query(c.Request.Context(), query, args...)
		if err != nil {
			log.Error("list deposits failed", zap.Error(err))
			response.InternalError(c)
			return
		}
		defer rows.Close()

		var deposits []gin.H
		for rows.Next() {
			var id, address, net, txHash, amount, status string
			var confirmations, required int
			var createdAt time.Time
			if err := rows.Scan(&id, &address, &net, &txHash, &amount,
				&confirmations, &required, &status, &createdAt); err != nil {
				continue
			}
			deposits = append(deposits, gin.H{
				"id": id, "address": address, "network": net, "tx_hash": txHash,
				"amount": amount, "confirmations": confirmations,
				"required_confirmations": required, "status": status, "created_at": createdAt,
			})
		}
		response.OK(c, deposits)
	}
}

func networksHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		networks := []gin.H{
			{"name": "bitcoin", "symbol": "BTC", "confirmations": 3, "status": "active"},
			{"name": "ethereum", "symbol": "ETH", "confirmations": 12, "status": "active"},
			{"name": "ton", "symbol": "TON", "confirmations": 1, "status": "active"},
			{"name": "solana", "symbol": "SOL", "confirmations": 1, "status": "active"},
			{"name": "polygon", "symbol": "MATIC", "confirmations": 64, "status": "active"},
			{"name": "arbitrum", "symbol": "ARB", "confirmations": 12, "status": "active"},
		}
		response.OK(c, networks)
	}
}
