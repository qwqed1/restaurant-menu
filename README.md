# 🍜 Halal Hall - Интерактивное меню ресторана

Веб-приложение для отображения меню ресторана на планшетах с админ-панелью для управления.

## 📱 Особенности

- **Мультиязычность:** Русский, Английский, Казахский
- **Адаптивный дизайн:** Оптимизирован для планшетов 8-11 дюймов
- **Админ-панель:** Управление категориями, блюдами, пользователями
- **База данных:** PostgreSQL
- **Современный стек:** React + Vite + Node.js + Express

## 🏗️ Структура проекта

```
restaurant-menu/
├── frontend/              # React приложение
│   ├── src/
│   │   ├── components/   # Компоненты UI
│   │   ├── pages/        # Страницы приложения
│   │   ├── locales/      # Переводы (ru, en, kk)
│   │   └── App.jsx       # Главный компонент
│   ├── package.json
│   └── vite.config.js
│
├── backend/              # Node.js API
│   ├── config/          # Конфигурация БД
│   ├── middleware/      # JWT аутентификация
│   ├── server-postgres.js
│   └── package.json
│
├── DEPLOY_GUIDE.md      # Подробная инструкция по деплою
└── QUICK_COMMANDS.md    # Быстрые команды
```

## 🚀 Быстрый старт (локальная разработка)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Откройте: http://localhost:5173

### Backend

```bash
cd backend
npm install

# Настройте .env файл
cp .env.example .env
# Отредактируйте .env

# Инициализируйте БД
node init-postgres.js

# Запустите сервер
npm start
```

API доступен на: http://localhost:3001

## 🌐 Развертывание на VPS

Следуйте инструкциям в файлах:
- **[DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)** - Подробное руководство
- **[QUICK_COMMANDS.md](./QUICK_COMMANDS.md)** - Быстрые команды

### Краткая версия:

1. Подключитесь к серверу: `ssh ubuntu@194.32.142.53`
2. Установите зависимости (Node.js, PostgreSQL, Nginx, PM2)
3. Настройте базу данных
4. Загрузите и настройте frontend и backend
5. Настройте Nginx как reverse proxy
6. Откройте http://194.32.142.53

## 🔑 Доступ к админ-панели

После развертывания:
- **URL:** http://ваш-ip/admin/login
- **Логин по умолчанию:** admin
- **Пароль по умолчанию:** admin123

⚠️ **Обязательно смените пароль после первого входа!**

## 📋 API Endpoints

### Публичные (без авторизации):
- `GET /api/categories` - Список категорий
- `GET /api/dishes` - Список блюд
- `GET /api/dishes/:id` - Информация о блюде

### Админские (требуют JWT токен):
- `POST /api/admin/login` - Вход в систему
- `GET /api/admin/categories` - Управление категориями
- `POST /api/admin/categories` - Создание категории
- `PUT /api/admin/categories/:id` - Обновление категории
- `DELETE /api/admin/categories/:id` - Удаление категории
- `GET /api/admin/dishes` - Управление блюдами
- `POST /api/admin/dishes` - Создание блюда
- `PUT /api/admin/dishes/:id` - Обновление блюда
- `DELETE /api/admin/dishes/:id` - Удаление блюда

## 🗄️ База данных

### Таблицы:

**categories:**
- id, name_ru, name_en, name_kk, display_order

**dishes:**
- id, category_id, name, description_ru, description_en, description_kk, price, image_url, weight, ingredients_text, is_available

**admin_users:**
- id, username, email, password (bcrypt), is_active

## 🛠️ Технологии

### Frontend:
- React 18
- Vite
- React Router
- i18next (мультиязычность)
- Tailwind CSS
- Lucide Icons
- Axios

### Backend:
- Node.js
- Express
- PostgreSQL
- JWT (jsonwebtoken)
- bcrypt
- Multer (загрузка изображений)

## 🎨 Дизайн

- **Основной цвет:** Зеленый (#2d5016, #1a3d0a)
- **Акцентный цвет:** Золотой (#d4af37, #b8941e)
- **Тема:** Темная с размытым фоном
- **Шрифты:** System fonts

## 📱 Поддерживаемые устройства

Оптимизировано для планшетов:
- 8-11 дюймов
- Landscape ориентация
- Xiaomi/Redmi Pad и аналогичные

## 🔧 Обслуживание

### Резервное копирование:
```bash
pg_dump -U halalhall halalhall > backup.sql
```

### Обновление:
```bash
# Frontend
cd frontend && npm run build
scp -r dist/* ubuntu@ip:/var/www/halalhall/

# Backend
cd backend
pm2 restart halalhall-api
```

### Логи:
```bash
pm2 logs halalhall-api
tail -f /var/log/nginx/halalhall-error.log
```

## 📄 Лицензия

Proprietary - Все права защищены

## 👨‍💻 Разработка

Для вопросов и поддержки обращайтесь к администратору проекта.

---

**Приятного использования! 🎉**
