# Скрипт для деплоя фронтенда на VPS
$VPS_IP = "194.32.142.53"
$VPS_USER = "ubuntu"

Write-Host "🚀 Деплой фронтенда на VPS..." -ForegroundColor Green
Write-Host ""

# Шаг 1: Сборка
Write-Host "📦 Сборка фронтенда..." -ForegroundColor Yellow
cd frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка при сборке" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Сборка завершена" -ForegroundColor Green
Write-Host ""

# Шаг 2: Загрузка во временную папку
Write-Host "📤 Загрузка файлов на сервер..." -ForegroundColor Yellow
scp -r dist ${VPS_USER}@${VPS_IP}:~/halalhall-frontend-new
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка при загрузке файлов" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Файлы загружены" -ForegroundColor Green
Write-Host ""

# Шаг 3: Инструкции для перемещения файлов на сервере
Write-Host "📋 Теперь выполните на сервере следующие команды:" -ForegroundColor Cyan
Write-Host ""
Write-Host "ssh ${VPS_USER}@${VPS_IP}" -ForegroundColor White
Write-Host ""
Write-Host "sudo rm -rf /var/www/halalhall/*" -ForegroundColor White
Write-Host "sudo cp -r ~/halalhall-frontend-new/dist/* /var/www/halalhall/" -ForegroundColor White
Write-Host "sudo chown -R www-data:www-data /var/www/halalhall/" -ForegroundColor White
Write-Host "rm -rf ~/halalhall-frontend-new" -ForegroundColor White
Write-Host ""
Write-Host "Или одной командой:" -ForegroundColor Cyan
Write-Host ""
Write-Host 'ssh ubuntu@194.32.142.53 "sudo rm -rf /var/www/halalhall/* && sudo cp -r ~/halalhall-frontend-new/dist/* /var/www/halalhall/ && sudo chown -R www-data:www-data /var/www/halalhall/ && rm -rf ~/halalhall-frontend-new"' -ForegroundColor White
Write-Host ""
Write-Host "✅ После этого проверьте сайт: http://194.32.142.53/" -ForegroundColor Green
Write-Host ""
