# Простой скрипт для запуска миграций на VPS
$VPS_IP = "194.32.142.53"
$VPS_USER = "ubuntu"

Write-Host "🚀 Запуск миграций на VPS..." -ForegroundColor Green
Write-Host ""

# Загружаем миграционные скрипты
Write-Host "📤 Загрузка миграционных скриптов..." -ForegroundColor Yellow
scp backend/migrations/add-bar-pizza-categories.js ${VPS_USER}@${VPS_IP}:/opt/halalhall-backend/migrations/
scp backend/migrations/add-bar-drinks.js ${VPS_USER}@${VPS_IP}:/opt/halalhall-backend/migrations/

Write-Host ""
Write-Host "✅ Файлы загружены" -ForegroundColor Green
Write-Host ""

# Запускаем миграции
Write-Host "🔄 Запуск миграций на сервере..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Выполните следующие команды на сервере:" -ForegroundColor Cyan
Write-Host ""
Write-Host "ssh ${VPS_USER}@${VPS_IP}" -ForegroundColor White
Write-Host ""
Write-Host "cd /opt/halalhall-backend" -ForegroundColor White
Write-Host "npm run add-bar-pizza" -ForegroundColor White
Write-Host "npm run add-bar-drinks" -ForegroundColor White
Write-Host "pm2 restart halalhall-api" -ForegroundColor White
Write-Host ""
Write-Host "Или выполните всё одной командой:" -ForegroundColor Cyan
Write-Host ""
Write-Host 'ssh ubuntu@194.32.142.53 "cd /opt/halalhall-backend && npm run add-bar-pizza && npm run add-bar-drinks && pm2 restart halalhall-api"' -ForegroundColor White
Write-Host ""
