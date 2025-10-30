# 🚀 Быстрые команды для деплоя Halal Hall

## 📋 Информация о сервере
```
IP: 194.32.142.53
Пользователь: ubuntu
```

---

## 1️⃣ Подключение к серверу

```bash
ssh ubuntu@194.32.142.53
sudo -i
```

---

## 2️⃣ Установка всего необходимого (одной командой)

```bash
apt update && apt upgrade -y && \
curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
apt install -y nodejs postgresql postgresql-contrib nginx && \
npm install -g pm2 && \
systemctl start postgresql nginx && \
systemctl enable postgresql nginx
```

---

## 3️⃣ Настройка базы данных

```bash
sudo -u postgres psql << EOF
CREATE DATABASE halalhall;
CREATE USER halalhall WITH PASSWORD 'ваш_пароль';
GRANT ALL PRIVILEGES ON DATABASE halalhall TO halalhall;
\q
EOF
```

---

## 4️⃣ Создание директорий

```bash
mkdir -p /var/www/halalhall
mkdir -p /opt/halalhall-backend
```

---

## 5️⃣ Загрузка файлов (с локального ПК)

### Frontend:
```powershell
cd "C:\Users\Admin\Documents\Halal hail\restaurant-menu\frontend"
npm install
npm run build
scp -r dist/* ubuntu@194.32.142.53:/var/www/halalhall/
```

### Backend:
```powershell
cd "C:\Users\Admin\Documents\Halal hail\restaurant-menu\backend"
scp -r * ubuntu@194.32.142.53:/opt/halalhall-backend/
```

---

## 6️⃣ Настройка Backend (на сервере)

```bash
cd /opt/halalhall-backend
npm install --production

# Создать .env файл
cat > .env << 'EOF'
PORT=3001
NODE_ENV=production
SERVER_HOST=0.0.0.0
DB_HOST=localhost
DB_PORT=5432
DB_NAME=halalhall
DB_USER=halalhall
DB_PASSWORD=ваш_пароль
JWT_SECRET=замените_на_случайную_строку
ALLOWED_ORIGINS=http://194.32.142.53
EOF

# Инициализация БД
node init-postgres.js

# Запуск
pm2 start server-postgres.js --name halalhall-api
pm2 save
pm2 startup
```

---

## 7️⃣ Настройка Nginx

```bash
cat > /etc/nginx/sites-available/halalhall << 'EOF'
server {
    listen 80;
    server_name 194.32.142.53;
    root /var/www/halalhall;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /admin {
        try_files $uri $uri/ /index.html;
    }

    location /uploads {
        proxy_pass http://localhost:3001/uploads;
    }
}
EOF

ln -s /etc/nginx/sites-available/halalhall /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## 8️⃣ Firewall

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw enable
```

---

## ✅ Проверка

```bash
systemctl status nginx postgresql
pm2 status
curl http://localhost:3001/api/categories
```

Откройте в браузере: **http://194.32.142.53/**

---

## 🔧 Полезные команды

### Просмотр логов:
```bash
pm2 logs halalhall-api
tail -f /var/log/nginx/halalhall-error.log
```

### Перезапуск:
```bash
pm2 restart halalhall-api
systemctl restart nginx
```

### Бэкап БД:
```bash
pg_dump -U halalhall halalhall > backup_$(date +%Y%m%d).sql
```

### Обновление приложения:
```bash
# Frontend (с локального ПК)
npm run build
scp -r dist/* ubuntu@194.32.142.53:/var/www/halalhall/

# Backend (на сервере)
cd /opt/halalhall-backend
pm2 restart halalhall-api
```

---

## 🔑 Доступ к админ-панели

- **URL:** http://194.32.142.53/admin/login
- **Логин:** admin
- **Пароль:** admin123

⚠️ **Сразу смените пароль после входа!**
