# 📤 Руководство по загрузке приложения на VPS

## Сервер готов! Теперь нужно загрузить приложение.

**IP сервера:** 194.32.142.53  
**Пользователь:** ubuntu  
**Директория приложения:** /home/halalhall/app

---

## 🚀 Способ 1: Автоматическая загрузка (САМЫЙ ПРОСТОЙ)

### Запустите PowerShell скрипт:

```powershell
cd "C:\Users\Admin\Documents\Halal hail\restaurant-menu"
.\auto-deploy.ps1
```

Скрипт автоматически:
- ✅ Создаст архив проекта
- ✅ Загрузит на VPS
- ✅ Распакует файлы
- ✅ Настроит права доступа
- ✅ Создаст SSL сертификаты
- ✅ Подготовит .env.production

**После выполнения скрипта:**
```bash
ssh ubuntu@194.32.142.53
sudo su - halalhall
cd /home/halalhall/app
nano .env.production  # Измените пароли!
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📁 Способ 2: Через FileZilla (ВИЗУАЛЬНЫЙ)

### Шаг 1: Настройка FileZilla

1. Откройте FileZilla
2. **Файл → Менеджер сайтов → Новый сайт**
3. Настройки:
   - **Протокол:** SFTP
   - **Хост:** 194.32.142.53
   - **Порт:** 22
   - **Тип входа:** Нормальный
   - **Пользователь:** ubuntu
   - **Пароль:** ваш пароль
4. Нажмите **Соединиться**

### Шаг 2: Загрузка файлов

**Слева (локальный):** `C:\Users\Admin\Documents\Halal hail\restaurant-menu`  
**Справа (сервер):** `/home/halalhall/app`

**НЕ загружайте эти папки:**
- ❌ `node_modules/`
- ❌ `.git/`
- ❌ `dist/`
- ❌ `build/`

**Загрузите все остальное**

### Шаг 3: Установка прав

После загрузки выполните на сервере:

```bash
ssh ubuntu@194.32.142.53
sudo chown -R halalhall:halalhall /home/halalhall/app
sudo chmod +x /home/halalhall/app/scripts/*.sh
```

---

## 🔧 Способ 3: Через Git (ПРОФЕССИОНАЛЬНЫЙ)

### Шаг 1: Загрузите проект на GitHub

**На вашем компьютере:**

```powershell
cd "C:\Users\Admin\Documents\Halal hail\restaurant-menu"

# Инициализация Git
git init
git add .
git commit -m "Initial commit"

# Создайте репозиторий на github.com, затем:
git remote add origin https://github.com/ваш-username/halal-hall.git
git branch -M main
git push -u origin main
```

### Шаг 2: Клонируйте на сервер

**На сервере:**

```bash
ssh ubuntu@194.32.142.53
sudo su - halalhall
cd /home/halalhall/app

# Клонирование
git clone https://github.com/ваш-username/halal-hall.git .

# Если репозиторий приватный:
# git clone https://токен@github.com/ваш-username/halal-hall.git .
```

---

## ⚡ Способ 4: Через SCP (БЫСТРЫЙ)

### Вариант A: PowerShell скрипт

```powershell
cd "C:\Users\Admin\Documents\Halal hail\restaurant-menu"
.\upload-to-vps.ps1
```

### Вариант B: Git Bash скрипт

```bash
cd "/c/Users/Admin/Documents/Halal hail/restaurant-menu"
chmod +x scripts/upload-to-vps.sh
./scripts/upload-to-vps.sh
```

### Вариант C: Ручная команда

```powershell
# Создание архива
Compress-Archive -Path "C:\Users\Admin\Documents\Halal hail\restaurant-menu\*" -DestinationPath "$env:TEMP\halal-hall.zip"

# Загрузка
scp "$env:TEMP\halal-hall.zip" ubuntu@194.32.142.53:/tmp/

# Распаковка (на сервере)
ssh ubuntu@194.32.142.53
sudo unzip /tmp/halal-hall.zip -d /home/halalhall/app
sudo chown -R halalhall:halalhall /home/halalhall/app
```

---

## 🎯 Что делать после загрузки

### 1. Подключитесь к серверу

```bash
ssh ubuntu@194.32.142.53
```

### 2. Переключитесь на пользователя приложения

```bash
sudo su - halalhall
cd /home/halalhall/app
```

### 3. Настройте переменные окружения

```bash
cp .env.production.example .env.production
nano .env.production
```

**Обязательно измените:**
```env
DB_PASSWORD=ваш_сложный_пароль
JWT_SECRET=случайная_строка_минимум_32_символа
ADMIN_PASSWORD=ваш_админ_пароль
CORS_ORIGIN=http://194.32.142.53
VITE_API_URL=http://194.32.142.53/api
```

Сохраните: `Ctrl+O`, `Enter`, `Ctrl+X`

### 4. Создайте SSL сертификаты

```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/C=KZ/ST=Almaty/L=Almaty/O=HalalHall/CN=194.32.142.53"
```

### 5. Запустите приложение

```bash
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### 6. Проверьте статус

```bash
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

---

## ✅ Проверка работоспособности

Откройте в браузере:
- **Главная:** http://194.32.142.53
- **API:** http://194.32.142.53/api/health
- **Админка:** http://194.32.142.53/admin

### Проверка на сервере:

```bash
# Статус контейнеров
docker ps

# Проверка API
curl http://localhost/api/health

# Проверка базы данных
docker exec halal_hall_db pg_isready -U postgres

# Логи
docker-compose -f docker-compose.prod.yml logs backend
```

---

## 🔄 Обновление приложения

### Если использовали Git:

```bash
ssh ubuntu@194.32.142.53
sudo su - halalhall
cd /home/halalhall/app

git pull origin main
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### Если использовали другие способы:

Повторите процесс загрузки, затем:

```bash
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 🆘 Решение проблем

### Ошибка: "Permission denied"

```bash
sudo chown -R halalhall:halalhall /home/halalhall/app
sudo chmod +x /home/halalhall/app/scripts/*.sh
```

### Ошибка: "Port already in use"

```bash
# Проверьте что занимает порты
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Остановите конфликтующие сервисы
sudo systemctl stop apache2
sudo systemctl stop nginx
```

### Контейнеры не запускаются

```bash
# Проверьте логи
docker-compose -f docker-compose.prod.yml logs

# Пересоздайте контейнеры
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

---

## 📊 Рекомендации

| Способ | Скорость | Сложность | Обновления | Рекомендация |
|--------|----------|-----------|------------|--------------|
| **Автоматический скрипт** | ⚡⚡⚡ | ⭐ | Средне | ✅ Для первого раза |
| **FileZilla** | ⚡ | ⭐ | Сложно | ⚠️ Только если нет Git |
| **Git** | ⚡⚡⚡ | ⭐⭐ | Легко | ✅✅ Лучший вариант |
| **SCP** | ⚡⚡ | ⭐⭐ | Средне | ✅ Хорошая альтернатива |

**Мой совет:** Используйте **Git** для долгосрочной работы, или **автоматический скрипт** для быстрого старта.

---

## 🎉 Готово!

После успешной загрузки и запуска:
- Сайт: http://194.32.142.53
- Админка: http://194.32.142.53/admin (admin / admin123)
- **Не забудьте сменить пароль администратора!**
