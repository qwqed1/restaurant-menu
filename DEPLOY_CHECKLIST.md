# ✅ Railway Deploy Checklist

## Перед деплоем

- [ ] Все изменения закоммичены в Git
- [ ] `.env` файлы НЕ добавлены в Git (проверьте `.gitignore`)
- [ ] `backend/package.json` содержит правильный `start` скрипт
- [ ] `backend/server-postgres.js` использует `process.env.PORT`
- [ ] `backend/config/database.js` поддерживает `DATABASE_URL`

## Создание проекта на Railway

- [ ] Зарегистрировались на [railway.app](https://railway.app)
- [ ] Подключили GitHub аккаунт
- [ ] Создали новый проект: **New Project** → **Deploy from GitHub repo**
- [ ] Выбрали репозиторий `Halal hail/restaurant-menu`

## Настройка PostgreSQL

- [ ] Добавили PostgreSQL: **+ New** → **Database** → **Add PostgreSQL**
- [ ] Дождались создания базы данных (1-2 минуты)
- [ ] Проверили что переменная `DATABASE_URL` появилась автоматически

## Переменные окружения

- [ ] Открыли **Variables** в настройках сервиса
- [ ] Добавили `NODE_ENV=production`
- [ ] Сгенерировали JWT_SECRET:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] Добавили `JWT_SECRET=ваш_сгенерированный_секрет`
- [ ] Сохранили изменения

## Первый деплой

- [ ] Railway автоматически начал деплой
- [ ] Дождались завершения сборки (3-5 минут)
- [ ] Проверили логи на наличие ошибок
- [ ] Получили URL вида `https://your-app.railway.app`

## Инициализация базы данных

Выберите один из вариантов:

### Вариант A: Через Railway CLI (Рекомендуется)

- [ ] Установили Railway CLI:
  ```bash
  npm install -g @railway/cli
  ```
- [ ] Вошли в аккаунт:
  ```bash
  railway login
  ```
- [ ] Подключились к проекту:
  ```bash
  railway link
  ```
- [ ] Запустили инициализацию:
  ```bash
  railway run npm run init-postgres
  railway run npm run migrate-localization
  railway run npm run fill-translations
  ```

### Вариант B: Через Railway Dashboard

- [ ] Открыли сервис в Railway Dashboard
- [ ] Перешли в **Settings** → **Deploy**
- [ ] Временно изменили **Start Command** на:
  ```bash
  cd backend && npm run railway-init && npm start
  ```
- [ ] Дождались перезапуска
- [ ] Вернули обратно **Start Command**:
  ```bash
  cd backend && npm start
  ```

## Проверка работоспособности

- [ ] Открыли `https://your-app.railway.app/api/health`
  - Должен вернуть: `{"status":"healthy","timestamp":"...","database":"PostgreSQL"}`

- [ ] Проверили категории: `https://your-app.railway.app/api/categories`
  - Должен вернуть массив категорий

- [ ] Проверили блюда: `https://your-app.railway.app/api/dishes`
  - Должен вернуть массив блюд

- [ ] Проверили админ логин:
  ```bash
  curl -X POST https://your-app.railway.app/api/admin/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}'
  ```
  - Должен вернуть JWT токен

## Настройка Frontend

- [ ] Обновили `.env` в frontend проекте:
  ```env
  VITE_API_URL=https://your-app.railway.app
  VITE_USE_API=true
  ```
- [ ] Пересобрали frontend: `npm run build`
- [ ] Задеплоили frontend (Vercel/Netlify/Railway)

## Безопасность

- [ ] Сменили дефолтный пароль админа (`admin/admin123`)
- [ ] Проверили что JWT_SECRET не совпадает с примером
- [ ] Убедились что `.env` файлы в `.gitignore`
- [ ] Настроили CORS если нужно ограничить домены

## Мониторинг

- [ ] Настроили уведомления о деплоях в Railway
- [ ] Добавили проект в закладки для быстрого доступа
- [ ] Проверили метрики использования ресурсов

## Автоматический деплой

- [ ] Настроили автодеплой при push в main/master ветку
- [ ] Проверили что деплой работает:
  ```bash
  git commit -am "Test deploy"
  git push
  ```
- [ ] Дождались автоматического деплоя на Railway

## Дополнительно (опционально)

- [ ] Настроили custom domain
- [ ] Добавили SSL сертификат (Railway делает автоматически)
- [ ] Настроили backup базы данных
- [ ] Добавили мониторинг (UptimeRobot, Better Uptime)

## Troubleshooting

Если что-то пошло не так:

### Ошибка подключения к БД
- Проверьте что PostgreSQL сервис запущен
- Проверьте что `DATABASE_URL` установлен
- Посмотрите логи: Railway Dashboard → Deployments → View Logs

### Ошибка JWT
- Убедитесь что `JWT_SECRET` установлен
- Проверьте что секрет не содержит спецсимволов без экранирования

### Таблицы не найдены
- Запустите миграции через Railway CLI
- Проверьте логи инициализации БД

### 502 Bad Gateway
- Проверьте что сервер слушает на правильном порту (`process.env.PORT`)
- Посмотрите логи запуска сервера

## Полезные команды

```bash
# Просмотр логов
railway logs

# Подключение к PostgreSQL
railway connect postgres

# Запуск команд в production
railway run <command>

# Просмотр переменных
railway variables

# Перезапуск
railway up --detach
```

---

## 🎉 Готово!

После выполнения всех пунктов ваше приложение полностью развернуто на Railway!

**API URL:** `https://your-app.railway.app/api`
**Admin Panel:** `https://your-frontend-url.com/admin`

Сохраните этот чеклист для будущих деплоев!
