#!/bin/bash

# VPS Setup Script for HALAL HALL Restaurant Menu
# This script prepares a fresh VPS for deployment
# Tested on Ubuntu 20.04/22.04 and Debian 11/12

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DOMAIN=""
EMAIL=""
USERNAME="halalhall"
SSH_PORT=22

# Print colored message
print_message() {
    echo -e "${2}${1}${NC}"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_message "This script must be run as root" "$RED"
        exit 1
    fi
}

# Get user input
get_user_input() {
    print_message "VPS Setup Configuration" "$BLUE"
    echo ""
    
    read -p "Enter your domain name (e.g., example.com): " DOMAIN
    read -p "Enter your email address: " EMAIL
    read -p "Enter SSH port (default 22): " SSH_PORT_INPUT
    SSH_PORT=${SSH_PORT_INPUT:-22}
    
    echo ""
    print_message "Configuration Summary:" "$YELLOW"
    echo "Domain: $DOMAIN"
    echo "Email: $EMAIL"
    echo "SSH Port: $SSH_PORT"
    echo ""
    
    read -p "Continue with this configuration? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        print_message "Setup cancelled" "$YELLOW"
        exit 0
    fi
}

# Update system
update_system() {
    print_message "Updating system packages..." "$YELLOW"
    apt-get update
    apt-get upgrade -y
    apt-get dist-upgrade -y
    apt-get autoremove -y
    print_message "System updated successfully" "$GREEN"
}

# Install essential packages
install_essentials() {
    print_message "Installing essential packages..." "$YELLOW"
    apt-get install -y \
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
        make \
        gcc \
        g++ \
        python3 \
        python3-pip \
        zip \
        unzip
    
    print_message "Essential packages installed" "$GREEN"
}

# Install Docker
install_docker() {
    print_message "Installing Docker..." "$YELLOW"
    
    # Remove old versions
    apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Set up the stable repository
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Install docker-compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Start and enable Docker
    systemctl start docker
    systemctl enable docker
    
    print_message "Docker installed successfully" "$GREEN"
    docker --version
    docker-compose --version
}

# Setup firewall
setup_firewall() {
    print_message "Configuring firewall..." "$YELLOW"
    
    # Reset UFW
    ufw --force reset
    
    # Default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH
    ufw allow $SSH_PORT/tcp comment 'SSH'
    
    # Allow HTTP and HTTPS
    ufw allow 80/tcp comment 'HTTP'
    ufw allow 443/tcp comment 'HTTPS'
    
    # Allow Docker
    ufw allow 2375/tcp comment 'Docker'
    ufw allow 2376/tcp comment 'Docker SSL'
    
    # Enable UFW
    ufw --force enable
    
    print_message "Firewall configured successfully" "$GREEN"
    ufw status verbose
}

# Setup fail2ban
setup_fail2ban() {
    print_message "Configuring fail2ban..." "$YELLOW"
    
    # Create jail.local
    cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
destemail = $EMAIL
sendername = Fail2ban
action = %(action_mwl)s

[sshd]
enabled = true
port = $SSH_PORT
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-noscript]
enabled = true
port = http,https
filter = nginx-noscript
logpath = /var/log/nginx/access.log
maxretry = 6

[nginx-badbots]
enabled = true
port = http,https
filter = nginx-badbots
logpath = /var/log/nginx/access.log
maxretry = 2

[nginx-noproxy]
enabled = true
port = http,https
filter = nginx-noproxy
logpath = /var/log/nginx/error.log
maxretry = 2
EOF
    
    # Restart fail2ban
    systemctl restart fail2ban
    systemctl enable fail2ban
    
    print_message "Fail2ban configured successfully" "$GREEN"
}

# Create application user
create_app_user() {
    print_message "Creating application user..." "$YELLOW"
    
    # Create user
    if ! id -u $USERNAME >/dev/null 2>&1; then
        useradd -m -s /bin/bash $USERNAME
        usermod -aG docker $USERNAME
        print_message "User $USERNAME created" "$GREEN"
    else
        print_message "User $USERNAME already exists" "$YELLOW"
    fi
    
    # Setup sudo access
    echo "$USERNAME ALL=(ALL) NOPASSWD: /usr/bin/docker, /usr/bin/docker-compose, /usr/local/bin/docker-compose" > /etc/sudoers.d/$USERNAME
    
    # Create directories
    mkdir -p /home/$USERNAME/app
    mkdir -p /var/backups/halal_hall
    mkdir -p /var/log/halal_hall
    
    # Set permissions
    chown -R $USERNAME:$USERNAME /home/$USERNAME/app
    chown -R $USERNAME:$USERNAME /var/backups/halal_hall
    chown -R $USERNAME:$USERNAME /var/log/halal_hall
    
    print_message "Application user configured" "$GREEN"
}

# Setup swap
setup_swap() {
    print_message "Setting up swap space..." "$YELLOW"
    
    # Check if swap exists
    if [ $(swapon -s | wc -l) -gt 1 ]; then
        print_message "Swap already configured" "$YELLOW"
    else
        # Create 2GB swap file
        fallocate -l 2G /swapfile
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        
        # Make permanent
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
        
        # Configure swappiness
        echo 'vm.swappiness=10' >> /etc/sysctl.conf
        sysctl -p
        
        print_message "Swap space configured (2GB)" "$GREEN"
    fi
}

