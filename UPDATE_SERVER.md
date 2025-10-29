# Инструкция по обновлению приложения на сервере

## Данные для подключения
- IP-адрес сервера: 194.32.142.53
- IPv6-адрес сервера: 2a00:5da0:1000:1::2b46
- Пользователь: ubuntu
- Для получения root-привилегий: `sudo -i`

## Шаги для обновления приложения

### 1. Подключение к серверу
```bash
ssh ubuntu@194.32.142.53
```

### 2. Переключение на пользователя halalhall
```bash
sudo su - halalhall
```

### 3. Переход в директорию проекта
```bash
cd /home/halalhall/app/restaurant-menu
```

### 4. Обновление кода из репозитория (если используется Git)
```bash
git pull origin main
```

### 5. Обновление переменных окружения
Убедитесь, что файл `.env.production` содержит правильные настройки:
```
VITE_API_URL=http://194.32.142.53
```

### 6. Пересборка и перезапуск контейнеров
```bash
docker-compose -f docker-compose.prod.yml build frontend
docker-compose -f docker-compose.prod.yml up -d
```

### 7. Проверка статуса контейнеров
```bash
docker-compose -f docker-compose.prod.yml ps
```

### 8. Проверка логов при необходимости
```bash
# Логи фронтенда
docker-compose -f docker-compose.prod.yml logs frontend

# Логи бэкенда
docker-compose -f docker-compose.prod.yml logs backend

# Логи Nginx
docker-compose -f docker-compose.prod.yml logs nginx
```

## Решение возможных проблем

### Проблема с доступом к API
Если возникают проблемы с доступом к API, проверьте:
1. Правильность настройки `VITE_API_URL` в `.env.production`
2. Настройки проксирования в `nginx/nginx.prod.conf`
3. Работоспособность бэкенд-сервера

### Проблема с базой данных
Если возникают проблемы с базой данных:
```bash
# Проверка состояния контейнера с базой данных
docker-compose -f docker-compose.prod.yml ps postgres

# Проверка логов базы данных
docker-compose -f docker-compose.prod.yml logs postgres
```

### Перезапуск всех контейнеров
В случае серьезных проблем можно перезапустить все контейнеры:
```bash
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

## Важные замечания
- Не забудьте обновить SSL-сертификаты при необходимости
- После обновления проверьте работу всех основных функций приложения
- Убедитесь, что локализация работает корректно (переключение между языками)