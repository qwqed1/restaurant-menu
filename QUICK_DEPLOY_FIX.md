# Быстрое исправление деплоя

## Проблема
Docker Compose не может запустить контейнеры из-за отсутствия файла `.env.production`

## Решение

### 1. Создайте файл .env.production на сервере

```bash
cd /home/halalhall/app/restaurant-menu

# Создайте файл .env.production
cat > .env.production << 'EOF'
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=restaurant_menu
DB_USER=postgres
DB_PASSWORD=HalalHall2025SecurePass

# Server Configuration  
NODE_ENV=production
PORT=3001
SERVER_HOST=0.0.0.0

# Security
JWT_SECRET=HalalHall_JWT_Secret_Key_Change_This_Random_String_2025
CORS_ORIGIN=http://your-server-ip

# Admin Credentials (смените после первого входа)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
EOF
```

### 2. Обновите docker-compose.prod.yml на сервере

Файл уже исправлен локально (удален устаревший `version: '3.8'`). Загрузите обновленный файл на сервер.

### 3. Запустите контейнеры

```bash
cd /home/halalhall/app/restaurant-menu

# Запустите контейнеры
docker-compose -f docker-compose.prod.yml up -d

# Проверьте статус
docker-compose -f docker-compose.prod.yml ps

# Посмотрите логи
docker-compose -f docker-compose.prod.yml logs -f
```

### 4. Инициализация базы данных

После первого запуска нужно инициализировать базу данных:

```bash
# Войдите в контейнер backend
docker exec -it halal_hall_backend sh

# Запустите инициализацию БД
npm run init-postgres

# Выйдите из контейнера
exit
```

### 5. Проверка работы

```bash
# Проверьте, что все контейнеры запущены
docker-compose -f docker-compose.prod.yml ps

# Проверьте логи backend
docker-compose -f docker-compose.prod.yml logs backend

# Проверьте логи frontend
docker-compose -f docker-compose.prod.yml logs frontend

# Проверьте логи nginx
docker-compose -f docker-compose.prod.yml logs nginx
```

## Важные замечания

1. **Смените пароли** в `.env.production`:
   - `DB_PASSWORD` - пароль базы данных
   - `JWT_SECRET` - секретный ключ для JWT токенов
   - `ADMIN_PASSWORD` - пароль администратора (можно сменить через админ-панель)

2. **Обновите CORS_ORIGIN**:
   - Замените `http://your-server-ip` на реальный IP или домен вашего сервера

3. **SSL сертификаты** (опционально):
   - Если у вас есть домен, настройте SSL с Let's Encrypt
   - Обновите nginx конфигурацию для HTTPS

## Полезные команды

```bash
# Остановить все контейнеры
docker-compose -f docker-compose.prod.yml down

# Пересобрать и запустить
docker-compose -f docker-compose.prod.yml up -d --build

# Посмотреть логи конкретного сервиса
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f postgres
docker-compose -f docker-compose.prod.yml logs -f nginx

# Перезапустить конкретный сервис
docker-compose -f docker-compose.prod.yml restart backend

# Удалить все (включая volumes)
docker-compose -f docker-compose.prod.yml down -v
```
