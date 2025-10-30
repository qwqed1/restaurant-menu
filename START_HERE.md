n# 🚀 НАЧНИТЕ ОТСЮДА - Быстрый старт деплоя

## 📋 Информация о сервере

```
IP:           194.32.142.53
Пользователь: ubuntu
Пароль:       [у вас есть]
```

---

## 📚 Порядок действий

### 1️⃣ Прочитайте документацию (5 минут)

Откройте и ознакомьтесь с файлами в следующем порядке:

1. **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** ⭐ - Общая сводка (начните здесь!)
2. **[QUICK_COMMANDS.md](./QUICK_COMMANDS.md)** - Держите открытым во время деплоя
3. **[PRE_DEPLOY_CHECKLIST.md](./PRE_DEPLOY_CHECKLIST.md)** - Отмечайте выполненные пункты

### 2️⃣ Соберите frontend локально (2 минуты)

Откройте PowerShell:

```powershell
cd "C:\Users\Admin\Documents\Halal hail\restaurant-menu\frontend"
npm install
npm run build
```

Убедитесь, что папка `dist/` создана.

### 3️⃣ Подключитесь к серверу (1 минута)

```bash
ssh ubuntu@194.32.142.53
# Введите пароль
sudo -i
```

### 4️⃣ Следуйте инструкциям

Теперь откройте **[QUICK_COMMANDS.md](./QUICK_COMMANDS.md)** и выполняйте команды по порядку.

Или используйте полное руководство: **[DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)**

---

## ⚡ Экспресс-деплой (для опытных)

Если вы уже знакомы с Linux и хотите быстро развернуть:

### На сервере (одним блоком):

```bash
# Установка всего необходимого
apt update && apt upgrade -y && \
curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
apt install -y nodejs postgresql postgresql-contrib nginx && \
npm install -g pm2 && \
systemctl start postgresql nginx && \
systemctl enable postgresql nginx

# Создание БД
sudo -u postgres psql -c "CREATE DATABASE halalhall;"
sudo -u postgres psql -c "CREATE USER halalhall WITH PASSWORD 'ваш_пароль';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE halalhall TO halalhall;"

# Создание директорий
mkdir -p /var/www/halalhall /opt/halalhall-backend
```

### С локального ПК:

```powershell
# Загрузка frontend
cd "C:\Users\Admin\Documents\Halal hail\restaurant-menu\frontend"
scp -r dist/* ubuntu@194.32.142.53:/var/www/halalhall/

# Загрузка backend
cd "C:\Users\Admin\Documents\Halal hail\restaurant-menu\backend"
scp -r * ubuntu@194.32.142.53:/opt/halalhall-backend/
```

### На сервере (продолжение):

```bash
# Настройка backend
cd /opt/halalhall-backend
npm install --production

# Создать .env (скопируйте из .env.vps.example и заполните)
nano .env

# Инициализация БД
node init-postgres.js

# Запуск backend
pm2 start server-postgres.js --name halalhall-api
pm2 save
pm2 startup

# Настройка Nginx (скопируйте конфиг из DEPLOY_GUIDE.md)
nano /etc/nginx/sites-available/halalhall
ln -s /etc/nginx/sites-available/halalhall /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Firewall
ufw allow 22/tcp 80/tcp
ufw enable
```

### Проверка:

Откройте: **http://194.32.142.53/**

---

## 📁 Структура проекта

```
restaurant-menu/
├── frontend/              # React приложение (для планшетов)
│   ├── src/              # Исходники
│   ├── dist/             # Собранные файлы (после npm run build)
│   └── .env              # Настройки (уже создан)
│
├── backend/              # Node.js API
│   ├── server-postgres.js # Главный файл
│   ├── init-postgres.js  # Инициализация БД
│   └── .env.vps.example  # Пример настроек для VPS
│
└── [Документация]
    ├── START_HERE.md     ⭐ Этот файл
    ├── DEPLOYMENT_SUMMARY.md  # Общая сводка
    ├── DEPLOY_GUIDE.md   # Полное руководство
    ├── QUICK_COMMANDS.md # Быстрые команды
    └── PRE_DEPLOY_CHECKLIST.md # Чек-лист
```

---

## 🎯 Что будет после деплоя

### Для пользователей (планшеты):
- **http://194.32.142.53/** - Главная страница
- **http://194.32.142.53/menu** - Меню кухни
- **http://194.32.142.53/bar** - Меню бара
- **http://194.32.142.53/pizza** - Меню пиццы

### Для администраторов:
- **http://194.32.142.53/admin/login** - Вход в админку
  - Логин: `admin`
  - Пароль: `admin123` (⚠️ смените сразу!)

---

## ❓ Что делать, если что-то пошло не так

1. **Проверьте логи:**
   ```bash
   pm2 logs halalhall-api
   tail -f /var/log/nginx/halalhall-error.log
   ```

2. **Проверьте статус сервисов:**
   ```bash
   pm2 status
   systemctl status nginx postgresql
   ```

3. **Откройте раздел "Решение проблем"** в [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)

---

## 🔐 Важно для безопасности

После успешного деплоя:

1. ✅ Смените пароль администратора в админ-панели
2. ✅ Сгенерируйте новый JWT_SECRET:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. ✅ Используйте надежный пароль для БД
4. ✅ Настройте регулярные бэкапы

---

## 📞 Нужна помощь?

- Откройте [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) - там есть раздел "Решение проблем"
- Проверьте [PRE_DEPLOY_CHECKLIST.md](./PRE_DEPLOY_CHECKLIST.md) - возможно, пропустили шаг
- Посмотрите [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - для понимания архитектуры

---

## ✅ Готовы начать?

1. ✅ Сервер доступен (194.32.142.53)
2. ✅ Frontend собран (`npm run build`)
3. ✅ Документация прочитана
4. ✅ Команды под рукой

**Вперёд! Следуйте инструкциям в [QUICK_COMMANDS.md](./QUICK_COMMANDS.md)** 🚀

---

**Удачного деплоя! 🎉**