# Setup automatic security updates
setup_auto_updates() {
    print_message "Configuring automatic security updates..." "$YELLOW"
    
    apt-get install -y unattended-upgrades apt-listchanges
    
    # Configure unattended-upgrades
    cat > /etc/apt/apt.conf.d/50unattended-upgrades <<EOF
Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}-security";
    "\${distro_id}ESMApps:\${distro_codename}-apps-security";
    "\${distro_id}ESM:\${distro_codename}-infra-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Mail "$EMAIL";
EOF
    
    # Enable automatic updates
    cat > /etc/apt/apt.conf.d/20auto-upgrades <<EOF
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";
EOF
    
    print_message "Automatic security updates configured" "$GREEN"
}

# Setup monitoring
setup_monitoring() {
    print_message "Setting up monitoring..." "$YELLOW"
    
    # Install netdata for system monitoring
    bash <(curl -Ss https://my-netdata.io/kickstart.sh) --dont-wait --stable-channel
    
    # Configure netdata
    systemctl enable netdata
    systemctl start netdata
    
    print_message "Monitoring setup completed" "$GREEN"
    print_message "Netdata dashboard available at: http://$DOMAIN:19999" "$BLUE"
}

# Setup backup cron
setup_backup_cron() {
    print_message "Setting up automatic backups..." "$YELLOW"
    
    # Create backup script
    cat > /home/$USERNAME/backup.sh <<'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/halal_hall"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/var/log/halal_hall/backup.log"

# Backup database
echo "[$(date)] Starting backup..." >> $LOG_FILE
docker exec halal_hall_db pg_dump -U postgres restaurant_menu | gzip > "${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql.gz"

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

# Upload to remote storage (optional)
# Add your cloud storage upload command here
# Example: aws s3 cp "${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql.gz" s3://your-bucket/backups/

echo "[$(date)] Backup completed: db_backup_${TIMESTAMP}.sql.gz" >> $LOG_FILE
EOF
    
    chmod +x /home/$USERNAME/backup.sh
    chown $USERNAME:$USERNAME /home/$USERNAME/backup.sh
    
    # Add to crontab (daily at 2 AM)
    (crontab -u $USERNAME -l 2>/dev/null; echo "0 2 * * * /home/$USERNAME/backup.sh") | crontab -u $USERNAME -
    
    print_message "Automatic backup configured (daily at 2 AM)" "$GREEN"
}

# Clone repository
clone_repository() {
    print_message "Cloning application repository..." "$YELLOW"
    
    cd /home/$USERNAME/app
    
    # Clone your repository (update with your actual repo URL)
    # git clone https://github.com/yourusername/halal-hall-menu.git .
    
    print_message "Please manually clone your repository to /home/$USERNAME/app" "$YELLOW"
    print_message "Run: git clone <your-repo-url> /home/$USERNAME/app" "$BLUE"
}

# Generate SSL certificate
generate_ssl() {
    print_message "Generating SSL certificate..." "$YELLOW"
    
    # Install certbot
    apt-get install -y certbot
    
    # Create directory for certificates
    mkdir -p /home/$USERNAME/app/nginx/ssl
    
    print_message "SSL setup prepared. Run the following after deployment:" "$YELLOW"
    print_message "certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos" "$BLUE"
}

# Print summary
print_summary() {
    print_message "\n========================================" "$GREEN"
    print_message "VPS Setup Completed Successfully!" "$GREEN"
    print_message "========================================\n" "$GREEN"
    
    print_message "Next Steps:" "$BLUE"
    echo "1. Clone your repository to /home/$USERNAME/app"
    echo "2. Copy .env.production.example to .env.production and configure"
    echo "3. Run deployment: cd /home/$USERNAME/app && ./scripts/deploy.sh production"
    echo "4. Generate SSL certificate: ./scripts/manage.sh ssl generate $DOMAIN"
    echo ""
    
    print_message "Access Information:" "$YELLOW"
    echo "Application User: $USERNAME"
    echo "Application Directory: /home/$USERNAME/app"
    echo "Backup Directory: /var/backups/halal_hall"
    echo "Log Directory: /var/log/halal_hall"
    echo ""
    
    print_message "Services:" "$YELLOW"
    echo "Docker: systemctl status docker"
    echo "Fail2ban: systemctl status fail2ban"
    echo "UFW Firewall: ufw status"
    echo "Netdata: http://$DOMAIN:19999"
    echo ""
    
    print_message "Security Notes:" "$RED"
    echo "- Change default passwords in .env.production"
    echo "- Set up SSH key authentication"
    echo "- Disable root SSH login"
    echo "- Configure SSL certificate"
    echo "- Review firewall rules"
}

# Main execution
main() {
    check_root
    get_user_input
    
    print_message "Starting VPS setup..." "$BLUE"
    
    update_system
    install_essentials
    install_docker
    setup_firewall
    setup_fail2ban
    create_app_user
    setup_swap
    setup_auto_updates
    setup_monitoring
    setup_backup_cron
    generate_ssl
    
    print_summary
}

# Run main function
main
