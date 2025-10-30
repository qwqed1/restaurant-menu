# 📂 Структура проекта Halal Hall

## 🏗️ Общая структура

```
restaurant-menu/
│
├── frontend/                    # React приложение (для планшетов)
│   ├── src/
│   │   ├── components/         # UI компоненты
│   │   │   ├── DishCard.jsx           # Карточка блюда
│   │   │   ├── DishList.jsx           # Список блюд
│   │   │   ├── DishModal.jsx          # Модальное окно блюда
│   │   │   ├── Header.jsx             # Шапка приложения
│   │   │   ├── LanguageSelector.jsx   # Переключатель языков
│   │   │   └── Sidebar.jsx            # Боковое меню категорий
│   │   │
│   │   ├── pages/              # Страницы приложения
│   │   │   ├── admin/                 # Админ-панель
│   │   │   │   ├── AdminUsers.jsx     # Управление админами
│   │   │   │   ├── CategoriesManager.jsx  # Управление категориями
│   │   │   │   ├── Dashboard.jsx      # Главная админки
│   │   │   │   ├── DishesManager.jsx  # Управление блюдами
│   │   │   │   └── Login.jsx          # Вход в админку
│   │   │   │
│   │   │   ├── BarPage.jsx            # Страница бара
│   │   │   ├── HomePage.jsx           # Главная страница
│   │   │   ├── MenuPage.jsx           # Страница меню
│   │   │   └── PizzaPage.jsx          # Страница пиццы
│   │   │
│   │   ├── locales/            # Переводы
│   │   │   ├── en.json                # Английский
│   │   │   ├── kk.json                # Казахский
│   │   │   └── ru.json                # Русский
│   │   │
│   │   ├── data/               # Моковые данные (для разработки)
│   │   │   ├── mockData.js
│   │   │   └── mockMenu.js
│   │   │
│   │   ├── App.jsx             # Главный компонент меню
│   │   ├── AppWithRouter.jsx   # Роутинг приложения
│   │   ├── i18n.js             # Конфигурация i18n
│   │   ├── index.css           # Глобальные стили
│   │   └── main.jsx            # Точка входа
│   │
│   ├── index.html              # HTML шаблон
│   ├── package.json            # Зависимости frontend
│   ├── vite.config.js          # Конфигурация Vite
│   ├── tailwind.config.js      # Конфигурация Tailwind
│   ├── postcss.config.js       # Конфигурация PostCSS
│   ├── .env                    # Переменные окружения (не в git)
│   ├── .env.example            # Пример .env
│   └── .gitignore              # Игнорируемые файлы
│
├── backend/                     # Node.js API сервер
│   ├── config/
│   │   └── database.js         # Конфигурация PostgreSQL
│   │
│   ├── middleware/
│   │   └── auth.js             # JWT аутентификация
│   │
│   ├── uploads/                # Загруженные изображения
│   │   └── .gitkeep
│   │
│   ├── server-postgres.js      # Главный файл сервера
│   ├── init-postgres.js        # Инициализация БД
│   ├── auto-init.js            # Автоматическая инициализация
│   ├── init-railway-db.js      # Инициализация для Railway
│   ├── railway-init.js         # Railway специфичный код
│   ├── package.json            # Зависимости backend
│   ├── .env                    # Переменные окружения (не в git)
│   ├── .env.example            # Пример .env
│   ├── .env.vps.example        # Пример для VPS
│   ├── .dockerignore           # Игнорируемые файлы для Docker
│   └── Dockerfile              # Docker образ (если нужен)
│
├── img/                        # Изображения проекта
│
├── DEPLOY_GUIDE.md             # 📘 Полное руководство по деплою
├── QUICK_COMMANDS.md           # ⚡ Быстрые команды
├── PRE_DEPLOY_CHECKLIST.md     # ✅ Чек-лист перед деплоем
├── PROJECT_STRUCTURE.md        # 📂 Этот файл
├── README.md                   # 📖 Общая информация
│
├── .gitignore                  # Игнорируемые файлы
├── Procfile                    # Для Railway/Heroku
├── railway.json                # Конфигурация Railway
└── upload-to-vps.ps1           # PowerShell скрипт загрузки
```

---

## 🎯 Назначение директорий

### Frontend (`/frontend`)
**Назначение:** React приложение для отображения меню на планшетах и админ-панель

**Основные файлы:**
- `src/App.jsx` - Страница меню с категориями и блюдами
- `src/AppWithRouter.jsx` - Роутинг всего приложения
- `src/pages/HomePage.jsx` - Главная страница (HALAL HALL)
- `src/pages/admin/Dashboard.jsx` - Админ-панель

**Технологии:**
- React 18
- Vite (сборщик)
- React Router (навигация)
- i18next (мультиязычность)
- Tailwind CSS (стили)
- Axios (HTTP запросы)

### Backend (`/backend`)
**Назначение:** REST API сервер с базой данных

**Основные файлы:**
- `server-postgres.js` - Express сервер с API endpoints
- `config/database.js` - Подключение к PostgreSQL
- `middleware/auth.js` - JWT аутентификация
- `init-postgres.js` - Создание таблиц и начальных данных

**Технологии:**
- Node.js + Express
- PostgreSQL
- JWT (авторизация)
- Multer (загрузка файлов)
- bcrypt (хеширование паролей)

---

## 🔌 API Endpoints

### Публичные (без авторизации):
```
GET  /api/categories          # Список категорий
GET  /api/dishes              # Список блюд
GET  /api/dishes/:id          # Одно блюдо
```

