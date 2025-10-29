#!/bin/bash

# Management script for HALAL HALL Restaurant Menu
# Usage: ./manage.sh [start|stop|restart|status|logs|backup|restore]

set -e

# Configuration
PROJECT_NAME="halal_hall"
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="/var/backups/${PROJECT_NAME}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Print colored message
print_message() {
    echo -e "${2}${1}${NC}"
}

# Start services
start_services() {
    print_message "Starting services..." "$YELLOW"
    docker-compose -f $COMPOSE_FILE up -d
    print_message "Services started successfully" "$GREEN"
    show_status
}

# Stop services
stop_services() {
    print_message "Stopping services..." "$YELLOW"
    docker-compose -f $COMPOSE_FILE down
    print_message "Services stopped" "$GREEN"
}

# Restart services
restart_services() {
    print_message "Restarting services..." "$YELLOW"
    docker-compose -f $COMPOSE_FILE restart
    print_message "Services restarted successfully" "$GREEN"
    show_status
}

# Show service status
show_status() {
    print_message "\n=== Service Status ===" "$BLUE"
    docker-compose -f $COMPOSE_FILE ps
    
    print_message "\n=== Resource Usage ===" "$BLUE"
    docker stats --no-stream halal_hall_db halal_hall_backend halal_hall_frontend halal_hall_nginx 2>/dev/null || true
    
    print_message "\n=== Health Status ===" "$BLUE"
    for service in halal_hall_db halal_hall_backend halal_hall_frontend halal_hall_nginx; do
        health=$(docker inspect --format='{{.State.Health.Status}}' $service 2>/dev/null || echo "unknown")
        if [ "$health" == "healthy" ]; then
            print_message "$service: $health" "$GREEN"
        elif [ "$health" == "unknown" ] || [ "$health" == "" ]; then
            status=$(docker inspect --format='{{.State.Status}}' $service 2>/dev/null || echo "not found")
            print_message "$service: $status" "$YELLOW"
        else
            print_message "$service: $health" "$RED"
        fi
    done
}

# Show logs
show_logs() {
    SERVICE=${2:-all}
    LINES=${3:-100}
    
    if [ "$SERVICE" == "all" ]; then
        print_message "Showing logs for all services (last $LINES lines)..." "$YELLOW"
        docker-compose -f $COMPOSE_FILE logs --tail=$LINES -f
    else
        print_message "Showing logs for $SERVICE (last $LINES lines)..." "$YELLOW"
        docker-compose -f $COMPOSE_FILE logs --tail=$LINES -f $SERVICE
    fi
}

# Backup database
backup_database() {
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    mkdir -p "$BACKUP_DIR"
    
    print_message "Creating database backup..." "$YELLOW"
    
    docker exec halal_hall_db pg_dump -U postgres restaurant_menu > \
        "${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql"
    
    # Compress backup
    gzip "${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql"
    
    print_message "Backup created: ${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql.gz" "$GREEN"
    
    # Show backup size
    SIZE=$(du -h "${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql.gz" | cut -f1)
    print_message "Backup size: $SIZE" "$BLUE"
}

