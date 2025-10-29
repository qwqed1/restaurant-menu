# 🚀 Инструкция по развертыванию HALAL HALL на VPS

## 📋 Информация о сервере

- **IP**: 194.32.142.53
- **IPv6**: 2a00:5da0:1000:1::2b46
- **ОС**: Ubuntu 24.04 LTS
- **Ресурсы**: 1 CPU / 1 GB RAM / 20 GB диск
- **Регион**: Алматы, Казахстан

## 🔐 Шаг 1: Подключение к серверу

### Из Windows (PowerShell):
```powershell
ssh ubuntu@194.32.142.53
# Введите пароль когда попросит
```

### Получение root-прав:
```bash
sudo -i
```

## 🛠 Шаг 2: Первоначальная настройка сервера

Выполните команды по очереди:

```bash
# Обновление системы
apt update && apt upgrade -y

# Установка необходимых пакетов
apt install -y curl wget git vim htop ufw fail2ban software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Настройка файрвола
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Проверка статуса
ufw status verbose
```

## 🐳 Шаг 3: Установка Docker

```bash
# Удаление старых версий (если есть)
apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Добавление репозитория Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установка Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Установка docker-compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Запуск Docker
systemctl start docker
systemctl enable docker

# Проверка установки
docker --version
docker-compose --version
```

## 👤 Шаг 4: Создание пользователя приложения

```bash
# Создание пользователя
useradd -m -s /bin/bash halalhall
usermod -aG docker halalhall

# Создание директорий
mkdir -p /home/halalhall/app
mkdir -p /var/backups/halal_hall
mkdir -p /var/log/halal_hall

# Установка прав
chown -R halalhall:halalhall /home/halalhall/app
chown -R halalhall:halalhall /var/backups/halal_hall
chown -R halalhall:halalhall /var/log/halal_hall
```

## 📦 Шаг 5: Клонирование проекта

```bash
# Переключение на пользователя
su - halalhall

# Переход в директорию
cd /home/halalhall/app

# Клонирование репозитория (замените на ваш URL)
git clone https://github.com/your-username/halal-hall-menu.git .

# Если репозиторий приватный, используйте токен:
# git clone https://YOUR_TOKEN@github.com/your-username/halal-hall-menu.git .

# Установка прав на скрипты
chmod +x scripts/*.sh
```

## ⚙️ Шаг 6: Настройка переменных окружения

```bash
# Создание файла конфигурации
cp .env.production.example .env.production

# Редактирование конфигурации
nano .env.production
```

### Содержимое `.env.production`:

```env
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=restaurant_menu
DB_USER=postgres
DB_PASSWORD=HalalHall2024SecurePassword!

# Server Configuration  
NODE_ENV=production
PORT=3001
SERVER_HOST=0.0.0.0

# Security
JWT_SECRET=your_super_secret_jwt_key_change_this_to_random_string_min_32_chars
CORS_ORIGIN=http://194.32.142.53

# Frontend Configuration
VITE_API_URL=http://194.32.142.53/api
VITE_USE_API=true

# Admin Credentials (ОБЯЗАТЕЛЬНО ИЗМЕНИТЕ!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

**⚠️ ВАЖНО**: 
- Измените `DB_PASSWORD` на сложный пароль
- Измените `JWT_SECRET` на случайную строку (минимум 32 символа)
- После первого входа смените `ADMIN_PASSWORD` в админ-панели

Сохраните файл: `Ctrl+O`, `Enter`, `Ctrl+X`

## 🔒 Шаг 7: Настройка SSL (опционально, но рекомендуется)

### Вариант 1: Самоподписанный сертификат (для тестирования)
```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/C=KZ/ST=Almaty/L=Almaty/O=HalalHall/CN=194.32.142.53"
```

### Вариант 2: Let's Encrypt (если есть домен)
```bash
# Если у вас есть домен, например halalhall.kz
sudo apt install -y certbot
sudo certbot certonly --standalone -d halalhall.kz -d www.halalhall.kz

