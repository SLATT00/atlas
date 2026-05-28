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
	cfg := config.Load("transaction-service")
	cfg.Port = 8007
	cfg.Postgres.DBName = "transactions_db"

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

	transactions := r.Group("/api/v1/transactions")
	transactions.Use(middleware.Auth(cfg.JWT.Secret))
	{
		transactions.POST("", createTransactionHandler(pool, log))
		transactions.GET("/:id", getTransactionHandler(pool, log))
		transactions.GET("", listTransactionsHandler(pool, log))
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

func createTransactionHandler(pool *pgxpool.Pool, log *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			AccountID   string `json:"account_id" binding:"required"`
			Type        string `json:"type" binding:"required"`
			Currency    string `json:"currency" binding:"required"`
			Amount      string `json:"amount" binding:"required"`
			Fee         string `json:"fee"`
			Description string `json:"description"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			response.ValidationError(c, err.Error())
			return
		}

		id := uuid.New().String()
		ref := "TXN-" + uuid.New().String()[:8]
		fee := input.Fee
		if fee == "" {
			fee = "0.00"
		}

		_, err := pool.Exec(c.Request.Context(), `
			INSERT INTO transactions (id, account_id, type, currency, amount, fee, status, reference, description, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, 'completed', $7, $8, NOW())
		`, id, input.AccountID, input.Type, input.Currency, input.Amount, fee, ref, input.Description)
		if err != nil {
			log.Error("create transaction failed", zap.Error(err))
			response.InternalError(c)
			return
		}

		response.Created(c, gin.H{
			"id": id, "account_id": input.AccountID, "type": input.Type,
			"currency": input.Currency, "amount": input.Amount, "fee": fee,
			"status": "completed", "reference": ref,
		})
	}
}

func getTransactionHandler(pool *pgxpool.Pool, log *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		var txn struct {
			ID          string    `json:"id"`
			AccountID   string    `json:"account_id"`
			Type        string    `json:"type"`
			Currency    string    `json:"currency"`
			Amount      string    `json:"amount"`
			Fee         string    `json:"fee"`
			Status      string    `json:"status"`
			Reference   string    `json:"reference"`
			Description string    `json:"description"`
			CreatedAt   time.Time `json:"created_at"`
		}

		err := pool.QueryRow(c.Request.Context(), `
			SELECT id, account_id, type, currency, amount, fee, status, reference, COALESCE(description, ''), created_at
			FROM transactions WHERE id = $1
		`, id).Scan(&txn.ID, &txn.AccountID, &txn.Type, &txn.Currency,
			&txn.Amount, &txn.Fee, &txn.Status, &txn.Reference, &txn.Description, &txn.CreatedAt)
		if err != nil {
			response.NotFound(c, "Transaction not found")
			return
		}
		response.OK(c, txn)
	}
}

func listTransactionsHandler(pool *pgxpool.Pool, log *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		accountID := c.Query("account_id")
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))
		offset := (page - 1) * perPage

		query := `SELECT id, account_id, type, currency, amount, fee, status, reference, COALESCE(description, ''), created_at
			FROM transactions`
		var args []interface{}

		if accountID != "" {
			query += " WHERE account_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3"
			args = append(args, accountID, perPage, offset)
		} else {
			query += " ORDER BY created_at DESC LIMIT $1 OFFSET $2"
			args = append(args, perPage, offset)
		}

		rows, err := pool.Query(c.Request.Context(), query, args...)
		if err != nil {
			log.Error("list transactions failed", zap.Error(err))
			response.InternalError(c)
			return
		}
		defer rows.Close()

		var txns []gin.H
		for rows.Next() {
			var id, accID, typ, currency, amount, fee, status, ref, desc string
			var createdAt time.Time
			if err := rows.Scan(&id, &accID, &typ, &currency, &amount, &fee, &status, &ref, &desc, &createdAt); err != nil {
				continue
			}
			txns = append(txns, gin.H{
				"id": id, "account_id": accID, "type": typ, "currency": currency,
				"amount": amount, "fee": fee, "status": status, "reference": ref,
				"description": desc, "created_at": createdAt,
			})
		}
		response.OK(c, txns)
	}
}
