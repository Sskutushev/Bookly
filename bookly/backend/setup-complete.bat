# Install Docker Desktop from https://www.docker.com/products/docker-desktop
# Then run this script from the backend directory

echo "Step 1: Starting PostgreSQL with Docker..."
docker-compose up -d

echo "Step 2: Waiting for PostgreSQL to be ready..."
sleep 10

echo "Step 3: Installing dependencies..."
npm install

echo "Step 4: Generating Prisma client..."
npx prisma generate

echo "Step 5: Running database migrations..."
npx prisma migrate dev --name init

echo "Step 6: Importing books..."
npx ts-node scripts/import-books.ts

echo "Setup complete!"
echo "To start the backend: npm run dev"
echo "To start the frontend: cd ../frontend && npm run dev"