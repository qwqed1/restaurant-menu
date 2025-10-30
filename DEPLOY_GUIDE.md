# 📋 Руководство по развертыванию Halal Hall на VPS

## 🖥️ Информация о сервере

- **IP-адрес:** 194.32.142.53
- **IPv6:** 2a00:5da0:1000:1::2b46
- **Пользователь:** ubuntu
- **ОС:** Ubuntu (предполагается)

---

## 📁 Структура проекта

```
restaurant-menu/
├── frontend/          # React приложение (для планшетов)
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/           # Node.js API + Админ-панель
│   ├── config/
│   ├── middleware/
│   ├── server-postgres.js
│   └── package.json
└── DEPLOY_GUIDE.md   # Эта инструкция
```

---

## 🚀 Часть 1: Подготовка VPS сервера

### 1.1. Подключение к серверу

```bash
ssh ubuntu@194.32.142.53
```

Введите пароль, затем получите root-привилегии:
```bash
sudo -i
```

### 1.2. Обновление системы

```bash
apt update && apt upgrade -y
```

### 1.3. Установка Node.js 18+

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
node --version  # Проверка версии
npm --version
```

### 1.4. Установка PostgreSQL

```bash
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
systemctl status postgresql  # Проверка статуса
```

### 1.5. Установка Nginx

```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
systemctl status nginx  # Проверка статуса
```

### 1.6. Установка PM2 (менеджер процессов)

```bash
npm install -g pm2
```

---

## 🗄️ Часть 2: Настройка базы данных

### 2.1. Создание пользователя и базы данных

```bash
sudo -u postgres psql
```

В консоли PostgreSQL выполните:

```sql
CREATE DATABASE halalhall;
CREATE USER halalhall WITH PASSWORD 'ваш_надежный_пароль';
GRANT ALL PRIVILEGES ON DATABASE halalhall TO halalhall;
\q
```

### 2.2. Проверка подключения

```bash
psql -U halalhall -d halalhall -h localhost
# Введите пароль
# Если подключение успешно, выйдите: \q
```

---

## 📦 Часть 3: Загрузка файлов на сервер

### 3.1. Создание директорий

На сервере:
```bash
mkdir -p /var/www/halalhall
mkdir -p /opt/halalhall-backend
```

### 3.2. Загрузка frontend (с вашего компьютера)

Сначала соберите фронтенд локально:
```powershell
cd "C:\Users\Admin\Documents\Halal hail\restaurant-menu\frontend"
npm install
npm run build
```

Загрузите на сервер:
```powershell
scp -r dist/* ubuntu@194.32.142.53:/tmp/frontend/
```

На сервере переместите файлы:
```bash
mv /tmp/frontend/* /var/www/halalhall/
chown -R www-data:www-data /var/www/halalhall
```

### 3.3. Загрузка backend (с вашего компьютера)

Создайте архив (исключая node_modules):
```powershell
cd "C:\Users\Admin\Documents\Halal hail\restaurant-menu\backend"
# Удалите node_modules если есть
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
```

Загрузите на сервер:
```powershell
scp -r * ubuntu@194.32.142.53:/tmp/backend/
```

На сервере переместите файлы:
```bash
mv /tmp/backend/* /opt/halalhall-backend/
cd /opt/halalhall-backend
```

---

## ⚙️ Часть 4: Настройка Backend

### 4.1. Установка зависимостей

```bash
cd /opt/halalhall-backend
npm install --production
```

### 4.2. Создание .env файла

```bash
nano .env
```

Вставьте следующее (замените пароли!):

```env
# Настройки сервера
PORT=3001
NODE_ENV=production
SERVER_HOST=0.0.0.0

# Настройки базы данных
DB_HOST=localhost
DB_PORT=5432
DB_NAME=halalhall
DB_USER=halalhall
DB_PASSWORD=ваш_пароль_от_бд

# JWT секрет (сгенерируйте случайную строку!)
JWT_SECRET=замените_на_длинную_случайную_строку

# CORS
ALLOWED_ORIGINS=http://194.32.142.53
```

Сохраните: `Ctrl+O`, `Enter`, `Ctrl+X`

### 4.3. Инициализация базы данных

```bash
cd /opt/halalhall-backend
node init-postgres.js
```

Это создаст таблицы и добавит администратора по умолчанию:
- **Логин:** admin
- **Пароль:** admin123

⚠️ **ВАЖНО:** Смените пароль после первого входа!

### 4.4. Запуск Backend через PM2

```bash
cd /opt/halalhall-backend
pm2 start server-postgres.js --name halalhall-api
pm2 save
pm2 startup
```

Скопируйте и выполните команду, которую выдаст `pm2 startup`.

### 4.5. Проверка работы

```bash
pm2 status
pm2 logs halalhall-api
curl http://localhost:3001/api/categories
```

---

## 🌐 Часть 5: Настройка Nginx

### 5.1. Создание конфигурации

```bash
nano /etc/nginx/sites-available/halalhall
```

Вставьте:

```nginx
server {
    listen 80;
    server_name 194.32.142.53;

    # Frontend (для планшетов)
    root /var/www/halalhall;
    index index.html;

    # Логи
    access_log /var/log/nginx/halalhall-access.log;
    error_log /var/log/nginx/halalhall-error.log;

    # Основные страницы
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Админ-панель (тоже через frontend)
    location /admin {
        try_files $uri $uri/ /index.html;
    }

    # Загруженные изображения
    location /uploads {
        proxy_pass http://localhost:3001/uploads;
    }
}
```

Сохраните: `Ctrl+O`, `Enter`, `Ctrl+X`

### 5.2. Активация конфигурации

```bash
ln -s /etc/nginx/sites-available/halalhall /etc/nginx/sites-enabled/
nginx -t  # Проверка конфигурации
systemctl restart nginx
```

---

## 🔒 Часть 6: Настройка Firewall

```bash
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS (на будущее)
ufw enable
ufw status
```

---

## ✅ Часть 7: Проверка работы

### 7.1. Проверка сервисов

```bash
systemctl status nginx
systemctl status postgresql
pm2 status
```

### 7.2. Проверка доступности

На планшете откройте браузер:
- **Главная страница:** http://194.32.142.53/
- **Меню:** http://194.32.142.53/menu
- **Админ-панель:** http://194.32.142.53/admin

### 7.3. Вход в админ-панель

- **URL:** http://194.32.142.53/admin/login
- **Логин:** admin
- **Пароль:** admin123

⚠️ **Сразу смените пароль!**

---

## 🔧 Обслуживание и управление

### Просмотр логов

```bash
# Логи Backend
pm2 logs halalhall-api

# Логи Nginx
tail -f /var/log/nginx/halalhall-error.log
tail -f /var/log/nginx/halalhall-access.log

# Логи PostgreSQL
tail -f /var/log/postgresql/postgresql-14-main.log
```

### Управление Backend

```bash
pm2 restart halalhall-api   # Перезапуск
pm2 stop halalhall-api      # Остановка
pm2 start halalhall-api     # Запуск
pm2 delete halalhall-api    # Удаление
```

### Резервное копирование БД

```bash
# Создание бэкапа
pg_dump -U halalhall halalhall > /root/backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановление из бэкапа
psql -U halalhall halalhall < /root/backup_20241030_120000.sql
```

### Обновление приложения

**Frontend:**
```powershell
# На локальном ПК
cd "C:\Users\Admin\Documents\Halal hail\restaurant-menu\frontend"
npm run build
scp -r dist/* ubuntu@194.32.142.53:/var/www/halalhall/
```

**Backend:**
```bash
# На сервере
cd /opt/halalhall-backend
# Загрузите новые файлы через scp
npm install --production
pm2 restart halalhall-api
```

---

## 🐛 Решение проблем

### Backend не запускается

```bash
cd /opt/halalhall-backend
pm2 logs halalhall-api --lines 50
# Проверьте .env файл
cat .env
# Проверьте подключение к БД
psql -U halalhall -d halalhall -h localhost
```

### Nginx выдает 502 Bad Gateway

```bash
# Проверьте, работает ли backend
pm2 status
curl http://localhost:3001/api/categories

# Проверьте логи
tail -f /var/log/nginx/halalhall-error.log
```

### База данных не подключается

```bash
# Проверьте статус PostgreSQL
systemctl status postgresql

# Проверьте пользователя и права
sudo -u postgres psql -c "\du"
sudo -u postgres psql -c "\l"
```

### Не загружаются изображения

```bash
# Проверьте права на папку uploads
ls -la /opt/halalhall-backend/uploads/
chmod 755 /opt/halalhall-backend/uploads/
chown -R ubuntu:ubuntu /opt/halalhall-backend/uploads/
```

---

## 📱 Настройка планшетов

На каждом планшете:
1. Откройте браузер (Chrome/Firefox)
2. Перейдите на: **http://194.32.142.53/**
3. Добавьте в закладки или на главный экран
4. Выберите язык (RU/EN/KK)

---

## 🔐 Рекомендации по безопасности

1. **Смените пароль администратора** сразу после первого входа
2. **Смените пароль БД** на надежный
3. **Сгенерируйте новый JWT_SECRET:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
4. **Настройте автоматические бэкапы БД** (cron)
5. **Ограничьте доступ к админ-панели по IP** (если нужно)
6. **Настройте HTTPS** с помощью Let's Encrypt (опционально)

---

## 📞 Контакты и поддержка

При возникновении проблем проверьте:
- Логи Backend: `pm2 logs halalhall-api`
- Логи Nginx: `/var/log/nginx/halalhall-error.log`
- Статус сервисов: `pm2 status`, `systemctl status nginx postgresql`

---

**Успешного развертывания! 🎉**
