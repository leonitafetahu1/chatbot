.PHONY: help up down restart build rebuild logs logs-api logs-db logs-keycloak clean status shell-api shell-db ps

# Default target
help:
	@echo "Available commands:"
	@echo "  up          - Start all services"
	@echo "  down        - Stop all services"
	@echo "  restart     - Restart all services"
	@echo "  build       - Build all images"
	@echo "  rebuild     - Rebuild and start all services"
	@echo "  logs        - Show logs for all services"
	@echo "  status      - Show service status"
	@echo "  ps          - Show running containers"
	@echo "  clean       - Remove containers, networks, and volumes"
	@echo "  help        - Show this help message"

# Start services
up:
	@echo "Starting all services..."
	docker compose up --build -d 

# Stop services
down:
	@echo "Stopping all services..."
	docker compose down -v

# Restart services
restart: down up

# Build images
build:
	@echo "Building all images..."
	docker compose build

# Rebuild and start
rebuild:
	@echo "Rebuilding and starting all services..."
	docker compose up -d --build

# Show logs
logs:
	docker compose logs -f

# Show status
status:
	docker compose ps

# Alias for status
ps: status

# Clean up everything
clean:
	@echo "Removing containers, networks, and volumes..."
	docker compose down --volumes --remove-orphans
	docker system prune -f