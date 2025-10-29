#!/bin/bash

# Quick Setup Script for HALAL HALL on VPS
# Optimized for 1GB RAM / 1 CPU server
# Server: 194.32.142.53 (Ubuntu 24.04 LTS)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_message() {
    echo -e "${2}${1}${NC}"
}

print_step() {
    echo ""
    echo -e "${BLUE}===================================================${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${BLUE}===================================================${NC}"
    echo ""
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    print_message "Этот скрипт должен быть запущен с правами root (sudo -i)" "$RED"
    exit 1
fi

print_message "
╔═══════════════════════════════════════════════════════╗
║     HALAL HALL - Быстрая установка на VPS            ║
║     Сервер: 194.32.142.53 (1GB RAM / 1 CPU)          ║
╚═══════════════════════════════════════════════════════╝
" "$GREEN"

# Confirmation
print_message "Этот скрипт выполнит:" "$YELLOW"
echo "  ✓ Обновление системы"
echo "  ✓ Установку Docker и Docker Compose"
echo "  ✓ Настройку файрвола (UFW)"
echo "  ✓ Настройку fail2ban"
echo "  ✓ Создание swap файла (2GB)"
echo "  ✓ Создание пользователя приложения"
echo "  ✓ Настройку автоматических бэкапов"
echo ""
read -p "Продолжить установку? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    print_message "Установка отменена" "$YELLOW"
    exit 0
fi

# Step 1: System Update
print_step "Шаг 1/8: Обновление системы"
apt update
apt upgrade -y
apt autoremove -y
print_message "✓ Система обновлена" "$GREEN"

# Step 2: Install Essential Packages
print_step "Шаг 2/8: Установка необходимых пакетов"
apt install -y \
    curl \
    wget \
    git \
    vim \
    htop \
    ufw \
    fail2ban \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    zip \
    unzip
print_message "✓ Пакеты установлены" "$GREEN"

# Step 3: Setup Swap (Important for 1GB RAM!)
print_step "Шаг 3/8: Создание swap файла (2GB)"
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    
    # Optimize swap usage
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    echo 'vm.vfs_cache_pressure=50' >> /etc/sysctl.conf
    sysctl -p
    
    print_message "✓ Swap файл создан (2GB)" "$GREEN"
else
    print_message "⚠ Swap файл уже существует" "$YELLOW"
fi

# Step 4: Install Docker
print_step "Шаг 4/8: Установка Docker"

# Remove old versions
apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Add Docker repository
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Install docker-compose standalone
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Start Docker
systemctl start docker
systemctl enable docker

print_message "✓ Docker установлен: $(docker --version)" "$GREEN"
print_message "✓ Docker Compose: $(docker-compose --version)" "$GREEN"

# Step 5: Setup Firewall
print_step "Шаг 5/8: Настройка файрвола"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable

print_message "✓ Файрвол настроен" "$GREEN"
ufw status verbose

# Step 6: Setup fail2ban
print_step "Шаг 6/8: Настройка fail2ban"
cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
EOF

systemctl restart fail2ban
systemctl enable fail2ban
print_message "✓ Fail2ban настроен" "$GREEN"

# Step 7: Create Application User
print_step "Шаг 7/8: Создание пользователя приложения"
if ! id -u halalhall >/dev/null 2>&1; then
    useradd -m -s /bin/bash halalhall
    usermod -aG docker halalhall
    print_message "✓ Пользователь halalhall создан" "$GREEN"
else
    print_message "⚠ Пользователь halalhall уже существует" "$YELLOW"
fi

# Create directories
mkdir -p /home/halalhall/app
mkdir -p /var/backups/halal_hall
mkdir -p /var/log/halal_hall

chown -R halalhall:halalhall /home/halalhall/app
chown -R halalhall:halalhall /var/backups/halal_hall
chown -R halalhall:halalhall /var/log/halal_hall

print_message "✓ Директории созданы" "$GREEN"

# Step 8: Setup Automatic Backups
print_step "Шаг 8/8: Настройка автоматических бэкапов"
cat > /home/halalhall/backup.sh <<'BACKUP_SCRIPT'
#!/bin/bash
BACKUP_DIR="/var/backups/halal_hall"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/var/log/halal_hall/backup.log"

echo "[$(date)] Starting backup..." >> $LOG_FILE

# Check if container exists
if docker ps -a --format '{{.Names}}' | grep -q '^halal_hall_db$'; then
    docker exec halal_hall_db pg_dump -U postgres restaurant_menu | gzip > "${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql.gz"
    
    # Keep only last 30 days
    find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
    
    echo "[$(date)] Backup completed: db_backup_${TIMESTAMP}.sql.gz" >> $LOG_FILE
else
    echo "[$(date)] Database container not found, skipping backup" >> $LOG_FILE
fi
BACKUP_SCRIPT

chmod +x /home/halalhall/backup.sh
chown halalhall:halalhall /home/halalhall/backup.sh

# Add to crontab for halalhall user
(crontab -u halalhall -l 2>/dev/null; echo "0 2 * * * /home/halalhall/backup.sh") | crontab -u halalhall -

print_message "✓ Автоматические бэкапы настроены (ежедневно в 2:00)" "$GREEN"

# Setup automatic security updates
print_step "Бонус: Настройка автоматических обновлений безопасности"
apt install -y unattended-upgrades apt-listchanges
dpkg-reconfigure -plow unattended-upgrades
print_message "✓ Автоматические обновления настроены" "$GREEN"

# Summary
print_message "
╔═══════════════════════════════════════════════════════╗
║            Установка завершена успешно!               ║
╚═══════════════════════════════════════════════════════╝
" "$GREEN"

print_message "Следующие шаги:" "$BLUE"
echo ""
echo "1. Переключитесь на пользователя приложения:"
echo "   su - halalhall"
echo ""
echo "2. Перейдите в директорию приложения:"
echo "   cd /home/halalhall/app"
echo ""
echo "3. Склонируйте ваш репозиторий:"
echo "   git clone https://github.com/your-username/halal-hall-menu.git ."
echo ""
echo "4. Настройте переменные окружения:"
echo "   cp .env.production.example .env.production"
echo "   nano .env.production"
echo ""
echo "5. Запустите приложение:"
echo "   docker-compose -f docker-compose.prod.yml up -d"
echo ""

print_message "Информация о сервере:" "$YELLOW"
echo "  IP: 194.32.142.53"
echo "  Пользователь приложения: halalhall"
echo "  Директория: /home/halalhall/app"
echo "  Бэкапы: /var/backups/halal_hall"
echo "  Логи: /var/log/halal_hall"
echo ""

print_message "Проверка установки:" "$YELLOW"
echo "  Docker: $(docker --version)"
echo "  Docker Compose: $(docker-compose --version)"
echo "  Swap: $(free -h | grep Swap | awk '{print $2}')"
echo "  Firewall: $(ufw status | grep Status)"
echo ""

print_message "✅ Сервер готов к развертыванию приложения!" "$GREEN"
