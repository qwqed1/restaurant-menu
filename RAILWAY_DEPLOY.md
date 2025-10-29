# 🚂 Деплой на Railway - Инструкция

## Шаг 1: Подготовка проекта

Все необходимые файлы уже созданы:
- ✅ `railway.json` - конфигурация Railway
- ✅ `nixpacks.toml` - настройки сборки
- ✅ `Procfile` - команда запуска
- ✅ `backend/config/database.js` - поддержка DATABASE_URL
- ✅ `backend/server-postgres.js` - настроен для Railway

## Шаг 2: Создание проекта на Railway

1. Зайдите на [railway.app](https://railway.app)
2. Войдите через GitHub
3. Нажмите **"New Project"**
4. Выберите **"Deploy from GitHub repo"**
5. Выберите ваш репозиторий `Halal hail/restaurant-menu`

## Шаг 3: Добавление PostgreSQL базы данных

1. В вашем проекте нажмите **"+ New"**
2. Выберите **"Database"** → **"Add PostgreSQL"**
3. Railway автоматически создаст базу данных и установит переменную `DATABASE_URL`

## Шаг 4: Настройка переменных окружения

В настройках вашего сервиса добавьте переменные:

### Обязательные переменные:

```env
NODE_ENV=production
JWT_SECRET=ваш_очень_секретный_ключ_минимум_32_символа
```

### Автоматические переменные (Railway создаст сам):
- `DATABASE_URL` - автоматически связывается с PostgreSQL
- `PORT` - автоматически устанавливается Railway

## Шаг 5: Инициализация базы данных

После первого деплоя нужно создать таблицы:

### Вариант 1: Через Railway CLI

```bash
# Установите Railway CLI
npm install -g @railway/cli

# Войдите в аккаунт
railway login

# Подключитесь к проекту
railway link

# Запустите миграции
railway run npm run init-postgres
railway run npm run migrate-localization
railway run npm run fill-translations
```

### Вариант 2: Через Railway Dashboard

1. Откройте ваш сервис в Railway
2. Перейдите в **"Settings"** → **"Deploy Triggers"**
3. Добавьте команды в **"Build Command"**:

```bash
cd backend && npm install && node init-postgres.js && node migrations/add-localization.js && node migrations/fill-translations.js
```

**⚠️ ВАЖНО:** Запускайте миграции только один раз!

## Шаг 6: Проверка деплоя

1. Railway автоматически создаст URL вида: `https://your-app.railway.app`
2. Проверьте health endpoint: `https://your-app.railway.app/api/health`
3. Проверьте категории: `https://your-app.railway.app/api/categories`

## Шаг 7: Настройка Frontend

Обновите переменные окружения в вашем frontend проекте:

```env
VITE_API_URL=https://your-app.railway.app
VITE_USE_API=true
```

## Структура проекта для Railway

```
restaurant-menu/
├── railway.json          # Конфигурация Railway
├── nixpacks.toml         # Настройки сборки
├── Procfile              # Команда запуска
└── backend/
    ├── package.json      # npm start → node server-postgres.js
    ├── server-postgres.js # Основной сервер
    ├── config/
    │   └── database.js   # Поддержка DATABASE_URL
    ├── init-postgres.js  # Инициализация БД
    └── migrations/       # Миграции
```

## Полезные команды Railway CLI

```bash
# Просмотр логов
railway logs

# Подключение к PostgreSQL
railway connect postgres

# Запуск команд в production
railway run <command>

# Просмотр переменных окружения
railway variables

# Перезапуск сервиса
railway up
```

## Troubleshooting

### Проблема: "Cannot connect to database"
**Решение:** Убедитесь, что PostgreSQL сервис добавлен и переменная `DATABASE_URL` установлена

### Проблема: "Port already in use"
**Решение:** Railway автоматически управляет портами, убедитесь что используете `process.env.PORT`

### Проблема: "JWT_SECRET not defined"
**Решение:** Добавьте переменную `JWT_SECRET` в настройках проекта

### Проблема: "Tables not found"
**Решение:** Запустите миграции через Railway CLI или добавьте их в Build Command

## Автоматический деплой

Railway автоматически деплоит при каждом push в GitHub:
1. Сделайте изменения в коде
2. Закоммитьте: `git commit -am "Update"`
3. Запушьте: `git push`
4. Railway автоматически задеплоит новую версию

## Мониторинг

- **Логи:** Railway Dashboard → Deployments → View Logs
- **Метрики:** Railway Dashboard → Metrics
- **Health Check:** `GET /api/health`

## Стоимость

- **Hobby Plan:** $5/месяц (500 часов выполнения)
- **PostgreSQL:** Включена в план
- **Bandwidth:** 100GB/месяц включено

---

**🎉 Готово!** Ваше приложение теперь работает на Railway!

URL вашего API: `https://your-app.railway.app/api`
