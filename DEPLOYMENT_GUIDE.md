# Bookly Deployment Guide

Hello! I've configured your project with the secrets you provided and prepared it for deployment. Here is a summary of the changes and a guide for deploying to Vercel.

## Summary of Changes

1.  **`.gitignore`**: I created a `.gitignore` file in the root of your project. This file tells Git to ignore sensitive files, so you don't accidentally commit your secrets. I have added `.env`, `node_modules`, and build output directories to it.

2.  **Backend Secrets (`bookly/backend/.env`)**: I created a `.env` file for your backend.
    *   I've set `JWT_SECRET` and `JWT_REFRESH_SECRET` to the JWT value you provided. **Security Note**: It's highly recommended to use two different, separate secrets for these in production.
    *   Your original `.env.example` mentioned a `DATABASE_URL`. You will need to replace the placeholder value with your actual PostgreSQL connection string from Supabase or any other provider.
    *   I also added the `BOT_TOKEN` here in case your backend needs it.

3.  **Telegram Bot Secrets (`bookly/telegram-bot/.env`)**: I created a `.env` file for your Python bot.
    *   I've set the `BOT_TOKEN`.
    *   **Important**: You need to fill in your database credentials (`DB_HOST`, `DB_NAME`, etc.) for the bot to work correctly.

4.  **Frontend Secrets (`bookly/frontend/.env`)**: I created a `.env` file for your frontend.
    *   **VERY IMPORTANT**: I could **not** find any code in your frontend that uses the Supabase credentials you provided. I have created the `.env` file with standard variable names (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`). Please **double-check your code** to ensure these are the correct variable names. If not, you must rename them both in the `.env` file and in your Vercel project settings.
    *   I also added `VITE_API_URL`, which your frontend uses to communicate with your backend. You will need to update this to your deployed backend URL.

5.  **Favicon Fix**: Your Vercel deployment was showing a 404 error for `/favicon.ico`. I've:
    *   Added a simple placeholder icon at `bookly/frontend/public/favicon.svg`.
    *   Updated `bookly/frontend/index.html` to use this new icon. This should resolve the 404 error.

---

## Vercel Deployment Instructions

When you deploy your project to Vercel, you need to add your secrets as **Environment Variables**. You will likely have separate Vercel projects for your frontend and backend.

### For Your Frontend (`bookly/frontend`):

1.  Go to your project in Vercel and navigate to **Settings -> Environment Variables**.
2.  Add the following variables. Make sure to update the `VITE_API_URL` to the public URL of your deployed backend.

| Name | Value |
| :--- | :--- |
| `VITE_SUPABASE_URL` | `https://szgqkxudydqwqaozunzs.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_lNeQoX-8L6-wQPvIT1b5dw_vASAXwsh` |
| `VITE_API_URL` | `https://your-backend-url.vercel.app/api` |

**Reminder**: Please verify the `VITE_SUPABASE_*` variable names are correct for your project!

### For Your Backend (`bookly/backend`):

1.  If you deploy the backend as a separate project, go to its **Settings -> Environment Variables** in Vercel.
2.  Add the following variables.

| Name | Value | Notes |
| :--- | :--- | :--- |
| `DATABASE_URL` | `your_actual_postgresql_connection_string` | **You must provide this.** |
| `JWT_SECRET` | `cb2aeeba443eaff9612d2173c4aacde3` | |
| `JWT_REFRESH_SECRET` | `cb2aeeba443eaff9612d2173c4aacde3` | **Use a different secret in production!** |
| `FRONTEND_URL` | `https://your-frontend-url.vercel.app` | The URL of your deployed frontend. |

### For Your Telegram Bot (`bookly/telegram-bot`):

If you also deploy the Python bot on Vercel:

1.  Go to its project **Settings -> Environment Variables**.
2.  Add the following:

| Name | Value | Notes |
| :--- | :--- | :--- |
| `BOT_TOKEN` | `8566011083:AAF1BM6-JgBfCP2UwaZ1BeoDh3lFGkFDmfE` | |
| `MINI_APP_URL` | `https://your-frontend-url.vercel.app` | The URL of your deployed frontend. |
| `DB_HOST` | `your_db_host` | **You must provide these DB values.** |
| `DB_NAME` | `your_db_name` | |
| `DB_USER` | `your_db_user` | |
| `DB_PASSWORD` | `your_db_password` | |
| `WEBHOOK_URL`| `https://your-bot-backend-url.vercel.app/webhook` | **Only if you use webhooks.** |


Your project is now set up locally. The next step is for you to add these environment variables to your Vercel projects and re-deploy.
