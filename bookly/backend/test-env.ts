// test-env.ts
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

console.log('--- Diagnostic Test ---');
console.log('Reading DATABASE_URL from environment...');
const dbUrl = process.env.DATABASE_URL;

if (dbUrl) {
  console.log('DATABASE_URL is:', dbUrl);
} else {
  console.log('DATABASE_URL is NOT SET or visible to this script.');
}

console.log('-----------------------');
