#!/bin/bash
# setup-local-db.sh

echo "Setting up local PostgreSQL database..."

# Stop and remove any existing containers
docker-compose down

# Start PostgreSQL container
docker-compose up -d

echo "Waiting for PostgreSQL to be ready..."
sleep 10

# Update .env file to use local database
echo "DATABASE_URL=\"postgresql://postgres:postgres@localhost:5432/bookly_dev\"" > .env
echo "DIRECT_URL=\"postgresql://postgres:postgres@localhost:5432/bookly_dev\"" >> .env

# Append other necessary environment variables
echo "" >> .env
echo "JWT_SECRET=\"b92d950dc3bc28d1\"" >> .env
echo "JWT_REFRESH_SECRET=\"b92d950dc3bc28d1\"" >> .env
echo "BOT_TOKEN=\"8566011083:AAF1BM6-JgBfCP2UwaZ1BeoDh3lFGkFDmfE\"" >> .env
echo "BOT_USERNAME=\"bookly_bot\"" >> .env
echo "FRONTEND_URL=\"http://localhost:5173\"" >> .env
echo "MINI_APP_URL=\"http://localhost:5173\"" >> .env
echo "PORT=8080" >> .env
echo "# SMTP Settings" >> .env
echo "SMTP_HOST=\"smtp.gmail.com\"" >> .env
echo "SMTP_PORT=587" >> .env
echo "SMTP_USER=\"your-email@gmail.com\"" >> .env
echo "SMTP_PASS=\"your-app-password\"" >> .env

echo "Installing dependencies..."
npm install

echo "Generating Prisma client..."
npx prisma generate

echo "Running database migrations..."
npx prisma migrate dev --name init

echo "Setup complete! Now run:"
echo "1. docker-compose up -d (to start PostgreSQL)"
echo "2. npm run dev (to start backend)"
echo "3. Open another terminal and go to frontend directory"
echo "4. npm run dev (to start frontend)"