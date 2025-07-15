# Environment-specific configurations
ENV_DEV = .env.dev
ENV_PROD = .env

# Default to production
ENV_FILE ?= $(ENV_PROD)
COMPOSE_FILE_DEV = docker-compose.dev.yml
COMPOSE_FILE_PROD = docker-compose.prod.yml

# Production commands (default)
up:
	docker compose -f $(COMPOSE_FILE_PROD) --env-file $(ENV_PROD) up --build -d
	@echo "Production environment started"
	@echo "Frontend: http://localhost:$$(grep FRONTEND_PORT $(ENV_PROD) | cut -d'=' -f2)"
	@echo "API: http://localhost:$$(grep API_PORT $(ENV_PROD) | cut -d'=' -f2)"
	@echo "MySQL: localhost:$$(grep MYSQL_PORT $(ENV_PROD) | cut -d'=' -f2)"
	@echo "To stop: make down"

# Development commands
up-dev:
	docker compose -f $(COMPOSE_FILE_DEV) --env-file $(ENV_DEV) up --build -d
	@echo "Development environment started"
	@echo "Frontend: http://localhost:$$(grep FRONTEND_PORT $(ENV_DEV) | cut -d'=' -f2)"
	@echo "API: http://localhost:$$(grep API_PORT $(ENV_DEV) | cut -d'=' -f2)"
	@echo "MySQL: localhost:$$(grep MYSQL_PORT $(ENV_DEV) | cut -d'=' -f2)"
	@echo "To stop: make down-dev"

# Migration commands
migrate:
	docker compose -f $(COMPOSE_FILE_PROD) --env-file $(ENV_PROD) exec api npx knex migrate:latest
	@echo "Database migrated (production - no seeds)"

migrate-dev:
	docker compose -f $(COMPOSE_FILE_DEV) --env-file $(ENV_DEV) exec api npx knex migrate:latest
	docker compose -f $(COMPOSE_FILE_DEV) --env-file $(ENV_DEV) exec api npx knex seed:run
	@echo "Database migrated and seeded (development)"

# Stop commands
down:
	docker compose -f $(COMPOSE_FILE_PROD) --env-file $(ENV_PROD) down -v
	@echo "Production environment stopped"

down-dev:
	docker compose -f $(COMPOSE_FILE_DEV) --env-file $(ENV_DEV) down -v
	@echo "Development environment stopped"

# Logs
logs:
	docker compose -f $(COMPOSE_FILE_PROD) --env-file $(ENV_PROD) logs -f

logs-dev:
	docker compose -f $(COMPOSE_FILE_DEV) --env-file $(ENV_DEV) logs -f

# Database connection helpers
db-connect:
	@echo "Connecting to production database..."
	@MYSQL_PORT=$$(grep MYSQL_PORT $(ENV_PROD) | cut -d'=' -f2); \
	MYSQL_USER=$$(grep MYSQL_USER $(ENV_PROD) | cut -d'=' -f2); \
	MYSQL_DATABASE=$$(grep MYSQL_DATABASE $(ENV_PROD) | cut -d'=' -f2); \
	echo "mysql -h localhost -P $$MYSQL_PORT -u $$MYSQL_USER -p $$MYSQL_DATABASE"

db-connect-dev:
	@echo "Connecting to development database..."
	@MYSQL_PORT=$$(grep MYSQL_PORT $(ENV_DEV) | cut -d'=' -f2); \
	MYSQL_USER=$$(grep MYSQL_USER $(ENV_DEV) | cut -d'=' -f2); \
	MYSQL_DATABASE=$$(grep MYSQL_DATABASE $(ENV_DEV) | cut -d'=' -f2); \
	echo "mysql -h localhost -P $$MYSQL_PORT -u $$MYSQL_USER -p $$MYSQL_DATABASE"

# Utility commands
clean:
	docker system prune -f
	docker volume prune -f
	@echo "Docker system cleaned"

status:
	docker compose -f $(COMPOSE_FILE_PROD) --env-file $(ENV_PROD) ps

status-dev:
	docker compose -f $(COMPOSE_FILE_DEV) --env-file $(ENV_DEV) ps

# Help
help:
	@echo "Available commands:"
	@echo "  up          - Start production environment"
	@echo "  up-dev      - Start development environment"
	@echo "  down        - Stop production environment"
	@echo "  down-dev    - Stop development environment"
	@echo "  migrate     - Run migrations (production)"
	@echo "  migrate-dev - Run migrations (development)"
	@echo "  logs        - View production logs"
	@echo "  logs-dev    - View development logs"
	@echo "  db-connect  - Show prod database connection command"
	@echo "  db-connect-dev - Show dev database connection command"
	@echo "  clean       - Clean Docker system"
	@echo "  status      - Show production container status"
	@echo "  status-dev  - Show development container status"
	@echo "  help        - Show this help message"

.PHONY: up up-dev down down-dev migrate migrate-dev logs logs-dev db-connect db-connect-dev clean status status-dev help