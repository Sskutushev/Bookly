# Bookly - Telegram Mini App for Online Library

Bookly is a Telegram Mini App for online book reading with payment integration, user profiles, and personalized recommendations.

## 🚀 Project Structure

```
bookly/
├── frontend/          # React + TypeScript + Vite + Tailwind
├── backend/           # Node.js + Express + Prisma + PostgreSQL
└── telegram-bot/      # Python + python-telegram-bot
```

## 🛠️ Tech Stack

### Frontend
- React 18.3
- TypeScript 5.3
- Vite 5.0
- Tailwind CSS 3.4.0
- Zustand (state management)
- TanStack Query (server state)
- React Router DOM
- Axios
- React Hook Form + Zod validation
- Framer Motion (animations)
- React Hot Toast (notifications)

### Backend
- Node.js 20.x
- Express.js
- Prisma ORM
- PostgreSQL
- JWT (access + refresh tokens)
- bcrypt (password hashing)
- Telegram Bot API integration

### Telegram Bot
- Python 3.11
- python-telegram-bot
- APScheduler (for notifications)

## 📋 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Python 3.11+
- PostgreSQL
- Telegram Bot Token

### 1. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Update VITE_API_BASE_URL in .env
npm run dev
```

### 2. Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
cp .env.example .env
# Update DATABASE_URL, JWT secrets, and BOT_TOKEN in .env
npm run dev
```

### 3. Telegram Bot Setup

```bash
cd telegram-bot
pip install -r requirements.txt
cp .env.example .env
# Update BOT_TOKEN and MINI_APP_URL in .env
python bot.py
```

## 🔐 Environment Variables

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8080
```

### Backend (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/bookly"
JWT_SECRET="your-jwt-secret-key-here"
JWT_REFRESH_SECRET="your-jwt-refresh-secret-key-here"
BOT_TOKEN="your-telegram-bot-token-here"
PORT=8080
```

### Telegram Bot (.env)
```
BOT_TOKEN="your-telegram-bot-token-here"
MINI_APP_URL="https://your-mini-app-url.com"
```

## 🏗️ API Endpoints

### Auth
- `POST /api/auth/telegram` - Telegram authentication
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/register` - Register (non-Telegram)
- `POST /api/auth/login` - Login (non-Telegram)

### Books
- `GET /api/books` - Get books (with filters)
- `GET /api/books/:id` - Get single book
- `GET /api/books/:id/fragment` - Get book fragment
- `GET /api/genres` - Get genres

### User
- `GET /api/user/profile` - Get profile
- `PATCH /api/user/profile` - Update profile
- `POST /api/user/avatar` - Upload avatar
- `GET /api/user/purchases` - Get purchases
- `PATCH /api/user/notifications/settings` - Update notification settings

### Favorites
- `GET /api/favorites` - Get favorites
- `POST /api/favorites/:bookId` - Add to favorites
- `DELETE /api/favorites/:bookId` - Remove from favorites

### My Books
- `GET /api/my-books` - Get user's books
- `GET /api/my-books/:bookId/read` - Get book for reading
- `POST /api/my-books/:bookId/progress` - Update reading progress
- `GET /api/my-books/:bookId/progress` - Get reading progress

### Payment
- `POST /api/payment/create-invoice` - Create payment invoice
- `POST /api/payment/verify` - Verify payment
- `POST /api/payment/webhook` - Payment webhook

## 🤖 Telegram Bot Commands

- `/start` - Start the bot
- `/library` - Open library in Mini App
- `/help` - Show help

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables
3. Deploy

### Backend (Railway/Render)
1. Push your code to GitHub
2. Connect to Railway/Render
3. Set environment variables
4. Deploy

### Telegram Bot (Railway/Heroku)
1. Push your code to GitHub
2. Connect to Railway/Heroku
3. Set environment variables
4. Deploy

## 📝 Notes

- Make sure to register your Mini App with @BotFather
- For payment functionality, configure Telegram Stars
- For production, ensure HTTPS is enabled
- Set up proper error logging and monitoring