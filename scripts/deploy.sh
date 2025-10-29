#!/bin/bash

# Deployment script for HALAL HALL Restaurant Menu
# Usage: ./deploy.sh [production|staging]

set -e

# Configuration
ENVIRONMENT=${1:-production}
PROJECT_NAME="halal_hall"
BACKUP_DIR="/var/backups/${PROJECT_NAME}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to print colored output
print_message() {
    echo -e "${2}${1}${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_message "Checking prerequisites..." "$YELLOW"
for cmd in docker docker-compose git; do
    if ! command_exists "$cmd"; then
        print_message "Error: $cmd is not installed" "$RED"
        exit 1
    fi
done

# Backup database before deployment
backup_database() {
    print_message "Creating database backup..." "$YELLOW"
    mkdir -p "$BACKUP_DIR"
    
    docker exec halal_hall_db pg_dump -U postgres restaurant_menu > \
        "${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql"
    
    print_message "Database backup created: db_backup_${TIMESTAMP}.sql" "$GREEN"
}

# Pull latest changes
update_code() {
    print_message "Pulling latest code from repository..." "$YELLOW"
    git pull origin main
    print_message "Code updated successfully" "$GREEN"
}

# Build and deploy containers
deploy_containers() {
    print_message "Building and deploying containers..." "$YELLOW"
    
    if [ "$ENVIRONMENT" == "production" ]; then
        docker-compose -f docker-compose.prod.yml build --no-cache
        docker-compose -f docker-compose.prod.yml down
        docker-compose -f docker-compose.prod.yml up -d
    else
        docker-compose -f docker-compose.yml build --no-cache
        docker-compose -f docker-compose.yml down
        docker-compose -f docker-compose.yml up -d
    fi
    
    print_message "Containers deployed successfully" "$GREEN"
}

# Run database migrations
run_migrations() {
    print_message "Running database migrations..." "$YELLOW"
    sleep 10 # Wait for database to be ready
    
    # Check if database is initialized
    docker exec halal_hall_backend node -e "
        const pool = require('./config/database.js');
        pool.query('SELECT 1 FROM categories LIMIT 1')
            .then(() => console.log('Database is ready'))
            .catch(() => {
                console.log('Initializing database...');
                require('./auto-init.js').autoInitDatabase();
            });
    "
    
    print_message "Database migrations completed" "$GREEN"
}

# Health check
health_check() {
    print_message "Performing health check..." "$YELLOW"
    sleep 5
    
    # Check backend health
    if curl -f http://localhost/api/health > /dev/null 2>&1; then
        print_message "Backend is healthy" "$GREEN"
    else
        print_message "Backend health check failed" "$RED"
        exit 1
    fi
    
    # Check frontend
    if curl -f http://localhost/ > /dev/null 2>&1; then
        print_message "Frontend is healthy" "$GREEN"
    else
        print_message "Frontend health check failed" "$RED"
        exit 1
    fi
}

# Clean up old backups (keep last 30 days)
cleanup_backups() {
    print_message "Cleaning up old backups..." "$YELLOW"
    find "$BACKUP_DIR" -name "*.sql" -mtime +30 -delete
    print_message "Old backups cleaned" "$GREEN"
}

# Main deployment flow
main() {
    print_message "Starting deployment for $ENVIRONMENT environment" "$GREEN"
    
    # Create backup if in production
    if [ "$ENVIRONMENT" == "production" ]; then
        backup_database
    fi
    
    # Deploy
    update_code
    deploy_containers
    run_migrations
    health_check
    
    # Cleanup
    if [ "$ENVIRONMENT" == "production" ]; then
        cleanup_backups
    fi
    
    print_message "Deployment completed successfully!" "$GREEN"
    print_message "Application is running at: http://$(hostname -I | awk '{print $1}')" "$GREEN"
}

# Run main function
main
