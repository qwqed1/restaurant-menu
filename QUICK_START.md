# 🚀 Quick Start - Railway Deploy

## 1️⃣ Создайте проект (2 минуты)

1. Зайдите на **[railway.app](https://railway.app)**
2. **New Project** → **Deploy from GitHub repo**
3. Выберите этот репозиторий

## 2️⃣ Добавьте PostgreSQL (1 минута)

1. **+ New** → **Database** → **Add PostgreSQL**
2. Дождитесь создания (автоматически)

## 3️⃣ Настройте переменные (2 минуты)

Откройте **Variables** и добавьте:

```env
NODE_ENV=production
JWT_SECRET=сгенерируйте_случайную_строку_32_символа
```

**Генерация JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4️⃣ Инициализируйте БД (3 минуты)

```bash
# Установите Railway CLI
npm install -g @railway/cli

# Войдите и подключитесь
railway login
railway link

# Запустите миграции
railway run npm run init-postgres
railway run npm run migrate-localization
railway run npm run fill-translations
```

## 5️⃣ Готово! ✅

Ваш API доступен: `https://your-app.railway.app/api`

**Проверка:**
- Health: `https://your-app.railway.app/api/health`
- Categories: `https://your-app.railway.app/api/categories`

---

## 📚 Подробные инструкции

- **Полная инструкция:** [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)
- **Чеклист:** [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)
- **Переменные окружения:** [RAILWAY_ENV_TEMPLATE.txt](./RAILWAY_ENV_TEMPLATE.txt)

## 🆘 Нужна помощь?

Смотрите раздел **Troubleshooting** в [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)
