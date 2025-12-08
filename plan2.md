🚀 ПРОМПТ ДЛЯ РАЗРАБОТКИ TELEGRAM MINI APP "BOOKLY"
📋 ОБЩАЯ СТРУКТУРА ПРОЕКТА
Создай Telegram Mini App для онлайн-библиотеки книг со следующей архитектурой:
bookly/
├── frontend/          # React + TypeScript + Vite + Tailwind
├── backend/           # Node.js + Express + Prisma + PostgreSQL  
└── telegram-bot/      # Python + python-telegram-bot

🎨 ДИЗАЙН-СИСТЕМА
Цветовая палитра
Светлая тема:

Primary: #8B7FF5 (мягкий фиолетовый)
Secondary: #FF9B9B (персиковый)
Accent: #FFE45E (солнечный желтый)
Background: #F8F9FE (светло-серый с голубым оттенком)
Cards: #FFFFFF с легкой тенью
Text Primary: #1A1A2E
Text Secondary: #6B7280

Темная тема:

Primary: #9B8AFF (светло-фиолетовый)
Secondary: #FF6B9D (розовый)
Accent: #FFD93D (золотистый)
Background: #0F0F1E (глубокий темно-синий)
Cards: #1A1A2E с неоновым свечением
Text Primary: #FFFFFF
Text Secondary: #9CA3AF