# Restore database
restore_database() {
    BACKUP_FILE=$2
    
    if [ -z "$BACKUP_FILE" ]; then
        print_message "Error: Please specify backup file" "$RED"
        print_message "Usage: ./manage.sh restore <backup_file>" "$YELLOW"
        print_message "\nAvailable backups:" "$BLUE"
        ls -lah "$BACKUP_DIR"/*.sql.gz 2>/dev/null || print_message "No backups found" "$YELLOW"
        exit 1
    fi
    
    if [ ! -f "$BACKUP_FILE" ]; then
        print_message "Error: Backup file not found: $BACKUP_FILE" "$RED"
        exit 1
    fi
    
    print_message "WARNING: This will overwrite the current database!" "$RED"
    read -p "Are you sure? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        print_message "Restore cancelled" "$YELLOW"
        exit 0
    fi
    
    print_message "Restoring database from $BACKUP_FILE..." "$YELLOW"
    
    # Create backup of current database
    print_message "Creating backup of current database first..." "$YELLOW"
    backup_database
    
    # Decompress if needed
    if [[ "$BACKUP_FILE" == *.gz ]]; then
        gunzip -c "$BACKUP_FILE" | docker exec -i halal_hall_db psql -U postgres restaurant_menu
    else
        docker exec -i halal_hall_db psql -U postgres restaurant_menu < "$BACKUP_FILE"
    fi
    
    print_message "Database restored successfully" "$GREEN"
}

# Clean docker resources
clean_docker() {
    print_message "Cleaning Docker resources..." "$YELLOW"
    
    # Remove stopped containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes (be careful!)
    read -p "Remove unused volumes? This may delete data! (yes/no): " confirm
    if [ "$confirm" == "yes" ]; then
        docker volume prune -f
    fi
    
    # Remove unused networks
    docker network prune -f
    
    print_message "Docker cleanup completed" "$GREEN"
    
    # Show disk usage
    print_message "\nDisk usage:" "$BLUE"
    docker system df
}

# Update application
update_app() {
    print_message "Updating application..." "$YELLOW"
    
    # Pull latest changes
    git pull origin main
    
    # Rebuild containers
    docker-compose -f $COMPOSE_FILE build --no-cache
    
    # Restart services
    docker-compose -f $COMPOSE_FILE up -d
    
    print_message "Application updated successfully" "$GREEN"
}

# SSL certificate management
manage_ssl() {
    ACTION=$2
    DOMAIN=$3
    
    case $ACTION in
        generate)
            if [ -z "$DOMAIN" ]; then
                print_message "Error: Please specify domain" "$RED"
                print_message "Usage: ./manage.sh ssl generate <domain>" "$YELLOW"
                exit 1
            fi
            
            print_message "Generating SSL certificate for $DOMAIN..." "$YELLOW"
            
            # Using Let's Encrypt with Certbot
            docker run -it --rm \
                -v /etc/letsencrypt:/etc/letsencrypt \
                -v /var/lib/letsencrypt:/var/lib/letsencrypt \
                -p 80:80 \
                certbot/certbot certonly \
                --standalone \
                --preferred-challenges http \
                --agree-tos \
                --email admin@$DOMAIN \
                -d $DOMAIN
            
            # Copy certificates to nginx directory
            cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ./nginx/ssl/cert.pem
            cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ./nginx/ssl/key.pem
            
            print_message "SSL certificate generated successfully" "$GREEN"
            print_message "Restart nginx to apply: ./manage.sh restart" "$YELLOW"
            ;;
            
        renew)
            print_message "Renewing SSL certificates..." "$YELLOW"
            docker run -it --rm \
                -v /etc/letsencrypt:/etc/letsencrypt \
                -v /var/lib/letsencrypt:/var/lib/letsencrypt \
                certbot/certbot renew
            print_message "SSL certificates renewed" "$GREEN"
            ;;
            
        *)
            print_message "Usage: ./manage.sh ssl [generate|renew] [domain]" "$YELLOW"
            ;;
    esac
}

# Show help
show_help() {
    print_message "HALAL HALL Restaurant Menu - Management Script" "$BLUE"
    echo ""
    print_message "Usage: ./manage.sh [command] [options]" "$YELLOW"
    echo ""
    print_message "Commands:" "$GREEN"
    echo "  start              - Start all services"
    echo "  stop               - Stop all services"
    echo "  restart            - Restart all services"
    echo "  status             - Show service status"
    echo "  logs [service]     - Show logs (all services or specific)"
    echo "  backup             - Backup database"
    echo "  restore <file>     - Restore database from backup"
    echo "  clean              - Clean Docker resources"
    echo "  update             - Update application"
    echo "  ssl generate <domain> - Generate SSL certificate"
    echo "  ssl renew          - Renew SSL certificates"
    echo "  help               - Show this help message"
    echo ""
    print_message "Examples:" "$BLUE"
    echo "  ./manage.sh start"
    echo "  ./manage.sh logs backend"
    echo "  ./manage.sh backup"
    echo "  ./manage.sh restore /var/backups/halal_hall/db_backup_20240101_120000.sql.gz"
    echo "  ./manage.sh ssl generate example.com"
}

# Main
case $1 in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs "$@"
        ;;
    backup)
        backup_database
        ;;
    restore)
        restore_database "$@"
        ;;
    clean)
        clean_docker
        ;;
    update)
        update_app
        ;;
    ssl)
        manage_ssl "$@"
        ;;
    help|*)
        show_help
        ;;
esac
