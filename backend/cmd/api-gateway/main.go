package main

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/atlas-platform/atlas/backend/pkg/config"
	"github.com/atlas-platform/atlas/backend/pkg/logger"
	"github.com/atlas-platform/atlas/backend/pkg/middleware"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

type serviceRoute struct {
	prefix string
	target string
}

func main() {
	cfg := config.Load("api-gateway")
	cfg.Port = 8080

	log := logger.New(cfg.ServiceName, cfg.LogLevel)
	defer log.Sync()

	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.Redis.Addr(),
		Password: cfg.Redis.Password,
		DB:       cfg.Redis.DB,
	})
	defer rdb.Close()

	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.Logger(log))
	r.Use(middleware.CorrelationID())
	r.Use(middleware.RateLimit(200, time.Minute))
	r.Use(corsMiddleware())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "service": cfg.ServiceName})
	})

	r.GET("/ready", func(c *gin.Context) {
		if err := rdb.Ping(context.Background()).Err(); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"status": "not ready"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "ready"})
	})

	routes := []serviceRoute{
		{prefix: "/api/v1/auth", target: getEnv("AUTH_SERVICE_URL", "http://localhost:8001")},
		{prefix: "/api/v1/users", target: getEnv("USER_SERVICE_URL", "http://localhost:8002")},
		{prefix: "/api/v1/kyc", target: getEnv("KYC_SERVICE_URL", "http://localhost:8003")},
		{prefix: "/api/v1/compliance", target: getEnv("COMPLIANCE_SERVICE_URL", "http://localhost:8004")},
		{prefix: "/api/v1/accounts", target: getEnv("ACCOUNT_SERVICE_URL", "http://localhost:8005")},
		{prefix: "/api/v1/ledger", target: getEnv("LEDGER_SERVICE_URL", "http://localhost:8006")},
		{prefix: "/api/v1/transfers", target: getEnv("TRANSFER_SERVICE_URL", "http://localhost:8008")},
		{prefix: "/api/v1/beneficiaries", target: getEnv("TRANSFER_SERVICE_URL", "http://localhost:8008")},
		{prefix: "/api/v1/exchange", target: getEnv("EXCHANGE_SERVICE_URL", "http://localhost:8009")},
		{prefix: "/api/v1/cards", target: getEnv("CARD_SERVICE_URL", "http://localhost:8010")},
		{prefix: "/api/v1/wallets", target: getEnv("WALLET_SERVICE_URL", "http://localhost:8011")},
		{prefix: "/api/v1/loans", target: getEnv("LOAN_SERVICE_URL", "http://localhost:8013")},
		{prefix: "/api/v1/savings", target: getEnv("SAVINGS_SERVICE_URL", "http://localhost:8014")},
		{prefix: "/api/v1/notifications", target: getEnv("NOTIFICATION_SERVICE_URL", "http://localhost:8015")},
	}

	for _, route := range routes {
		target, err := url.Parse(route.target)
		if err != nil {
			log.Fatal(fmt.Sprintf("invalid service URL: %s", route.target))
		}
		proxy := httputil.NewSingleHostReverseProxy(target)
		r.Any(route.prefix+"/*path", func(c *gin.Context) {
			proxy.ServeHTTP(c.Writer, c.Request)
		})
	}

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Port),
		Handler:      r,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  120 * time.Second,
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

	log.Info("shutting down gateway...")
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatal(fmt.Sprintf("gateway forced to shutdown: %v", err))
	}
	log.Info("gateway stopped")
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Correlation-ID")
		c.Header("Access-Control-Max-Age", "86400")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
