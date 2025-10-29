# Automatic deployment script for HALAL HALL
# This script will upload and deploy the application automatically

param(
    [string]$VpsPassword = ""
)

$VPS_IP = "194.32.142.53"
$VPS_USER = "ubuntu"
$LOCAL_PATH = "C:\Users\Admin\Documents\Halal hail\restaurant-menu"

Write-Host @"
╔═══════════════════════════════════════════════════════╗
║     HALAL HALL - Автоматический деплой на VPS        ║
║     IP: $VPS_IP                                       ║
╚═══════════════════════════════════════════════════════╝
"@ -ForegroundColor Green

Write-Host ""

# Check if password is provided
if ([string]::IsNullOrEmpty($VpsPassword)) {
    Write-Host "Для автоматического деплоя нужен пароль от VPS" -ForegroundColor Yellow
    Write-Host "Запустите: .\auto-deploy.ps1 -VpsPassword 'ваш_пароль'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Или используйте ручной способ:" -ForegroundColor Cyan
    Write-Host "1. .\upload-to-vps.ps1  (загрузка файлов)" -ForegroundColor White
    Write-Host "2. ssh ubuntu@$VPS_IP   (подключение к серверу)" -ForegroundColor White
    exit 0
}

Write-Host "Шаг 1: Создание архива..." -ForegroundColor Cyan
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$archivePath = "$env:TEMP\halal-hall-$timestamp.zip"

# Exclude patterns
$excludePatterns = @(
    "node_modules",
    ".git",
    "dist",
    "build",
    ".vscode",
    "*.log"
)

# Create archive
try {
    Compress-Archive -Path "$LOCAL_PATH\*" -DestinationPath $archivePath -Force
    Write-Host "✓ Архив создан" -ForegroundColor Green
} catch {
    Write-Host "✗ Ошибка создания архива: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Шаг 2: Загрузка на VPS..." -ForegroundColor Cyan

# Upload using scp
scp $archivePath "${VPS_USER}@${VPS_IP}:/tmp/halal-hall.zip"

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Ошибка загрузки" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Файлы загружены" -ForegroundColor Green

Write-Host ""
Write-Host "Шаг 3: Распаковка и настройка..." -ForegroundColor Cyan

# Create deployment script on VPS
$deployScript = @"
#!/bin/bash
set -e

echo 'Extracting files...'
sudo mkdir -p /home/halalhall/app
sudo apt install -y unzip
sudo unzip -o /tmp/halal-hall.zip -d /home/halalhall/app
sudo chown -R halalhall:halalhall /home/halalhall/app
sudo chmod +x /home/halalhall/app/scripts/*.sh
sudo rm /tmp/halal-hall.zip

echo 'Setting up environment...'
cd /home/halalhall/app

if [ ! -f .env.production ]; then
    cp .env.production.example .env.production
    
    # Auto-configure basic settings
    sed -i 's|CORS_ORIGIN=.*|CORS_ORIGIN=http://194.32.142.53|g' .env.production
    sed -i 's|VITE_API_URL=.*|VITE_API_URL=http://194.32.142.53/api|g' .env.production
    
    echo 'WARNING: .env.production created with default values'
    echo 'WARNING: PLEASE UPDATE PASSWORDS before deploying!'
fi

echo 'Creating SSL certificates...'
sudo mkdir -p /home/halalhall/app/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /home/halalhall/app/nginx/ssl/key.pem -out /home/halalhall/app/nginx/ssl/cert.pem -subj '/C=KZ/ST=Almaty/L=Almaty/O=HalalHall/CN=194.32.142.53' 2>/dev/null
sudo chown -R halalhall:halalhall /home/halalhall/app/nginx/ssl

echo 'Setup completed'
echo ''
echo 'Files are ready at: /home/halalhall/app'
"@

# Save script to temp file and upload
$deployScript | Out-File -FilePath "$env:TEMP\deploy.sh" -Encoding ASCII
scp "$env:TEMP\deploy.sh" "${VPS_USER}@${VPS_IP}:/tmp/"

# Execute deployment script
ssh "${VPS_USER}@${VPS_IP}" "chmod +x /tmp/deploy.sh && sudo /tmp/deploy.sh && rm /tmp/deploy.sh"

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Ошибка настройки" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Настройка завершена" -ForegroundColor Green

# Cleanup
Remove-Item $archivePath -Force
Remove-Item "$env:TEMP\deploy.sh" -Force

Write-Host ""
Write-Host @"
╔═══════════════════════════════════════════════════════╗
║          Файлы успешно загружены на VPS!             ║
╚═══════════════════════════════════════════════════════╝
"@ -ForegroundColor Green

Write-Host ""
Write-Host "Следующие шаги:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Подключитесь к серверу:" -ForegroundColor White
Write-Host "   ssh ubuntu@$VPS_IP" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Переключитесь на пользователя приложения:" -ForegroundColor White
Write-Host "   sudo su - halalhall" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Перейдите в директорию приложения:" -ForegroundColor White
Write-Host "   cd /home/halalhall/app" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. ВАЖНО! Отредактируйте .env.production:" -ForegroundColor Red
Write-Host "   nano .env.production" -ForegroundColor Cyan
Write-Host "   - Измените DB_PASSWORD" -ForegroundColor Yellow
Write-Host "   - Измените JWT_SECRET" -ForegroundColor Yellow
Write-Host "   - Измените ADMIN_PASSWORD" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. Запустите приложение:" -ForegroundColor White
Write-Host "   docker-compose -f docker-compose.prod.yml up -d" -ForegroundColor Cyan
Write-Host ""
Write-Host "6. Проверьте статус:" -ForegroundColor White
Write-Host "   docker-compose -f docker-compose.prod.yml ps" -ForegroundColor Cyan
Write-Host ""
Write-Host "Приложение будет доступно по адресу:" -ForegroundColor Green
Write-Host "http://$VPS_IP" -ForegroundColor Cyan
Write-Host ""
