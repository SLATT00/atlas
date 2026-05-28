package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/atlas-platform/atlas/backend/internal/loan/handler"
	"github.com/atlas-platform/atlas/backend/internal/loan/repository"
	"github.com/atlas-platform/atlas/backend/internal/loan/service"
	"github.com/atlas-platform/atlas/backend/pkg/config"
	"github.com/atlas-platform/atlas/backend/pkg/database"
	"github.com/atlas-platform/atlas/backend/pkg/logger"
	"github.com/atlas-platform/atlas/backend/pkg/middleware"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load("loan-service")
	cfg.Port = 8013
	cfg.Postgres.DBName = "loan_db"

	log := logger.New(cfg.ServiceName, cfg.LogLevel)
	defer log.Sync()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	pool, err := database.NewPool(ctx, database.Config{DSN: cfg.Postgres.DSN()})
	if err != nil {
		log.Fatal(fmt.Sprintf("failed to connect to database: %v", err))
	}
	defer pool.Close()

	repo := repository.New(pool)
	svc := service.New(repo)
	h := handler.New(svc, log)

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

	loans := r.Group("/api/v1/loans")
	loans.Use(middleware.Auth(cfg.JWT.Secret))
	{
		loans.GET("", h.ListLoans)
		loans.POST("", h.CreateLoan)
		loans.GET("/:id", h.GetLoan)
		loans.POST("/:id/repay", h.Repay)
		loans.POST("/:id/topup", h.TopupCollateral)
		loans.GET("/:id/collateral", h.GetCollateral)
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
