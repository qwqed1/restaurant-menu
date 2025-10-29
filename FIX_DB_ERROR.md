# Исправление ошибки базы данных PostgreSQL

## Диагностика

Выполните эти команды на сервере, чтобы понять причину:

```bash
# 1. Посмотрите логи базы данных
docker-compose -f docker-compose.prod.yml logs postgres

# 2. Проверьте статус контейнера
docker ps -a | grep halal_hall_db

# 3. Попробуйте запустить контейнер отдельно
docker start halal_hall_db

# 4. Посмотрите детальные логи
docker logs halal_hall_db
```

## Возможные причины и решения

### Причина 1: Неправильный пароль в .env.production

Проверьте файл `.env.production`:

```bash
cat .env.production
```

Убедитесь, что `DB_PASSWORD` установлен. Если пароль пустой или неправильный:

```bash
nano .env.production
# Установите DB_PASSWORD=YourSecurePassword123
```

### Причина 2: Старые данные в volume

Если база уже была создана с другим паролем, нужно удалить volume:

```bash
# ВНИМАНИЕ: Это удалит все данные в базе!
docker-compose -f docker-compose.prod.yml down -v
docker volume rm restaurant-menu_postgres_data

# Затем запустите заново
docker-compose -f docker-compose.prod.yml up -d
```

### Причина 3: Недостаточно прав на файл init-database.sql

```bash
# Проверьте, существует ли файл
ls -la backend/init-database.sql

# Если файла нет, создайте его
cat > backend/init-database.sql << 'EOF'
-- Initialize database
CREATE DATABASE IF NOT EXISTS restaurant_menu;
EOF

# Дайте права на чтение
chmod 644 backend/init-database.sql
```

### Причина 4: Порт 5432 уже занят

```bash
# Проверьте, не занят ли порт
sudo netstat -tulpn | grep 5432

# Или
sudo lsof -i :5432

# Если порт занят другим PostgreSQL, остановите его
sudo systemctl stop postgresql
```

## Быстрое решение (чистая установка)

Если ничего не помогает, выполните полную переустановку:

```bash
# 1. Остановите все контейнеры
docker-compose -f docker-compose.prod.yml down

# 2. Удалите все volumes (УДАЛИТ ВСЕ ДАННЫЕ!)
docker-compose -f docker-compose.prod.yml down -v

# 3. Удалите старые образы
docker rmi restaurant-menu-backend restaurant-menu-frontend

# 4. Проверьте .env.production
cat > .env.production << 'EOF'
DB_HOST=postgres
DB_PORT=5432
DB_NAME=restaurant_menu
DB_USER=postgres
DB_PASSWORD=SecurePassword123

NODE_ENV=production
PORT=3001
SERVER_HOST=0.0.0.0

JWT_SECRET=RandomSecretKey123456789
CORS_ORIGIN=http://localhost

ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
EOF

# 5. Пересоберите и запустите
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# 6. Следите за логами
docker-compose -f docker-compose.prod.yml logs -f
```

## Проверка после запуска

```bash
# Проверьте статус всех контейнеров
docker-compose -f docker-compose.prod.yml ps

# Все контейнеры должны быть "Up" и "healthy"

# Проверьте подключение к базе
docker exec -it halal_hall_db psql -U postgres -d restaurant_menu -c "\dt"
```

## Инициализация базы данных

После успешного запуска:

```bash
# Войдите в backend контейнер
docker exec -it halal_hall_backend sh

# Запустите инициализацию
npm run init-postgres

# Выйдите
exit
```
