# Makefile for HALAL HALL Restaurant Menu
# Usage: make [target]

.PHONY: help build up down restart logs status backup restore clean update ssl-generate ssl-renew

# Default environment
ENV ?= production
COMPOSE_FILE = docker-compose.$(ENV).yml

# Colors for output
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
NC = \033[0m

help: ## Show this help message
	@echo "$(GREEN)HALAL HALL Restaurant Menu - Make Commands$(NC)"
	@echo ""
	@echo "Usage: make [target] [ENV=production|development]"
	@echo ""
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "Examples:"
	@echo "  make build         # Build production containers"
	@echo "  make up ENV=dev    # Start development environment"
	@echo "  make logs          # Show logs for all services"

build: ## Build Docker containers
	@echo "$(YELLOW)Building containers for $(ENV) environment...$(NC)"
	docker-compose -f $(COMPOSE_FILE) build --no-cache

up: ## Start all services
	@echo "$(YELLOW)Starting services for $(ENV) environment...$(NC)"
	docker-compose -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)Services started successfully$(NC)"
	@make status

down: ## Stop all services
	@echo "$(YELLOW)Stopping services...$(NC)"
	docker-compose -f $(COMPOSE_FILE) down
	@echo "$(GREEN)Services stopped$(NC)"

restart: ## Restart all services
	@echo "$(YELLOW)Restarting services...$(NC)"
	docker-compose -f $(COMPOSE_FILE) restart
	@echo "$(GREEN)Services restarted$(NC)"

logs: ## Show logs for all services
	docker-compose -f $(COMPOSE_FILE) logs -f --tail=100

logs-backend: ## Show backend logs
	docker-compose -f $(COMPOSE_FILE) logs -f --tail=100 backend

logs-nginx: ## Show nginx logs
	docker-compose -f $(COMPOSE_FILE) logs -f --tail=100 nginx

logs-db: ## Show database logs
	docker-compose -f $(COMPOSE_FILE) logs -f --tail=100 postgres

status: ## Show status of all services
	@echo "$(YELLOW)Service Status:$(NC)"
	@docker-compose -f $(COMPOSE_FILE) ps
	@echo ""
	@echo "$(YELLOW)Health Status:$(NC)"
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep halal_hall || echo "No services running"

backup: ## Create database backup
	@echo "$(YELLOW)Creating database backup...$(NC)"
	@mkdir -p backups
	@docker exec halal_hall_db pg_dump -U postgres restaurant_menu | gzip > backups/db_backup_$(shell date +%Y%m%d_%H%M%S).sql.gz
	@echo "$(GREEN)Backup created in backups/ directory$(NC)"

restore: ## Restore database from backup (usage: make restore FILE=backup.sql.gz)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)Error: Please specify backup file$(NC)"; \
		echo "Usage: make restore FILE=backups/backup.sql.gz"; \
		exit 1; \
	fi
	@echo "$(YELLOW)Restoring database from $(FILE)...$(NC)"
	@gunzip -c $(FILE) | docker exec -i halal_hall_db psql -U postgres restaurant_menu
	@echo "$(GREEN)Database restored successfully$(NC)"

clean: ## Clean Docker resources
	@echo "$(YELLOW)Cleaning Docker resources...$(NC)"
	docker system prune -af --volumes
	@echo "$(GREEN)Cleanup completed$(NC)"

shell-backend: ## Open shell in backend container
	docker exec -it halal_hall_backend sh

shell-db: ## Open PostgreSQL shell
	docker exec -it halal_hall_db psql -U postgres restaurant_menu

shell-nginx: ## Open shell in nginx container
	docker exec -it halal_hall_nginx sh

migrate: ## Run database migrations
	@echo "$(YELLOW)Running database migrations...$(NC)"
	docker exec halal_hall_backend node -e "require('./auto-init.js').autoInitDatabase()"
	@echo "$(GREEN)Migrations completed$(NC)"

