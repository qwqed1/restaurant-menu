# 📚 Руководство по развертыванию HALAL HALL на VPS

## 📋 Содержание
1. [Требования](#требования)
2. [Быстрый старт](#быстрый-старт)
3. [Детальная установка](#детальная-установка)
4. [Управление приложением](#управление-приложением)
5. [Резервное копирование](#резервное-копирование)
6. [Мониторинг и логи](#мониторинг-и-логи)
7. [Обновление](#обновление)
8. [Устранение неполадок](#устранение-неполадок)
9. [Безопасность](#безопасность)

## 📦 Требования

### Минимальные требования к VPS:
- **ОС**: Ubuntu 20.04/22.04 или Debian 11/12
- **CPU**: 2 vCPU
- **RAM**: 2 GB (рекомендуется 4 GB)
- **Диск**: 20 GB SSD
- **Сеть**: Публичный IP адрес

### Необходимое ПО:
- Docker 20.10+
- Docker Compose 2.0+
- Git
- PostgreSQL 15 (в Docker)
- Nginx (в Docker)

## 🚀 Быстрый старт

### 1. Подключение к VPS
```bash
ssh root@your-vps-ip
```

### 2. Запуск автоматической установки
```bash
# Скачать и запустить скрипт установки
wget https://raw.githubusercontent.com/your-repo/halal-hall/main/scripts/setup-vps.sh
chmod +x setup-vps.sh
./setup-vps.sh
```

### 3. Клонирование репозитория
```bash
cd /home/halalhall/app
git clone https://github.com/your-repo/halal-hall.git .
```

### 4. Настройка переменных окружения
```bash
cp .env.production.example .env.production
nano .env.production
```

### 5. Запуск приложения
```bash
./scripts/deploy.sh production
```

## 📝 Детальная установка

### Шаг 1: Подготовка VPS

#### Обновление системы
```bash
apt update && apt upgrade -y
apt install -y curl wget git vim
```

#### Создание пользователя
```bash
adduser halalhall
usermod -aG sudo halalhall
su - halalhall
```

### Шаг 2: Установка Docker

```bash
# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Проверка установки
docker --version
docker-compose --version
```

### Шаг 3: Настройка файрвола

```bash
# Установка UFW
sudo apt install -y ufw

# Настройка правил
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Шаг 4: Клонирование проекта

```bash
# Создание директории
mkdir -p /home/halalhall/app
cd /home/halalhall/app

# Клонирование репозитория
git clone https://github.com/your-repo/halal-hall.git .

# Установка прав на скрипты
chmod +x scripts/*.sh
```

### Шаг 5: Конфигурация приложения

#### Создание файла переменных окружения
```bash
cp .env.production.example .env.production
```

#### Редактирование конфигурации
```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=restaurant_menu
DB_USER=postgres
DB_PASSWORD=your_secure_password_here

# Server
NODE_ENV=production
PORT=3001
SERVER_HOST=0.0.0.0

# Security
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=https://your-domain.com

# Frontend
VITE_API_URL=https://your-domain.com/api
VITE_USE_API=true

# Admin (измените после первого входа)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### Шаг 6: Создание SSL сертификата

#### Вариант 1: Let's Encrypt (бесплатный)
```bash
# Установка certbot
sudo apt install -y certbot

# Генерация сертификата
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Копирование сертификатов
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./nginx/ssl/key.pem
```

#### Вариант 2: Самоподписанный сертификат (для тестирования)
```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem
```

### Шаг 7: Запуск приложения

```bash
# Сборка и запуск контейнеров
docker-compose -f docker-compose.prod.yml up -d --build

# Проверка статуса
docker-compose -f docker-compose.prod.yml ps

# Просмотр логов
docker-compose -f docker-compose.prod.yml logs -f
```

### Шаг 8: Инициализация базы данных

```bash
# База данных инициализируется автоматически при первом запуске
# Проверка подключения к БД
docker exec halal_hall_backend node -e "console.log('DB connection test')"
```

## 🛠 Управление приложением

### Основные команды

```bash
# Запуск приложения
./scripts/manage.sh start

# Остановка приложения
./scripts/manage.sh stop

# Перезапуск приложения
./scripts/manage.sh restart

# Просмотр статуса
./scripts/manage.sh status

# Просмотр логов
./scripts/manage.sh logs          # Все сервисы
./scripts/manage.sh logs backend  # Только backend
./scripts/manage.sh logs nginx    # Только nginx
```

### Docker команды

```bash
# Список контейнеров
docker ps

# Вход в контейнер
docker exec -it halal_hall_backend bash
docker exec -it halal_hall_db psql -U postgres restaurant_menu

# Перезапуск контейнера
docker restart halal_hall_backend

# Просмотр логов контейнера
docker logs halal_hall_backend --tail 100 -f
```

## 💾 Резервное копирование

### Ручное резервное копирование

```bash
# Создание резервной копии БД
./scripts/manage.sh backup

# Восстановление из резервной копии
./scripts/manage.sh restore /var/backups/halal_hall/db_backup_20240101_120000.sql.gz
```

### Автоматическое резервное копирование

Автоматическое резервное копирование настроено через cron (ежедневно в 2:00):

```bash
# Просмотр расписания
crontab -l

# Редактирование расписания
crontab -e

# Пример записи в crontab
0 2 * * * /home/halalhall/app/scripts/backup.sh
```

### Загрузка в облако (опционально)

Добавьте в `/home/halalhall/backup.sh`:

```bash
# AWS S3
aws s3 cp "${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql.gz" s3://your-bucket/backups/

# Google Cloud Storage
gsutil cp "${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql.gz" gs://your-bucket/backups/

# Яндекс.Облако
yc storage cp "${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql.gz" s3://your-bucket/backups/
```

## 📊 Мониторинг и логи

### Просмотр логов

```bash
# Логи приложения
tail -f /var/log/halal_hall/app.log

# Логи nginx
docker logs halal_hall_nginx --tail 100 -f

# Логи базы данных
docker logs halal_hall_db --tail 100 -f

# Системные логи
journalctl -u docker -f
```

### Мониторинг ресурсов

```bash
# Использование ресурсов контейнерами
docker stats

# Системные ресурсы
htop

# Место на диске
df -h

# Использование памяти
free -h
```

### Netdata мониторинг

После установки доступен по адресу: `http://your-vps-ip:19999`

## 🔄 Обновление

### Обновление приложения

```bash
# Остановка приложения
./scripts/manage.sh stop

# Создание резервной копии
./scripts/manage.sh backup

# Получение обновлений
git pull origin main

# Пересборка и запуск
./scripts/deploy.sh production

# Проверка
./scripts/manage.sh status
```

### Обновление зависимостей

```bash
# Обновление npm пакетов
cd backend
npm update
cd ../
npm update

# Пересборка контейнеров
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Устранение неполадок

### Проблемы с контейнерами

```bash
# Проверка состояния контейнеров
docker ps -a

# Перезапуск проблемного контейнера
docker restart halal_hall_backend

# Пересоздание контейнера
docker-compose -f docker-compose.prod.yml up -d --force-recreate backend

# Очистка неиспользуемых ресурсов
docker system prune -a
```

### Проблемы с базой данных

```bash
# Проверка подключения к БД
docker exec halal_hall_backend node -e "
  const pool = require('./config/database.js');
  pool.query('SELECT NOW()').then(console.log).catch(console.error);
"

# Вход в БД
docker exec -it halal_hall_db psql -U postgres restaurant_menu

# Проверка таблиц
\dt

# Выход
\q
```

### Проблемы с Nginx

```bash
# Проверка конфигурации
docker exec halal_hall_nginx nginx -t

# Перезагрузка конфигурации
docker exec halal_hall_nginx nginx -s reload

# Просмотр логов ошибок
docker exec halal_hall_nginx cat /var/log/nginx/error.log
```

### Недостаток памяти

```bash
# Добавление swap файла
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Постоянное подключение swap
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 🔒 Безопасность

### Основные рекомендации

1. **Измените пароли по умолчанию**
   ```bash
   # В файле .env.production
   DB_PASSWORD=новый_сложный_пароль
   JWT_SECRET=новый_секретный_ключ
   ```

2. **Настройте SSH ключи**
   ```bash
   ssh-keygen -t ed25519 -C "your-email@example.com"
   ssh-copy-id halalhall@your-vps-ip
   ```

3. **Отключите вход по паролю SSH**
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Установите: PasswordAuthentication no
   sudo systemctl restart sshd
   ```

4. **Регулярно обновляйте систему**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

5. **Настройте fail2ban**
   ```bash
   sudo apt install fail2ban
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

### SSL/TLS настройки

Убедитесь, что в `nginx/nginx.prod.conf` включены современные протоколы:
- TLS 1.2+
- HSTS headers
- Secure ciphers

### Резервные копии

- Храните резервные копии в разных местах
- Шифруйте резервные копии перед отправкой в облако
- Регулярно тестируйте восстановление

## 📞 Поддержка

### Логи для диагностики

При возникновении проблем соберите:
```bash
# Создание архива с логами
mkdir -p /tmp/halal_hall_logs
docker-compose -f docker-compose.prod.yml logs > /tmp/halal_hall_logs/docker.log
cp /var/log/halal_hall/* /tmp/halal_hall_logs/
tar -czf halal_hall_logs.tar.gz -C /tmp halal_hall_logs
```

### Проверка здоровья системы

```bash
# Проверка API
curl -I http://localhost/api/health

# Проверка frontend
curl -I http://localhost/

# Проверка БД
docker exec halal_hall_db pg_isready -U postgres
```

## 📝 Чеклист после установки

- [ ] Изменены пароли по умолчанию
- [ ] Настроен SSL сертификат
- [ ] Настроен файрвол (UFW)
- [ ] Настроен fail2ban
- [ ] Настроены SSH ключи
- [ ] Отключен вход root по SSH
- [ ] Настроено резервное копирование
- [ ] Проверена работа приложения
- [ ] Настроен мониторинг
- [ ] Созданы учетные записи администраторов

## 🎉 Готово!

Ваше приложение HALAL HALL теперь работает на VPS!

- **Frontend**: https://your-domain.com
- **API**: https://your-domain.com/api
- **Admin Panel**: https://your-domain.com/admin
- **Monitoring**: http://your-vps-ip:19999

---

*Документация обновлена: Январь 2024*
