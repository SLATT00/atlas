.PHONY: all deps proto lint test build run migrate clean

all: deps build

# ─── Dependencies ───
deps:
	cd backend && go mod download
	cd web && npm install
	cd mobile && flutter pub get

# ─── Proto Generation ───
proto:
	@echo "Generating protobuf..."
	cd proto && buf generate

# ─── Linting ───
lint:
	cd backend && golangci-lint run ./...
	cd web && npm run lint

# ─── Tests ───
test:
	cd backend && go test ./... -cover -race
	cd web && npm test

test-integration:
	cd backend && go test ./... -tags=integration -cover

test-e2e:
	cd web && npm run test:e2e

# ─── Build ───
build:
	cd backend && go build -o bin/ ./cmd/...
	cd web && npm run build

build-docker:
	docker-compose build

# ─── Run ───
run:
	docker-compose up -d

run-service:
	cd backend && go run ./cmd/$(SERVICE)/main.go

run-web:
	cd web && npm run dev

run-mobile:
	cd mobile && flutter run

# ─── Database ───
migrate:
	cd backend && go run ./cmd/migrate/main.go up

migrate-down:
	cd backend && go run ./cmd/migrate/main.go down

migrate-create:
	cd backend && go run ./cmd/migrate/main.go create $(NAME)

# ─── Infrastructure ───
infra-up:
	docker-compose -f docker-compose.infra.yml up -d

infra-down:
	docker-compose -f docker-compose.infra.yml down

# ─── Clean ───
clean:
	rm -rf backend/bin/
	rm -rf web/.next/
	rm -rf web/node_modules/
	docker-compose down -v