test: ## Run tests
	@echo "$(YELLOW)Running tests...$(NC)"
	cd backend && npm test
	npm test

lint: ## Run linters
	@echo "$(YELLOW)Running linters...$(NC)"
	cd backend && npm run lint
	npm run lint

update: ## Update application (pull, build, restart)
	@echo "$(YELLOW)Updating application...$(NC)"
	git pull origin main
	@make build
	@make up
	@echo "$(GREEN)Application updated successfully$(NC)"

ssl-generate: ## Generate SSL certificate (usage: make ssl-generate DOMAIN=example.com)
	@if [ -z "$(DOMAIN)" ]; then \
		echo "$(RED)Error: Please specify domain$(NC)"; \
		echo "Usage: make ssl-generate DOMAIN=example.com"; \
		exit 1; \
	fi
	@echo "$(YELLOW)Generating SSL certificate for $(DOMAIN)...$(NC)"
	@mkdir -p nginx/ssl
	docker run -it --rm \
		-v $$(pwd)/nginx/ssl:/etc/letsencrypt \
		-p 80:80 \
		certbot/certbot certonly \
		--standalone \
		--preferred-challenges http \
		--agree-tos \
		--email admin@$(DOMAIN) \
		-d $(DOMAIN) \
		-d www.$(DOMAIN)
	@echo "$(GREEN)SSL certificate generated$(NC)"

ssl-renew: ## Renew SSL certificates
	@echo "$(YELLOW)Renewing SSL certificates...$(NC)"
	docker run -it --rm \
		-v $$(pwd)/nginx/ssl:/etc/letsencrypt \
		certbot/certbot renew
	@echo "$(GREEN)SSL certificates renewed$(NC)"

install-local: ## Install dependencies locally
	@echo "$(YELLOW)Installing dependencies...$(NC)"
	npm install
	cd backend && npm install
	@echo "$(GREEN)Dependencies installed$(NC)"

dev: ## Start development environment
	@echo "$(YELLOW)Starting development environment...$(NC)"
	docker-compose -f docker-compose.yml up -d
	@echo "$(GREEN)Development environment started$(NC)"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend: http://localhost:3001"
	@echo "Database: localhost:5432"

prod: ## Start production environment
	@echo "$(YELLOW)Starting production environment...$(NC)"
	docker-compose -f docker-compose.prod.yml up -d
	@echo "$(GREEN)Production environment started$(NC)"
	@echo "Application: http://localhost"

ps: ## Show running containers
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep halal_hall || echo "No services running"

health: ## Check health of all services
	@echo "$(YELLOW)Checking service health...$(NC)"
	@curl -sf http://localhost/health > /dev/null && echo "$(GREEN)✓ Nginx is healthy$(NC)" || echo "$(RED)✗ Nginx is not healthy$(NC)"
	@curl -sf http://localhost:3001/health > /dev/null && echo "$(GREEN)✓ Backend is healthy$(NC)" || echo "$(RED)✗ Backend is not healthy$(NC)"
	@docker exec halal_hall_db pg_isready -U postgres > /dev/null 2>&1 && echo "$(GREEN)✓ Database is healthy$(NC)" || echo "$(RED)✗ Database is not healthy$(NC)"

info: ## Show project information
	@echo "$(GREEN)HALAL HALL Restaurant Menu$(NC)"
	@echo ""
	@echo "$(YELLOW)Project Structure:$(NC)"
	@echo "  Frontend: React + Vite + Tailwind CSS"
	@echo "  Backend: Node.js + Express + PostgreSQL"
	@echo "  Infrastructure: Docker + Nginx"
	@echo ""
	@echo "$(YELLOW)Current Environment:$(NC) $(ENV)"
	@echo ""
	@echo "$(YELLOW)Services:$(NC)"
	@docker-compose -f $(COMPOSE_FILE) ps --services

.DEFAULT_GOAL := help