Визуальные эффекты
Градиенты:
css/_ Hero градиент _/
background: linear-gradient(135deg, #8B7FF5 0%, #FF9B9B 100%);

/_ Карточка книги (hover) _/
background: linear-gradient(180deg, transparent 0%, rgba(139,127,245,0.1) 100%);

/_ Неоновое свечение (темная тема) _/
box-shadow: 0 0 20px rgba(155,138,255,0.3);
Анимации:

Плавное появление карточек: opacity + translateY (stagger по 0.1s)
Hover эффект книг: scale(1.05) + shadow увеличение
Skeleton loading для обложек
Ripple эффект на кнопках

Bento-компоненты
Размеры карточек:

Desktop: Book card = 220px × 320px
Mobile: Book card = 140px × 200px
Popup Desktop: max-width: 1000px
Popup Mobile: max-width: 350px

Скругления:
cssborder-radius: 24px; /_ Основные карточки _/
border-radius: 16px; /_ Кнопки и инпуты _/
border-radius: 12px; /_ Мелкие элементы _/


🎯 ЭТАП 1: ИНИЦИАЛИЗАЦИЯ ПРОЕКТА
Шаг 1.1: Создание Frontend
Промпт:
Создай React приложение с Vite и TypeScript для Telegram Mini App со следующей структурой:

frontend/
├── src/
│   ├── app/                  # Providers, routing
│   ├── pages/                # HomePage, FavoritesPage, MyBooksPage, ProfilePage
│   ├── widgets/              # BookGrid, BookModal, ProfileSidebar
│   ├── features/             # auth, book-reader, payment, favorites
│   ├── entities/             # book, user (store, types, api)
│   └── shared/               # ui, api, lib, config
├── tailwind.config.js
├── vite.config.ts
└── package.json

Установи зависимости:
- React 18.3, TypeScript 5.3, Vite 5.0
- Tailwind CSS 3.4
- Zustand (state management)
- TanStack Query (server state)
- React Router DOM
- Axios
- React Hook Form + Zod
- Framer Motion (анимации)
- React Hot Toast (уведомления)

Настрой Tailwind с кастомной темой:
- Primary: #8B7FF5
- Secondary: #FF9B9B
- Accent: #FFE45E
- Background Light: #F8F9FE
- Background Dark: #0F0F1E
- Border radius: 24px для карточек, 16px для кнопок

Настрой Vite для поддержки Telegram Web App:
- Добавь в index.html скрипт: https://telegram.org/js/telegram-web-app.js
- Создай типы для window.Telegram.WebApp
Шаг 1.2: Создание Backend
Промпт:
Создай Node.js + Express backend со следующей структурой:

backend/
├── src/
│   ├── routes/           # auth, books, payment, user, favorites
│   ├── controllers/      # Логика обработки запросов
│   ├── services/         # Бизнес-логика
│   ├── middleware/       # Auth, error handling, validation
│   ├── prisma/
│   │   └── schema.prisma # База данных
│   ├── utils/            # Helpers
│   └── server.ts
├── .env.example
└── package.json

Установи зависенции:
- Express, TypeScript
- Prisma, @prisma/client
- JWT: jsonwebtoken
- bcrypt (хеширование паролей)
- crypto (для Telegram auth валидации)
- cors, helmet, express-rate-limit
- dotenv

Создай Prisma схему со следующими моделями:
- User (id, email, password, name, avatar, telegram_id, twoFactorSecret)
- Book (id, title, author, description, coverUrl, pdfUrl, price, isFree, pageCount)
- Genre (id, name) - связь many-to-many с Book
- Favorite (userId, bookId) - связь с User и Book
- Purchase (id, userId, bookId, amount, paymentMethod, status, transactionId)
- ReadingProgress (userId, bookId, currentPage, progress, lastReadAt)
- NotificationSettings (userId, newBooksInGenre, unfinishedReminder, frequency, telegramEnabled)
Шаг 1.3: Создание Telegram Bot
Промпт:
Создай Python Telegram бота со следующей структурой:

telegram-bot/
├── bot.py              # Основной файл бота
├── handlers/           # Обработчики команд
├── notifications.py    # Система уведомлений
├── scheduler.py        # APScheduler для отложенных уведомлений
└── requirements.txt

Установи зависимости:
- python-telegram-bot
- APScheduler
- psycopg2 (для работы с PostgreSQL)
- requests
- python-dotenv

Реализуй команды:
- /start - Приветствие + кнопка "Открыть библиотеку" (web_app)
- /library - Открыть Mini App на странице "Мои книги"
- /help - Справка

Настрой WebAppInfo для всех кнопок, указывающих на MINI_APP_URL

🎨 ЭТАП 2: ИНТЕГРАЦИЯ TELEGRAM WEB APP API
Шаг 2.1: Инициализация Telegram SDK
Промпт:
Создай файл frontend/src/shared/lib/telegram-app.ts

Реализуй функцию initTelegramApp() которая:
1. Проверяет доступность window.Telegram.WebApp
2. Вызывает tg.ready() и tg.expand()
3. Настраивает цвета: setHeaderColor('#8B7FF5'), setBackgroundColor()
4. Применяет тему Telegram через tg.themeParams к CSS переменным
5. Слушает события themeChanged и viewportChanged
6. Возвращает объект с данными: user, startParam, colorScheme, platform

Создай типы TypeScript для всех методов Telegram WebApp API:
- MainButton, BackButton, SettingsButton
- HapticFeedback
- CloudStorage
- showPopup, showAlert, showConfirm
- openInvoice, openLink

Экспортируй константу tg = window.Telegram.WebApp для использования в компонентах
Шаг 2.2: Создание Helpers для Telegram UI
Промпт:
Создай следующие утилиты:

1. telegram-main-button.ts - класс TelegramMainButton:
   - show(text, onClick) - показать кнопку
   - hide() - скрыть
   - showProgress() / hideProgress()
   - enable() / disable()

2. haptic.ts - объект haptic с методами:
   - light(), medium(), heavy() - вибрация
   - success(), warning(), error() - уведомления
   - selection() - выбор элемента

3. telegram-dialogs.ts - функции:
   - alert(message) - простой алерт
   - confirm(message) - подтверждение  
   - popup(params) - кастомный popup с кнопками

4. telegram-storage.ts - обертка над CloudStorage:
   - set(key, value) - сохранить
   - get(key) - получить
   - remove(key) - удалить
   - getKeys() - список ключей

Все функции должны возвращать Promise и использовать haptic feedback
Шаг 2.3: Интеграция в App компонент
Промпт:
В frontend/src/app/App.tsx:

1. При монтировании вызови initTelegramApp()
2. Примени тему Telegram к document.documentElement (добавь/убери класс 'dark')
3. Создай компонент TelegramBackButton, который:
   - Показывает tg.BackButton на всех страницах кроме главной
   - При клике делает navigate(-1) с haptic.light()
4. Создай компонент TelegramSettingsButton:
   - Показывает tg.SettingsButton
   - При клике открывает /profile

Оберни приложение в providers:
- TelegramProvider (контекст с tg данными)
- QueryClientProvider (TanStack Query)
- Router (React Router)

🔐 ЭТАП 3: СИСТЕМА АВТОРИЗАЦИИ
Шаг 3.1: Backend - Валидация Telegram InitData
Промпт:
Создай backend/src/middleware/telegram-auth.ts

Реализуй функцию validateTelegramWebAppData(initData: string):
1. Парси initData как URLSearchParams
2. Извлеки hash, удали его из параметров
3. Отсортируй параметры и создай data_check_string
4. Создай secret_key = HMAC-SHA256('WebAppData', BOT_TOKEN)
5. Вычисли calculated_hash = HMAC-SHA256(data_check_string, secret_key)
6. Сравни calculated_hash с оригинальным hash
7. Проверь auth_date (не старше 24 часов)

Создай middleware telegramAuthMiddleware:
1. Читай initData из заголовка X-Telegram-Init-Data
2. Валидируй через validateTelegramWebAppData()
3. Извлеки user из параметра 'user' (JSON.parse)
4. Добавь user в req.telegramUser
5. При ошибке возвращай 401 Unauthorized
Шаг 3.2: Backend - Auth Routes
Промпт:
Создай backend/src/routes/auth.routes.ts

Реализуй эндпоинты:

POST /api/auth/telegram:
1. Получи initData из body
2. Валидируй через validateTelegramWebAppData()
3. Извлеки telegram_id из user
4. Найди или создай пользователя в БД:
   - Если есть с таким telegram_id → логин
   - Если нет → создай (email = telegram_id@bookly.internal)
5. Сгенерируй JWT токены (access + refresh)
6. Верни токены + user данные

POST /api/auth/refresh:
1. Проверь refresh token
2. Выдай новый access token

POST /api/auth/logout:
1. Инвалидируй refresh token
Шаг 3.3: Frontend - Auth Flow
Промпт:
Создай frontend/src/features/auth/model/use-auth.ts

Реализуй хук useAuth():
1. При монтировании приложения отправь tg.initData на /api/auth/telegram
2. Сохрани токены в localStorage
3. Сохрани user в Zustand store
4. Настрой axios interceptor:
   - Добавляй X-Telegram-Init-Data в каждый запрос
   - Добавляй Authorization: Bearer {access_token}
   - При 401 пробуй обновить через /api/auth/refresh
   - Если refresh failed → logout и tg.close()

Создай auth store (Zustand):
- State: user, isAuthenticated, isLoading
- Actions: login, logout, updateUser

📚 ЭТАП 4: ОСНОВНОЙ ФУНКЦИОНАЛ - КНИГИ
Шаг 4.1: Backend - Books API
Промпт:
Создай backend/src/routes/books.routes.ts

Реализуй эндпоинты:

GET /api/books?genre=&search=&page=&limit=:
1. Фильтрация по жанру (через Prisma include)
2. Поиск по названию и автору (через Prisma contains)
3. Пагинация (skip, take)
4. Верни: books[], total, currentPage, totalPages

GET /api/books/:id:
1. Найди книгу с жанрами
2. Если авторизован - проверь isFavorite и isPurchased
3. Верни полную информацию о книге

GET /api/books/:id/fragment:
1. Проверь права доступа (только первые 15 страниц)
2. Верни PDF base64 или URL с ограничением

GET /api/genres:
1. Верни все жанры с количеством книг
Шаг 4.2: Frontend - Home Page
Промпт:
Создай frontend/src/pages/HomePage/HomePage.tsx

Реализуй:
1. Header (fixed, backdrop-blur):
   - Logo "Bookly"
   - Search input с дебаунсом 500ms
   - Avatar/Login кнопка

2. Фильтры жанров (horizontal scroll):
   - Pills с активным состоянием
   - Клик = запрос с фильтром + haptic.selection()

3. Book Grid (Bento Layout):
   - Desktop: grid-cols-3
   - Mobile: grid-cols-2
   - Gap: 16px
   - Infinite scroll или пагинация

4. BookCard компонент:
   - Обложка (aspect-ratio 2/3)
   - Badge "Бесплатно" / "299₽"
   - Иконка ❤️ (избранное) с haptic.light()
   - Hover: scale(1.05) + shadow
   - onClick: открыть BookModal + haptic.medium()

Используй TanStack Query для загрузки книг:
- useInfiniteQuery для бесконечного скролла
- Включи suspense и error boundaries
- Skeleton loader при загрузке
Шаг 4.3: Frontend - Book Modal
Промпт:
Создай frontend/src/widgets/BookModal/BookModal.tsx

Реализуй модальное окно с:
1. Layout:
   - Desktop: flex row (обложка слева, инфо справа), max-width 1000px
   - Mobile: flex column, max-width 350px
   - Кнопка закрытия [×] в правом верхнем углу

2. Контент:
   - Обложка книги (220x320 desktop, 140x200 mobile)
   - Название, автор
   - Описание (2-3 строки)
   - Жанры (pills)

3. Действия:
   - Кнопка "Читать фрагмент" → navigate('/reader/{id}?fragment=true')
   - Кнопка "Читать" / "Купить":
     * Если бесплатная → добавить в myBooks и открыть reader
     * Если платная и не куплена → открыть PaymentModal
     * Если куплена → открыть reader

4. Используй Headless UI Dialog для доступности
5. Добавь Framer Motion анимации при открытии/закрытии
6. При успешных действиях показывай toast уведомления

💳 ЭТАП 5: СИСТЕМА ОПЛАТЫ
Шаг 5.1: Backend - Payment с Telegram Stars
Промпт:
Создай backend/src/routes/payment.routes.ts

Используй Grammy (Telegram Bot Framework) для создания invoice.

POST /api/payment/create-invoice:
1. Получи bookId и userId из req
2. Найди книгу в БД
3. Создай invoice через bot.api.createInvoiceLink():
   - title: book.title
   - description: "Автор: " + book.author
   - payload: JSON.stringify({ bookId, userId })
   - currency: 'XTR' (Telegram Stars)
   - prices: [{ label: book.title, amount: book.price * 100 }]
   - photo_url: book.coverUrl
4. Верни invoiceLink клиенту

POST /api/payment/webhook (для Telegram):
1. Обработай pre_checkout_query:
   - Подтверди через bot.api.answerPreCheckoutQuery(query_id, true)
2. Обработай successful_payment:
   - Парси payload (bookId, userId)
   - Создай Purchase в БД (status: completed)
   - Отправь пользователю уведомление с кнопкой "Открыть книгу"

Настрой webhook URL в Telegram Bot API
Шаг 5.2: Frontend - Payment Modal
Промпт:
Создай frontend/src/features/payment/ui/PaymentModal.tsx

Реализуй модальное окно:
1. Отображай информацию о книге (мини-превью)
2. Покажи цену крупно
3. Кнопка "Оплатить через Telegram Stars"
4. При клике:
   - Запроси /api/payment/create-invoice
   - Открой tg.openInvoice(invoiceLink, callback)
   - В callback обработай статусы:
     * 'paid' → haptic.success() + popup "Книга куплена!" + navigate to reader
     * 'cancelled' → haptic.warning() + закрыть модалку
     * 'failed' → haptic.error() + показать alert с ошибкой

Используй Telegram Main Button вместо custom кнопки:
- При открытии модалки: mainButton.show('Оплатить {price}₽', handlePayment)
- При закрытии: mainButton.hide()
- Во время обработки: mainButton.showProgress()

📖 ЭТАП 6: READER (ЧТЕНИЕ КНИГ)
Шаг 6.1: Backend - Reader API
Промпт:
Создай backend/src/routes/reader.routes.ts

GET /api/books/:id/read:
1. Проверь права доступа:
   - Если книга бесплатная → разрешить
   - Если платная → проверить Purchase (userId, bookId, status: completed)
2. Верни PDF URL (signed URL если используешь S3)
3. Или верни base64 encoded PDF по частям (chunked)

POST /api/progress/:bookId:
1. Сохрани текущую страницу и процент прочтения
2. Обнови lastReadAt
3. Используй upsert (создай или обнови)

GET /api/progress/:bookId:
1. Верни сохраненный прогресс (currentPage, progress)
Шаг 6.2: Frontend - Reader Component
Промпт:
Создай frontend/src/features/book-reader/ui/Reader.tsx

Реализуй:
1. Layout:
   - Header: Back button (используй tg.BackButton), название книги, settings
   - Main: PDF Viewer область
   - Footer: Навигация страниц + progress bar

2. PDF Rendering:
   - Используй react-pdf или PDF.js
   - Загружай страницы по мере скролла (lazy loading)
   - Кеширование отрендеренных страниц

3. Навигация:
   - Swipe влево/вправо (mobile) - используй react-swipeable
   - Кнопки [←] [→] (desktop)
   - Progress bar внизу (заполнение = % прочитанного)

4. Settings Modal:
   - Размер шрифта: S / M / L / XL
   - Шрифт: Serif / Sans / Mono
   - Тема: Light / Dark / Sepia
   - Яркость: slider
   - Сохраняй настройки в tg.CloudStorage

5. Автосохранение прогресса:
   - Debounced запрос при смене страницы (500ms)
   - POST /api/progress/:bookId

6. Оптимизация:
   - Отключи body scroll
   - Используй transform для плавных переходов
   - Preload следующей/предыдущей страницы

⭐ ЭТАП 7: ИЗБРАННОЕ И МОИ КНИГИ
Шаг 7.1: Backend - Favorites & My Books
Промпт:
Создай backend/src/routes/favorites.routes.ts

GET /api/favorites:
1. Верни список избранных книг пользователя
2. Include book данные и жанры
3. Сортировка по createdAt DESC

POST /api/favorites/:bookId:
1. Создай запись Favorite (userId, bookId)
2. Handle duplicate (unique constraint) - игнорировать

DELETE /api/favorites/:bookId:
1. Удали запись из Favorite

Создай backend/src/routes/my-books.routes.ts

GET /api/my-books:
1. Найди все книги где:
   - User has Purchase (completed) OR
   - Book isFree AND user has ReadingProgress
2. Include progress данные
3. Группировка по статусу:
   - reading: progress > 0 AND < 100
   - finished: progress = 100
   - purchased: все купленные
Шаг 7.2: Frontend - Favorites Page
Промпт:
Создай frontend/src/pages/FavoritesPage/FavoritesPage.tsx

Реализуй:
1. Header с заголовком "⭐ Избранное"
2. Фильтры:
   - По жанру (dropdown)
   - Сортировка: По дате добавления / По названию / По автору
3. Bento Grid аналогично HomePage
4. Пустое состояние:
   - Иконка 📚
   - Текст "Здесь пока пусто"
   - Описание "Добавляйте книги в избранное"
5. Анимированное удаление из списка при снятии ❤️
Шаг 7.3: Frontend - My Books Page
Промпт:
Создай frontend/src/pages/MyBooksPage/MyBooksPage.tsx

Реализуй:
1. Header с заголовком "📚 Мои книги"
2. Табы (Pills):
   - Все
   - Читаю (progress > 0 && < 100)
   - Прочитано (progress = 100)
   - Куплено (все purchased)
3. Book Cards с дополнительной информацией:
   - Progress bar внизу карточки
   - Процент прочтения: "60%"
   - Badge "Прочитано" для 100%
4. Клик на карточку → открыть reader на последней странице
5. Long press → контекстное меню:
   - Удалить из библиотеки (с confirm)
   - Добавить/убрать из избранного

Используй react-long-press для long press detection

👤 ЭТАП 8: ПРОФИЛЬ И НАСТРОЙКИ
Шаг 8.1: Backend - Profile API
Промпт:
Создай backend/src/routes/user.routes.ts

GET /api/user/profile:
1. Верни данные текущего пользователя
2. Include: NotificationSettings

PATCH /api/user/profile:
1. Обнови name, avatar (URL после загрузки)
2. Валидация через Zod

POST /api/user/avatar:
1. Прими multipart/form-data
2. Загрузи в S3/Cloudflare R2
3. Верни URL
4. Обнови user.avatar в БД

GET /api/user/purchases:
1. Верни историю покупок
2. Include book данные
3. Сортировка по createdAt DESC

PATCH /api/notifications/settings:
1. Обнови настройки уведомлений пользователя
2. Fields: newBooksInGenre, unfinishedReminder, specialOffers, frequency
Шаг 8.2: Frontend - Profile Page
Промпт:
Создай frontend/src/pages/ProfilePage/ProfilePage.tsx

Layout:
1. Desktop: Sidebar (300px) + Content Area
2. Mobile: Full width с табами

Sidebar меню:
- Аватар + имя пользователя
- Мои покупки
- Вход и безопасность
- Уведомления
- Помощь
- Выйти (красная кнопка)

Реализуй секции:

1. Мои покупки:
   - Список карточек с книгами
   - Для каждой: название, автор, цена, дата покупки
   - Клик → открыть книгу

2. Вход и безопасность:
   - Email (показать, кнопка "Изменить")
   - Пароль (•••••••, кнопка "Изменить")
   - 2FA (toggle + setup modal с QR кодом)
   - Привязанные аккаунты (Telegram: @username, кнопка "Отвязать")

3. Уведомления:
   - Чекбоксы для каждого типа уведомлений
   - Radio buttons для частоты (daily / 3days / weekly)
   - Toggle для Telegram уведомлений

4. Помощь:
   - Bento карточки с информацией
   - Accordion для раскрытия деталей
   - Контакты поддержки

Используй React Hook Form для всех форм редактирования

🤖 ЭТАП 9: TELEGRAM BOT - УВЕДОМЛЕНИЯ
Шаг 9.1: Система уведомлений
Промпт:
Создай telegram-bot/notifications.py

Реализуй функции отправки уведомлений:

1. send_inactive_reminder(user_id, genre, new_books_count):
   - Текст: "📚 Привет! Мы скучали по тебе. В библиотеке появилось {count} новых книг в жанре {genre}"
   - Кнопка: "Открыть библиотеку" (web_app → MINI_APP_URL)
   - Условие: user неактивен 3+ дня

2. send_unfinished_reminder(user_id, book_title, book_id, progress):
   - Текст: "📖 Вы остановились на {progress}% книги «{title}». Продолжить чтение?"
   - Кнопка: "Продолжить чтение" (web_app → /reader/{id})
   - Условие: progress > 10% AND < 100% AND lastReadAt > 7 дней

3. send_new_book_notification(user_id, book, genre):
   - Отправь фото обложки (book.coverUrl)
   - Caption: "🆕 Новая книга в жанре {genre}!\n📕 {title}\n✍️ {author}\n💰 {price или 'Бесплатно'}"
   - Кнопка: "Посмотреть книгу" (web_app → ?startapp=book_{id})
   - Условие: жанр в favorites пользователя

Создай telegram-bot/scheduler.py

Используй APScheduler для:
1. Проверка неактивных пользователей (каждый день в 10:00)
2. Напоминания о недочитанных книгах (каждый день в 20:00)
3. Уведомления о новых книгах (при добавлении в БД)

Подключи PostgreSQL для получения данных о пользователях и их настройках

🎨 ЭТАП 10: UI/UX ПОЛИРОВКА
Шаг 10.1: Темная тема
Промпт:
Реализуй переключение темы:

1. Применяй Telegram theme автоматически:
   - Light theme: bg #F8F9FE, text #1A1A2E
   - Dark theme: bg #0F0F1E, text #FFFFFF, cards с неоновым свечением

2. Создай CSS переменные под обе темы в tailwind.config.js

3. Слушай tg.onEvent('themeChanged') и переключай класс .dark на <html>

4. Сохраняй предпочтение пользователя в CloudStorage (если переключил вручную)
Шаг 10.2: Анимации и transitions
Промпт:
Добавь анимации с Framer Motion:

1. Карточки книг:
   - Появление: opacity 0→1 + translateY 20→0
   - Stagger по 0.1s для каждой карточки
   - Hover: scale 1 → 1.05

2. Модальные окна:
   - Открытие: opacity 0→1 + scale 0.95→1
   - Закрытие: reverse анимация
   - Overlay: opacity 0→0.5

3. Страницы:
   - Переходы между страницами: fade + slide
   - Exit animation перед сменой роута

4. Skeleton loading:
   - Пульсирующая анимация для загрузки обложек
   - Shimmer эффект для текста

Все анимации должны быть <300ms для отзывчивости
Шаг 10.3: Адаптивность и жесты
Промпт:
Оптимизируй для мобильных устройств:

1. Touch gestures:
   - Swipe для листания книг в reader (react-swipeable)
   - Pull-to-refresh на главной странице
   - Long press для контекстного меню

2. Responsive breakpoints:
   - Mobile: < 640px (2 колонки книг)
   - Tablet: 640-1024px (2 колонки)
   - Desktop: > 1024px (3 колонки)

3. Safe areas для iOS:
   - padding: env(safe-area-inset-*)
   - Учитывай tg.viewportHeight для клавиатуры

4. Performance:
   - Lazy loading изображений
   - Virtual scrolling для больших списков (react-window)
   - Code splitting по роутам

5. Отключи bounce эффект:
   - overscroll-behavior: none
   - Фиксируй body при открытых модалках

🚀 ЭТАП 11: ДЕПЛОЙ
Шаг 11.1: Подготовка к деплою
Промпт:
Настрой окружение для деплоя:

1. Frontend (Vercel):
   - Создай vercel.json с rewrites для SPA
   - Настрой environment variables в Vercel Dashboard

Добавь X-Frame-Options для Telegram WebView
Build command: npm run build
Output directory: dist


Backend (Railway/Render):

Создай Dockerfile для Node.js приложения
Настрой DATABASE_URL для PostgreSQL
Настрой все environment variables
Health check endpoint: GET /health


Telegram Bot (Railway/Heroku):

Создай Dockerfile для Python приложения
Настрой webhook URL для payment
requirements.txt с pinned версиями


База данных (Supabase/Railway):

PostgreSQL 14+
Настрой connection pooling
Создай backup стратегию




### Шаг 11.2: CI/CD

**Промпт:**
Настрой GitHub Actions для:

Frontend:

Запуск тестов
Build приложения
Деплой на Vercel при push в main


Backend:

Запуск тестов
Lint и type-check
Prisma migrations
Деплой на Railway при push в main


Telegram Bot:

Проверка синтаксиса Python
Запуск тестов
Деплой при push в main



Добавь environments: development, staging, production

---

## ✅ ФИНАЛЬНЫЙ ЧЕКЛИСТ

**Промпт для проверки готовности:**
Проверь что реализовано:
Frontend:

 Telegram Web App SDK интегрирован
 Все страницы адаптивны (mobile + desktop)
 Темная/светлая тема работает
 Все анимации плавные (<300ms)
 Main Button используется вместо custom кнопок
 Back Button интегрирован в навигацию
 Haptic Feedback на всех действиях
 CloudStorage для настроек reader
 Error boundaries и loading states

Backend:

 Telegram initData валидация работает
 JWT auth настроен
 Все CRUD операции для книг
 Payment через Telegram Stars
 Webhook для подтверждения оплаты
 Rate limiting настроен
 CORS правильно сконфигурирован

Telegram Bot:

 Команды /start, /library работают
 WebApp кнопки указывают на правильный URL
 Система уведомлений запущена
 APScheduler настроен
 Webhook для payments работает

Деплой:

 Frontend на Vercel
 Backend на Railway/Render
 Bot на Railway/Heroku
 PostgreSQL настроен
 Все environment variables установлены
 SSL сертификаты работают
 Custom domain настроен (опционально)


---

## 📝 ЧТО ПОТРЕБУЕТСЯ ОТ ТЕБЯ

### 🔑 API Keys и Токены

1. **Telegram Bot Token**
   - Получить: @BotFather → /newbot
   - Формат: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`
   - Где использовать: Backend (BOT_TOKEN), Telegram Bot
   - Как создать Mini App: @BotFather → /newapp → указать URL

2. **JWT Secrets**
   - Сгенерируй случайные строки (32+ символа)
   - Нужно 2 секрета:
     * `JWT_SECRET` - для access token
     * `JWT_REFRESH_SECRET` - для refresh token
   - Генерация: `openssl rand -base64 32`

3. **PostgreSQL Database URL**
   - Где получить: Supabase / Railway / Render / Neon
   - Формат: `postgresql://user:password@host:5432/database`
   - Для разработки: Docker или локальный PostgreSQL

4. **ЮKassa (опционально, если нужна альтернатива Telegram Stars)**
   - Регистрация: https://yookassa.ru
   - Получить: Shop ID и Secret Key
   - Настроить webhook URL
   - Не обязательно, если используешь только Telegram Payments

5. **USDT Wallets (опционально)**
   - TON Wallet Address
   - TRC20 Wallet Address
   - Не обязательно на MVP

6. **S3/R2 для хранения файлов**
   - AWS S3 или Cloudflare R2
   - Получить: Access Key ID, Secret Access Key, Bucket Name
   - Альтернатива: хранить файлы локально на сервере (не рекомендуется для production)

### 📦 Сервисы для регистрации

1. **Vercel** (Frontend hosting)
   - Регистрация: https://vercel.com
   - Подключить GitHub репозиторий
   - Бесплатный план: достаточно для MVP

2. **Railway / Render** (Backend + Bot hosting)
   - Railway: https://railway.app (рекомендую)
   - Render: https://render.com
   - Бесплатный план: есть, но с ограничениями

3. **Supabase / Railway / Neon** (PostgreSQL)
   - Supabase: https://supabase.com (рекомендую для MVP)
   - Railway: встроенная PostgreSQL
   - Neon: https://neon.tech
   - Бесплатный план: 500MB на Supabase

4. **Cloudflare R2** (File storage, опционально)
   - https://cloudflare.com/r2
   - Альтернатива: AWS S3, Backblaze B2

### 📚 Контент для наполнения

1. **Книги (PDF файлы)**
   - Минимум 20-30 книг для демо
   - Обложки (JPG/PNG, рекомендую 600x900px)
   - Описания книг (2-3 предложения)
   - Авторы, жанры
   - Цены (или отметь как бесплатные)

2. **Дизайн ассеты**
   - Logo "Bookly" (SVG)
   - Placeholder для обложек без изображения
   - Иконки (или используй Lucide React)

### 🔧 Локальная разработка

1. **Node.js** - версия 20.x
2. **Python** - версия 3.11+
3. **PostgreSQL** - версия 14+
4. **Git**
5. **VS Code** (рекомендованные расширения):
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense
   - Prisma

### 📋 Environment Variables Template

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3000/api
VITE_MINI_APP_URL=https://t.me/bookly_bot/app
```

**Backend (.env):**
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
TELEGRAM_BOT_TOKEN=1234567890:ABC...
FRONTEND_URL=https://bookly.vercel.app

# Опционально
YOOKASSA_SHOP_ID=
YOOKASSA_SECRET_KEY=
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

**Telegram Bot (.env):**
```env
TELEGRAM_BOT_TOKEN=1234567890:ABC...
DATABASE_URL=postgresql://...
MINI_APP_URL=https://bookly.vercel.app
BACKEND_API_URL=https://api.bookly.com
```

---

## 🎯 ПОСЛЕДОВАТЕЛЬНОСТЬ ДЕЙСТВИЙ

### Шаг 1: Подготовка окружения
1. Создай Telegram бота через @BotFather
2. Зарегистрируйся на Vercel, Railway, Supabase
3. Сгенерируй JWT secrets
4. Склонируй стартовый шаблон проекта

### Шаг 2: Локальная разработка
1. Запусти PostgreSQL локально
2. Выполни Prisma migrations
3. Запусти Backend (port 3000)
4. Запусти Frontend (port 5173)
5. Настрой ngrok для тестирования Telegram WebApp

### Шаг 3: Тестирование
1. Открой бота в Telegram
2. Нажми кнопку "Открыть библиотеку"
3. Проверь авторизацию
4. Протестируй все функции

### Шаг 4: Деплой
1. Deploy Frontend на Vercel
2. Deploy Backend на Railway
3. Deploy Bot на Railway
4. Настрой production DATABASE_URL
5. Установи все environment variables
6. Обнови Telegram Bot webhook URL
7. Обнови Mini App URL в @BotFather

Готово! 🚀