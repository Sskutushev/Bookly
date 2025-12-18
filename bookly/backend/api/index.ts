// bookly/backend/api/index.ts
import app from '../src/server';

// Vercel will wrap this Express app into a serverless function.
// All requests will be handled by the Express app.
export default app;