### Админские (требуют JWT токен):
```
POST   /api/admin/login                # Вход
GET    /api/admin/verify               # Проверка токена

GET    /api/admin/categories           # Список категорий
POST   /api/admin/categories           # Создать категорию
PUT    /api/admin/categories/:id       # Обновить категорию
DELETE /api/admin/categories/:id       # Удалить категорию

GET    /api/admin/dishes               # Список блюд
POST   /api/admin/dishes               # Создать блюдо
PUT    /api/admin/dishes/:id           # Обновить блюдо
DELETE /api/admin/dishes/:id           # Удалить блюдо

POST   /api/admin/upload               # Загрузить изображение

GET    /api/admin/users                # Список админов
POST   /api/admin/users                # Создать админа
PUT    /api/admin/users/:id            # Обновить админа
DELETE /api/admin/users/:id            # Удалить админа
```

---

## 🗄️ Структура базы данных

### Таблица: `categories`
```sql
id              SERIAL PRIMARY KEY
name_ru         VARCHAR(255) NOT NULL    # Название (русский)
name_en         VARCHAR(255)             # Название (английский)
name_kk         VARCHAR(255)             # Название (казахский)
display_order   INTEGER DEFAULT 0        # Порядок отображения
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

### Таблица: `dishes`
```sql
id                SERIAL PRIMARY KEY
category_id       INTEGER REFERENCES categories(id)
name              VARCHAR(255) NOT NULL        # Название (не переводится)
description_ru    TEXT                         # Описание (русский)
description_en    TEXT                         # Описание (английский)
description_kk    TEXT                         # Описание (казахский)
price             DECIMAL(10,2) NOT NULL       # Цена в тенге
image_url         VARCHAR(500)                 # URL изображения
weight            VARCHAR(50)                  # Вес/объем
ingredients_text  TEXT                         # Состав
is_available      BOOLEAN DEFAULT true         # Доступность
created_at        TIMESTAMP DEFAULT NOW()
updated_at        TIMESTAMP DEFAULT NOW()
```

### Таблица: `admin_users`
```sql
id          SERIAL PRIMARY KEY
username    VARCHAR(100) UNIQUE NOT NULL
email       VARCHAR(255) UNIQUE NOT NULL
password    VARCHAR(255) NOT NULL         # bcrypt хеш
is_active   BOOLEAN DEFAULT true
created_at  TIMESTAMP DEFAULT NOW()
updated_at  TIMESTAMP DEFAULT NOW()
```

---

## 🌐 Роутинг приложения

```
/                           # Главная страница (HALAL HALL)
/menu                       # Меню кухни
/bar                        # Меню бара
/pizza                      # Меню пиццы
/admin                      # Редирект на /admin/login
/admin/login                # Вход в админку
/admin/dashboard            # Главная админки
/admin/dashboard/dishes     # Управление блюдами
/admin/dashboard/categories # Управление категориями
/admin/dashboard/users      # Управление админами
```

---

## 🎨 Дизайн-система

### Цвета:
```css
--menu-green-dark:  #1a3d0a    /* Темно-зеленый фон */
--menu-green:       #2d5016    /* Основной зеленый */
--menu-gold:        #d4af37    /* Золотой акцент */
--menu-gold-dark:   #b8941e    /* Темное золото */
--menu-cream:       #f5f5dc    /* Кремовый текст */
```

### Компоненты:
- Панели: Полупрозрачный зеленый с размытием
- Кнопки: Золотой градиент с hover эффектами
- Карточки: Темный фон с золотой обводкой
- Шрифты: System fonts для быстрой загрузки

---

## 📦 Зависимости

### Frontend:
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.30.1",
  "i18next": "^25.6.0",
  "axios": "^1.12.2",
  "lucide-react": "^0.294.0",
  "tailwindcss": "^3.3.6",
  "vite": "^5.0.8"
}
```

### Backend:
```json
{
  "express": "^4.18.2",
  "pg": "^8.16.3",
  "jsonwebtoken": "^9.0.2",
  "bcrypt": "^6.0.0",
  "multer": "^2.0.2",
  "cors": "^2.8.5",
  "dotenv": "^16.6.1"
}
```

---

## 🚀 Команды для разработки

### Frontend:
```bash
cd frontend
npm install          # Установка зависимостей
npm run dev          # Запуск dev сервера (localhost:5173)
npm run build        # Сборка для продакшена
npm run preview      # Предпросмотр билда
```

### Backend:
```bash
cd backend
npm install          # Установка зависимостей
npm start            # Запуск сервера (localhost:3001)
npm run dev          # Запуск с hot-reload
node init-postgres.js # Инициализация БД
```

---

## 📝 Переменные окружения

### Frontend (`.env`):
```env
VITE_API_URL=http://194.32.142.53:3001
VITE_USE_API=true
```

### Backend (`.env`):
```env
PORT=3001
NODE_ENV=production
DB_HOST=localhost
DB_NAME=halalhall
DB_USER=halalhall
DB_PASSWORD=ваш_пароль
JWT_SECRET=случайная_строка
```

---

## 🔐 Безопасность

- JWT токены для авторизации админов
- bcrypt для хеширования паролей
- CORS настроен на конкретные origins
- Валидация всех входных данных
- Защита от SQL инъекций (параметризованные запросы)
- Ограничение размера загружаемых файлов (5MB)

---

## 📱 Оптимизация для планшетов

- Адаптивный дизайн для 8-11 дюймов
- Landscape ориентация
- Оптимизированные размеры шрифтов и элементов
- Быстрая загрузка (lazy loading изображений)
- Кеширование статических ресурсов

---

**Для деплоя смотрите:** [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)
