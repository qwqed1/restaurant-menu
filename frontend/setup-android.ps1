Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Установка Capacitor для Android APK" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

try {
    Write-Host "[1/5] Установка зависимостей..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) { throw "Ошибка при установке зависимостей!" }
    
    Write-Host ""
    Write-Host "[2/5] Сборка приложения..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Ошибка при сборке приложения!" }
    
    Write-Host ""
    Write-Host "[3/5] Добавление Android платформы..." -ForegroundColor Yellow
    npx cap add android
    # Игнорируем ошибку если платформа уже добавлена
    
    Write-Host ""
    Write-Host "[4/5] Синхронизация файлов..." -ForegroundColor Yellow
    npx cap sync
    if ($LASTEXITCODE -ne 0) { throw "Ошибка при синхронизации!" }
    
    Write-Host ""
    Write-Host "[5/5] Готово!" -ForegroundColor Green
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "  Установка завершена успешно!" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Теперь вы можете:" -ForegroundColor Cyan
    Write-Host "1. Открыть проект в Android Studio: " -NoNewline
    Write-Host "npx cap open android" -ForegroundColor White
    Write-Host "2. Или собрать APK командой: " -NoNewline
    Write-Host "cd android && .\gradlew assembleDebug" -ForegroundColor White
    Write-Host ""
}
catch {
    Write-Host ""
    Write-Host "ОШИБКА: $_" -ForegroundColor Red
    Write-Host ""
}

Write-Host "Нажмите любую клавишу для выхода..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
