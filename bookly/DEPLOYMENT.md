# Deployment Checklist for Bookly

## Pre-deployment Tasks

### 1. Environment Setup
- [ ] Set up PostgreSQL database
- [ ] Generate JWT secrets
- [ ] Create Telegram bot with @BotFather
- [ ] Configure Mini App with bot

### 2. Code Preparation
- [ ] Run tests (if any)
- [ ] Build frontend: `npm run build` in frontend/
- [ ] Build backend: `npm run build` in backend/
- [ ] Run Prisma migrations: `npx prisma db push`

### 3. Environment Variables
#### Frontend
- [ ] VITE_API_BASE_URL: Production backend URL

#### Backend
- [ ] DATABASE_URL: PostgreSQL connection string
- [ ] JWT_SECRET: JWT access token secret
- [ ] JWT_REFRESH_SECRET: JWT refresh token secret
- [ ] BOT_TOKEN: Telegram bot token
- [ ] PORT: Server port (default 8080)

#### Telegram Bot
- [ ] BOT_TOKEN: Telegram bot token
- [ ] MINI_APP_URL: Frontend URL

## Deployment Steps

### Option 1: Manual Deployment

#### Frontend (Vercel)
1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to frontend directory
3. Run `vercel --prod`
4. Configure environment variables in Vercel dashboard

#### Backend (Railway/Render)
1. Push code to GitHub repository
2. Connect repository to Railway/Render
3. Add environment variables in dashboard
4. Deploy

#### Telegram Bot (Railway/Heroku)
1. Push code to GitHub repository
2. Connect repository to Railway/Heroku
3. Add environment variables in dashboard
4. Deploy

### Option 2: Docker Deployment

#### Build and Push Images
1. Build frontend image: `docker build -t bookly-frontend .` in frontend/
2. Build backend image: `docker build -t bookly-backend .` in backend/
3. Build bot image: `docker build -t bookly-bot .` in telegram-bot/
4. Push images to container registry

#### Deploy with Docker Compose
Create docker-compose.yml with the following services:
- frontend (React app)
- backend (Node.js API)
- bot (Python bot)
- postgres (Database)

## Post-Deployment Tasks
- [ ] Verify all services are running
- [ ] Test API endpoints
- [ ] Test bot commands
- [ ] Test Mini App functionality
- [ ] Set up monitoring and logging
- [ ] Configure custom domain (optional)
- [ ] Set up SSL certificate

## Health Checks
- [ ] Frontend: `/` returns HTML
- [ ] Backend: `/health` returns 200 with status
- [ ] Bot: Responds to /start command
- [ ] Database: Connection test passes

## Rollback Plan
- [ ] Keep previous version available
- [ ] Document rollback procedure
- [ ] Test rollback on staging first

## Production Security
- [ ] Use HTTPS for all services
- [ ] Validate all input data
- [ ] Sanitize all output data
- [ ] Use parameterized queries
- [ ] Implement rate limiting
- [ ] Set up proper error handling
- [ ] Monitor for security vulnerabilities

## Monitoring
- [ ] Set up application logs
- [ ] Monitor API response times
- [ ] Track error rates
- [ ] Monitor database performance
- [ ] Track user engagement metrics