# Bookly - Установка и запуск

## Подготовка к запуску

1. Установите Docker Desktop: https://www.docker.com/products/docker-desktop
2. Убедитесь, что Docker запущен

## Запуск приложения

### 1. Запуск локальной базы данных:

```bash
# В директории backend запустите:
docker-compose up -d
```

### 2. Настройка backend:

```bash
cd C:\Users\sskut\Desktop\Bookly\bookly\backend

# Установка зависимостей
npm install

# Генерация Prisma клиента
npx prisma generate

# Миграция базы данных
npx prisma migrate dev --name init

# Импорт книг
npx ts-node scripts/import-books.ts
```

### 3. Запуск backend:

```bash
npm run dev
```

### 4. Запуск frontend:

```bash
cd C:\Users\sskut\Desktop\Bookly\bookly\frontend

# Установка зависимостей
npm install

# Запуск сервера разработки
npm run dev
```

### 5. Запуск Telegram бота:

```bash
cd C:\Users\sskut\Desktop\Bookly\bookly\telegram-bot
py bot.py
```

## Адреса сервисов:

- Frontend: http://localhost:5173
- Backend: http://localhost:8080
- Telegram Bot: Через Telegram приложение

## Возможные проблемы:

Если Docker не запускается, убедитесь:
- Docker Desktop установлен и запущен
- Виртуализация включена в BIOS
- Нет конфликта с другими службами (например, WSL)

После завершения этих шагов все компоненты приложения должны работать корректно, и вы сможете видеть книги в интерфейсе.