# 🍜 HALAL HALL - Restaurant Menu System

Многоязычная система меню ресторана с админ-панелью и поддержкой 3 языков (RU/EN/KK).

## 🚀 Быстрый старт

### Локальная разработка

```bash
# 1. Установка зависимостей
cd backend && npm install
cd .. && npm install

# 2. Настройка базы данных PostgreSQL
# Создайте файл backend/.env на основе backend/.env.example
cp backend/.env.example backend/.env

# 3. Инициализация базы данных
cd backend
npm run init-postgres
npm run migrate-localization
npm run fill-translations

# 4. Запуск backend
npm run dev

# 5. В другом терминале - запуск frontend
cd ..
npm run dev
```

## 🚂 Деплой на Railway

**Полная инструкция:** См. [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)

### Быстрые шаги:

1. **Создайте проект на Railway:**
   - Зайдите на [railway.app](https://railway.app)
   - Deploy from GitHub repo
   - Выберите этот репозиторий

2. **Добавьте PostgreSQL:**
   - New → Database → PostgreSQL
   - Railway автоматически установит `DATABASE_URL`

3. **Настройте переменные окружения:**
   ```env
   NODE_ENV=production
   JWT_SECRET=ваш_секретный_ключ_минимум_32_символа
   ```

4. **Инициализируйте базу данных:**
   ```bash
   railway run npm run init-postgres
   railway run npm run migrate-localization
   railway run npm run fill-translations
   ```

5. **Готово!** Ваш API доступен по адресу Railway

## 📁 Структура проекта

```
restaurant-menu/
├── backend/                    # Backend сервер
│   ├── server-postgres.js     # Express сервер
│   ├── config/
│   │   └── database.js        # PostgreSQL конфигурация
│   ├── middleware/
│   │   └── auth.js            # JWT аутентификация
│   ├── migrations/            # Миграции БД
│   └── uploads/               # Загруженные изображения
├── src/                       # Frontend React
│   ├── components/            # Компоненты
│   ├── pages/                 # Страницы
│   └── locales/               # Переводы (RU/EN/KK)
├── railway.json               # Конфигурация Railway
├── nixpacks.toml              # Настройки сборки
└── Procfile                   # Команда запуска
```

## 🛠 Технологии

### Backend:
- **Node.js** + **Express** - REST API
- **PostgreSQL** - База данных
- **JWT** - Аутентификация
- **Multer** - Загрузка изображений
- **bcrypt** - Хеширование паролей

### Frontend:
- **React 18** + **Vite** - UI фреймворк
- **Tailwind CSS** - Стилизация
- **i18next** - Интернационализация (RU/EN/KK)
- **Lucide React** - Иконки

## 🌐 API Endpoints

### Публичные:
- `GET /api/categories` - Список категорий
- `GET /api/dishes` - Список блюд
- `GET /api/dishes/:id` - Одно блюдо
- `GET /api/health` - Проверка здоровья

### Админ (требуется JWT):
- `POST /api/admin/login` - Вход
- `GET /api/admin/verify` - Проверка токена
- `GET/POST/PUT/DELETE /api/admin/categories` - Управление категориями
- `GET/POST/PUT/DELETE /api/admin/dishes` - Управление блюдами
- `POST /api/admin/upload-image` - Загрузка изображений
- `GET/POST/DELETE /api/admin/users` - Управление админами

## 🔐 Админ-панель

**URL:** `/admin`

**Дефолтный логин:**
- Username: `admin`
- Password: `admin123`

⚠️ **Важно:** Смените пароль после первого входа!

## 🌍 Локализация

Поддерживаемые языки:
- 🇷🇺 Русский (RU)
- 🇬🇧 English (EN)
- 🇰🇿 Қазақша (KK)

### Структура локализации:

**Категории:**
- `name_ru`, `name_en`, `name_kk`

**Блюда:**
- `name` - одинаковое для всех языков
- `description_ru`, `description_en`, `description_kk`
- `price` - всегда в тенге (₸)

## 📱 Оптимизация

Приложение оптимизировано для:
- 📱 Планшеты 8-11 дюймов (Xiaomi/Redmi Pad)
- 🖥 Десктоп браузеры
- 📲 Мобильные устройства

## 🎨 Дизайн

- **Основной цвет:** Зелёный (Green)
- **Акцент:** Золотой (Gold)
- **Тема:** Тёмная с размытием фона
- **Шрифты:** System fonts для быстрой загрузки

## 📝 Скрипты

### Backend:
```bash
npm start              # Запуск production сервера
npm run dev            # Запуск с hot-reload
npm run init-postgres  # Инициализация БД
npm run migrate-localization  # Добавить поля локализации
npm run fill-translations     # Заполнить переводы
```

### Frontend:
```bash
npm run dev            # Запуск dev сервера
npm run build          # Сборка для production
npm run preview        # Просмотр production сборки
```

## 🐛 Troubleshooting

### База данных не подключается
```bash
# Проверьте переменные окружения в backend/.env
# Убедитесь что PostgreSQL запущен
```

### Ошибка JWT
```bash
# Убедитесь что JWT_SECRET установлен в .env
```

### Изображения не загружаются
```bash
# Проверьте что папка backend/uploads существует
# Проверьте права доступа к папке
```

## 📄 Лицензия

Частный проект для HALAL HALL

## 👨‍💻 Разработка

Для вопросов и предложений создавайте Issues в GitHub.

---

**🎉 Приятного использования!**