# Копирование сертификатов
sudo cp /etc/letsencrypt/live/halalhall.kz/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/halalhall.kz/privkey.pem nginx/ssl/key.pem
sudo chown halalhall:halalhall nginx/ssl/*.pem
```

## 🚀 Шаг 8: Запуск приложения

```bash
# Убедитесь что вы в директории проекта
cd /home/halalhall/app

# Сборка и запуск контейнеров
docker-compose -f docker-compose.prod.yml build --no-cache

# Запуск в фоновом режиме
docker-compose -f docker-compose.prod.yml up -d

# Проверка статуса
docker-compose -f docker-compose.prod.yml ps

# Просмотр логов
docker-compose -f docker-compose.prod.yml logs -f
```

## ✅ Шаг 9: Проверка работоспособности

### Проверка сервисов:
```bash
# Статус контейнеров
docker ps

# Проверка здоровья
curl http://localhost/health
curl http://localhost/api/health

# Проверка базы данных
docker exec halal_hall_db pg_isready -U postgres
```

### Доступ к приложению:
- **Главная страница**: http://194.32.142.53
- **API**: http://194.32.142.53/api/health
- **Админ-панель**: http://194.32.142.53/admin

## 🔧 Шаг 10: Настройка автоматического резервного копирования

```bash
# Создание скрипта бэкапа
cat > /home/halalhall/backup.sh <<'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/halal_hall"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/var/log/halal_hall/backup.log"

echo "[$(date)] Starting backup..." >> $LOG_FILE
docker exec halal_hall_db pg_dump -U postgres restaurant_menu | gzip > "${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql.gz"

# Удаление старых бэкапов (старше 30 дней)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "[$(date)] Backup completed: db_backup_${TIMESTAMP}.sql.gz" >> $LOG_FILE
EOF

chmod +x /home/halalhall/backup.sh

# Добавление в crontab (ежедневно в 2:00)
(crontab -l 2>/dev/null; echo "0 2 * * * /home/halalhall/backup.sh") | crontab -
```

## 📊 Шаг 11: Настройка мониторинга

```bash
# Возврат к root
exit
sudo -i

# Установка Netdata
bash <(curl -Ss https://my-netdata.io/kickstart.sh) --dont-wait --stable-channel

# Netdata будет доступен на http://194.32.142.53:19999
# Добавьте порт в firewall
ufw allow 19999/tcp
```

## 🛡️ Шаг 12: Дополнительная безопасность

```bash
# Настройка fail2ban
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

# Настройка автоматических обновлений безопасности
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

## 📝 Управление приложением

### Основные команды:

```bash
# Переключение на пользователя приложения
su - halalhall
cd /home/halalhall/app

# Просмотр статуса
docker-compose -f docker-compose.prod.yml ps

# Просмотр логов
docker-compose -f docker-compose.prod.yml logs -f
docker-compose -f docker-compose.prod.yml logs backend -f

# Перезапуск
docker-compose -f docker-compose.prod.yml restart

# Остановка
docker-compose -f docker-compose.prod.yml down

# Запуск
docker-compose -f docker-compose.prod.yml up -d

# Создание бэкапа вручную
./scripts/manage.sh backup

# Восстановление из бэкапа
./scripts/manage.sh restore /var/backups/halal_hall/db_backup_YYYYMMDD_HHMMSS.sql.gz
```

## 🔄 Обновление приложения

```bash
su - halalhall
cd /home/halalhall/app

# Создание бэкапа перед обновлением
./scripts/manage.sh backup

# Получение обновлений
git pull origin main

# Пересборка и перезапуск
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Проверка
docker-compose -f docker-compose.prod.yml ps
```

## 🆘 Устранение проблем

### Контейнеры не запускаются:
```bash
# Проверка логов
docker-compose -f docker-compose.prod.yml logs

# Пересоздание контейнеров
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

### Проблемы с базой данных:
```bash
# Вход в контейнер БД
docker exec -it halal_hall_db psql -U postgres restaurant_menu

# Проверка таблиц
\dt

# Выход
\q
```

### Нехватка памяти:
```bash
# Создание swap файла
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Очистка Docker:
```bash
# Удаление неиспользуемых образов и контейнеров
docker system prune -a
```

## 📞 Проверочный список

- [ ] Сервер обновлен
- [ ] Docker установлен
- [ ] Файрвол настроен
- [ ] Проект склонирован
- [ ] .env.production настроен
- [ ] Пароли изменены
- [ ] Приложение запущено
- [ ] Сайт открывается по IP
- [ ] Админ-панель работает
- [ ] Бэкапы настроены
- [ ] Мониторинг установлен

## 🎉 Готово!

Ваше приложение HALAL HALL теперь работает на:
- **Сайт**: http://194.32.142.53
- **API**: http://194.32.142.53/api
- **Админка**: http://194.32.142.53/admin
- **Мониторинг**: http://194.32.142.53:19999

### Первый вход в админку:
1. Откройте http://194.32.142.53/admin
2. Логин: `admin`
3. Пароль: `admin123` (или тот что вы указали)
4. **Сразу смените пароль!**

---

**Поддержка**: Если возникли проблемы, проверьте логи:
```bash
docker-compose -f docker-compose.prod.yml logs -f
```
