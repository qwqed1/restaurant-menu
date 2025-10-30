# Скрипт для запуска миграций на VPS
# Использование: .\run-migrations-on-vps.ps1

$VPS_IP = "194.32.142.53"
$VPS_USER = "ubuntu"
$BACKEND_PATH = "/opt/halalhall-backend"

Write-Host "🚀 Запуск миграций на VPS..." -ForegroundColor Green
Write-Host ""

# Проверяем подключение
Write-Host "📡 Проверка подключения к VPS..." -ForegroundColor Yellow
$testConnection = ssh -o ConnectTimeout=5 ${VPS_USER}@${VPS_IP} "echo 'OK'"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Не удалось подключиться к VPS" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Подключение установлено" -ForegroundColor Green
Write-Host ""

# Загружаем миграционные скрипты на сервер
Write-Host "📤 Загрузка миграционных скриптов на VPS..." -ForegroundColor Yellow
scp backend/migrations/add-bar-pizza-categories.js ${VPS_USER}@${VPS_IP}:${BACKEND_PATH}/migrations/
scp backend/migrations/add-bar-drinks.js ${VPS_USER}@${VPS_IP}:${BACKEND_PATH}/migrations/

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка при загрузке файлов" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Файлы загружены" -ForegroundColor Green
Write-Host ""

# Запускаем миграции на сервере
Write-Host "🔄 Запуск миграций на сервере..." -ForegroundColor Yellow
Write-Host ""

# 1. Добавление категорий Бар и Пицца
Write-Host "1️⃣ Добавление категорий 'Бар' и 'Пицца'..." -ForegroundColor Cyan
ssh ${VPS_USER}@${VPS_IP} 'cd /opt/halalhall-backend && npm run add-bar-pizza'
Write-Host ""

# 2. Добавление напитков для бара
Write-Host "2️⃣ Добавление напитков для бара..." -ForegroundColor Cyan
ssh ${VPS_USER}@${VPS_IP} 'cd /opt/halalhall-backend && npm run add-bar-drinks'
Write-Host ""

# Проверяем результат
Write-Host "📊 Проверка результата..." -ForegroundColor Yellow
ssh ${VPS_USER}@${VPS_IP} 'cd /opt/halalhall-backend && node -e "import pool from ''./config/database.js''; const categories = await pool.query(''SELECT id, name_ru, display_order FROM categories ORDER BY display_order''); console.log(''\n📋 Категории:''); categories.rows.forEach(cat => console.log(cat)); const dishes = await pool.query(''SELECT COUNT(*) as count FROM dishes''); console.log(''\nВсего блюд:'', dishes.rows[0].count); await pool.end(); process.exit(0);"'

Write-Host ""
Write-Host "✅ Миграции выполнены!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Следующие шаги:" -ForegroundColor Yellow
Write-Host "   1. Проверьте сайт: http://194.32.142.53/" -ForegroundColor White
Write-Host "   2. Проверьте админ-панель: http://194.32.142.53/admin/login" -ForegroundColor White
Write-Host "   3. Если нужно перезапустить backend: ssh ${VPS_USER}@${VPS_IP} 'pm2 restart halalhall-api'" -ForegroundColor White
Write-Host ""
