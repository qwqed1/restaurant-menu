#!/bin/bash

# Monitoring script for HALAL HALL Restaurant Menu
# Sends alerts when services are down or resources are critical

# Configuration
WEBHOOK_URL=""  # Slack/Discord/Telegram webhook URL
EMAIL_TO="admin@example.com"
EMAIL_FROM="monitoring@halalhall.com"
CPU_THRESHOLD=80
MEMORY_THRESHOLD=90
DISK_THRESHOLD=85

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to send alert
send_alert() {
    local level=$1
    local service=$2
    local message=$3
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Log to file
    echo "[$timestamp] [$level] $service: $message" >> /var/log/halal_hall/monitoring.log
    
    # Send webhook notification (if configured)
    if [ -n "$WEBHOOK_URL" ]; then
        curl -X POST $WEBHOOK_URL \
            -H 'Content-Type: application/json' \
            -d "{\"text\": \"🚨 [$level] $service: $message\"}" \
            2>/dev/null
    fi
    
    # Send email (if mail is configured)
    if command -v mail >/dev/null 2>&1; then
        echo "$message" | mail -s "[$level] HALAL HALL Alert: $service" $EMAIL_TO
    fi
}

# Check service health
check_service_health() {
    local service_name=$1
    local container_name=$2
    
    # Check if container is running
    if ! docker ps --format "{{.Names}}" | grep -q "^${container_name}$"; then
        send_alert "CRITICAL" "$service_name" "Container $container_name is not running"
        return 1
    fi
    
    # Check container health status
    health=$(docker inspect --format='{{.State.Health.Status}}' $container_name 2>/dev/null || echo "none")
    if [ "$health" = "unhealthy" ]; then
        send_alert "WARNING" "$service_name" "Container $container_name is unhealthy"
        return 1
    fi
    
    return 0
}

# Check API endpoint
check_api_endpoint() {
    local endpoint=$1
    local name=$2
    local response_code=$(curl -s -o /dev/null -w "%{http_code}" $endpoint)
    
    if [ "$response_code" != "200" ]; then
        send_alert "CRITICAL" "API" "$name endpoint returned $response_code"
        return 1
    fi
    
    return 0
}

# Check system resources
check_system_resources() {
    # CPU usage
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print int(100 - $1)}')
    if [ $cpu_usage -gt $CPU_THRESHOLD ]; then
        send_alert "WARNING" "System" "CPU usage is ${cpu_usage}% (threshold: ${CPU_THRESHOLD}%)"
    fi
    
    # Memory usage
    memory_usage=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
    if [ $memory_usage -gt $MEMORY_THRESHOLD ]; then
        send_alert "WARNING" "System" "Memory usage is ${memory_usage}% (threshold: ${MEMORY_THRESHOLD}%)"
    fi
    
    # Disk usage
    disk_usage=$(df -h / | awk 'NR==2 {print int($5)}')
    if [ $disk_usage -gt $DISK_THRESHOLD ]; then
        send_alert "CRITICAL" "System" "Disk usage is ${disk_usage}% (threshold: ${DISK_THRESHOLD}%)"
    fi
}

# Check database connectivity
check_database() {
    if ! docker exec halal_hall_db pg_isready -U postgres >/dev/null 2>&1; then
        send_alert "CRITICAL" "Database" "PostgreSQL is not accepting connections"
        return 1
    fi
    
    # Check database size
    db_size=$(docker exec halal_hall_db psql -U postgres -t -c "SELECT pg_size_pretty(pg_database_size('restaurant_menu'));" | xargs)
    
    # Check number of connections
    connections=$(docker exec halal_hall_db psql -U postgres -t -c "SELECT count(*) FROM pg_stat_activity;" | xargs)
    max_connections=$(docker exec halal_hall_db psql -U postgres -t -c "SHOW max_connections;" | xargs)
    
    if [ $connections -gt $((max_connections * 80 / 100)) ]; then
        send_alert "WARNING" "Database" "High number of connections: $connections/$max_connections"
    fi
}

# Check backup status
check_backups() {
    backup_dir="/var/backups/halal_hall"
    
    # Check if backup directory exists
    if [ ! -d "$backup_dir" ]; then
        send_alert "WARNING" "Backup" "Backup directory does not exist"
        return 1
    fi
    
    # Check latest backup age
    latest_backup=$(ls -t $backup_dir/*.sql.gz 2>/dev/null | head -1)
    if [ -z "$latest_backup" ]; then
        send_alert "CRITICAL" "Backup" "No backups found"
        return 1
    fi
    
    # Check if backup is older than 24 hours
    backup_age=$(($(date +%s) - $(stat -c %Y "$latest_backup")))
    if [ $backup_age -gt 86400 ]; then
        send_alert "WARNING" "Backup" "Latest backup is older than 24 hours"
    fi
}

# Check SSL certificate expiry
check_ssl_expiry() {
    cert_file="/home/halalhall/app/nginx/ssl/cert.pem"
    
    if [ -f "$cert_file" ]; then
        expiry_date=$(openssl x509 -enddate -noout -in "$cert_file" | cut -d= -f2)
        expiry_timestamp=$(date -d "$expiry_date" +%s)
        current_timestamp=$(date +%s)
        days_until_expiry=$(( ($expiry_timestamp - $current_timestamp) / 86400 ))
        
        if [ $days_until_expiry -lt 7 ]; then
            send_alert "CRITICAL" "SSL" "Certificate expires in $days_until_expiry days"
        elif [ $days_until_expiry -lt 30 ]; then
            send_alert "WARNING" "SSL" "Certificate expires in $days_until_expiry days"
        fi
    fi
}

# Main monitoring function
main() {
    echo -e "${GREEN}Starting health checks...${NC}"
    
    # Service checks
    check_service_health "Database" "halal_hall_db"
    check_service_health "Backend" "halal_hall_backend"
    check_service_health "Frontend" "halal_hall_frontend"
    check_service_health "Nginx" "halal_hall_nginx"
    
    # API checks
    check_api_endpoint "http://localhost/api/health" "Backend Health"
    check_api_endpoint "http://localhost/health" "Nginx Health"
    
    # System checks
    check_system_resources
    
    # Database checks
    check_database
    
    # Backup checks
    check_backups
    
    # SSL checks
    check_ssl_expiry
    
    echo -e "${GREEN}Health checks completed${NC}"
}

# Run main function
main
