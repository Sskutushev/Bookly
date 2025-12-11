import logging
from telegram import Update, WebAppInfo
from telegram.ext import ContextTypes
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import asyncio
from datetime import datetime, timedelta
import psycopg2
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Enable logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Database connection
def get_db_connection():
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        database=os.getenv('DB_NAME', 'bookly'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', 'postgres')
    )

async def send_inactive_reminder(application, user_id: int, genre: str, new_books_count: int):
    """Send inactive user reminder."""
    try:
        message = (
            f"📚 Привет! Мы скучали по тебе.\n\n"
            f"В библиотеке появилось {new_books_count} новых книг в жанре {genre}.\n\n"
            f"Продолжи читать любимые книги или открой что-то новое!"
        )
        
        keyboard = {
            'inline_keyboard': [
                [
                    {
                        'text': '📖 Открыть библиотеку',
                        'web_app': {
                            'url': os.getenv('MINI_APP_URL', 'https://your-mini-app-url.com')
                        }
                    }
                ]
            ]
        }
        
        await application.bot.send_message(
            chat_id=user_id,
            text=message,
            reply_markup=keyboard
        )
        
        logger.info(f"Inactive reminder sent to user {user_id}")
    except Exception as e:
        logger.error(f"Error sending inactive reminder to user {user_id}: {e}")

async def send_unfinished_reminder(application, user_id: int, book_title: str, book_id: str, progress: float):
    """Send unfinished book reminder."""
    try:
        message = (
            f"📖 Вы остановились на {progress:.0f}% книги «{book_title}».\n\n"
            f"Продолжить чтение?"
        )
        
        keyboard = {
            'inline_keyboard': [
                [
                    {
                        'text': '➡️ Продолжить чтение',
                        'web_app': {
                            'url': f"{os.getenv('MINI_APP_URL', 'https://your-mini-app-url.com')}/reader/{book_id}"
                        }
                    }
                ]
            ]
        }
        
        await application.bot.send_message(
            chat_id=user_id,
            text=message,
            reply_markup=keyboard
        )
        
        logger.info(f"Unfinished reminder sent to user {user_id} for book {book_id}")
    except Exception as e:
        logger.error(f"Error sending unfinished reminder to user {user_id}: {e}")

async def send_new_book_notification(application, user_id: int, book: dict, genre: str):
    """Send new book notification."""
    try:
        caption = (
            f"🆕 Новая книга в жанре {genre}!\n\n"
            f"📕 {book['title']}\n"
            f"✍️ {book['author']}\n"
            f"💰 {'Бесплатно' if book['price'] == 0 else f'{book['price']}₽'}"
        )
        
        keyboard = {
            'inline_keyboard': [
                [
                    {
                        'text': '📚 Посмотреть книгу',
                        'web_app': {
                            'url': f"{os.getenv('MINI_APP_URL', 'https://your-mini-app-url.com')}?startapp=book_{book['id']}"
                        }
                    }
                ]
            ]
        }
        
        await application.bot.send_photo(
            chat_id=user_id,
            photo=book['coverUrl'],
            caption=caption,
            reply_markup=keyboard
        )
        
        logger.info(f"New book notification sent to user {user_id} for book {book['id']}")
    except Exception as e:
        logger.error(f"Error sending new book notification to user {user_id}: {e}")

async def check_inactive_users(context: ContextTypes.DEFAULT_TYPE):
    """Check for inactive users and send reminders."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Get users who haven't been active in the last 3 days
        three_days_ago = datetime.now() - timedelta(days=3)

        cur.execute("""
            SELECT DISTINCT u.telegram_id, ns.frequency
            FROM "User" u
            JOIN "NotificationSettings" ns ON u.id = ns."userId"
            WHERE ns."telegramEnabled" = true
            AND ns."unfinishedReminder" = true
            AND u."lastActiveAt" < %s
        """, (three_days_ago,))

        inactive_users = cur.fetchall()

        for user_data in inactive_users:
            user_id = user_data[0]

            # Determine preferred genre based on user's favorites
            cur.execute("""
                SELECT g.name, COUNT(f.id) as count
                FROM "Favorite" f
                JOIN "Book" b ON f."bookId" = b.id
                JOIN "Genre" g ON b.id = g.id
                WHERE f."userId" = (SELECT id FROM "User" WHERE telegram_id = %s)
                GROUP BY g.name
                ORDER BY count DESC
                LIMIT 1
            """, (user_id,))

            result = cur.fetchone()
            preferred_genre = result[0] if result else "Детектив"

            # Count new books in the preferred genre
            cur.execute("""
                SELECT COUNT(*)
                FROM "Book" b
                JOIN "_BookToGenre" btg ON b.id = btg."A"
                JOIN "Genre" g ON btg."B" = g.id
                WHERE g.name = %s AND b."createdAt" > %s
            """, (preferred_genre, three_days_ago))

            new_books_count = cur.fetchone()[0] or 5  # Default to 5 if query fails

            await send_inactive_reminder(context.application, int(user_id), preferred_genre, new_books_count)

        cur.close()
        conn.close()
    except Exception as e:
        logger.error(f"Error checking inactive users: {e}")

async def check_unfinished_books(context: ContextTypes.DEFAULT_TYPE):
    """Check for unfinished books and send reminders."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Get users with books they started reading but haven't finished
        seven_days_ago = datetime.now() - timedelta(days=7)

        cur.execute("""
            SELECT u.telegram_id, b.title, b.id, rp.progress
            FROM "User" u
            JOIN "ReadingProgress" rp ON u.id = rp."userId"
            JOIN "Book" b ON rp."bookId" = b.id
            JOIN "NotificationSettings" ns ON u.id = ns."userId"
            WHERE ns."telegramEnabled" = true
            AND ns."unfinishedReminder" = true
            AND rp.progress > 10
            AND rp.progress < 100
            AND rp."lastReadAt" < %s
        """, (seven_days_ago,))

        unfinished_books = cur.fetchall()

        for book_data in unfinished_books:
            user_id, title, book_id, progress = book_data
            await send_unfinished_reminder(context.application, int(user_id), title, book_id, progress)

        cur.close()
        conn.close()
    except Exception as e:
        logger.error(f"Error checking unfinished books: {e}")

async def check_new_books(context: ContextTypes.DEFAULT_TYPE):
    """Check for new books in user's favorite genres and send notifications."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Get books added in the last day
        yesterday = datetime.now() - timedelta(days=1)

        cur.execute("""
            SELECT id, title, author, "coverUrl", price, "createdAt"
            FROM "Book"
            WHERE "createdAt" > %s
        """, (yesterday,))

        new_books = cur.fetchall()

        for book_data in new_books:
            book_id, title, author, cover_url, price, created_at = book_data

            # Get genres for the new book
            cur.execute("""
                SELECT g.name
                FROM "Genre" g
                JOIN "_BookToGenre" btg ON g.id = btg."B"
                WHERE btg."A" = %s
            """, (book_id,))

            genres = [row[0] for row in cur.fetchall()]

            # For each genre of the new book, find users interested in that genre
            for genre in genres:
                # Get users who have books of this genre as favorite
                cur.execute("""
                    SELECT DISTINCT u.telegram_id
                    FROM "User" u
                    JOIN "Favorite" f ON u.id = f."userId"
                    JOIN "Book" b ON f."bookId" = b.id
                    JOIN "_BookToGenre" btg ON b.id = btg."A"
                    JOIN "Genre" g ON btg."B" = g.id
                    JOIN "NotificationSettings" ns ON u.id = ns."userId"
                    WHERE ns."telegramEnabled" = true
                    AND ns."newBooksInGenre" = true
                    AND g.name = %s
                """, (genre,))

                users_to_notify = cur.fetchall()

                book_info = {
                    'id': book_id,
                    'title': title,
                    'author': author,
                    'coverUrl': cover_url,
                    'price': price
                }

                for user_data in users_to_notify:
                    user_id = user_data[0]
                    await send_new_book_notification(context.application, int(user_id), book_info, genre)

        cur.close()
        conn.close()
    except Exception as e:
        logger.error(f"Error checking new books: {e}")

def setup_scheduler():
    """Set up the notification scheduler."""
    scheduler = AsyncIOScheduler()
    
    # Schedule checks:
    # - Inactive users check daily at 10 AM
    scheduler.add_job(check_inactive_users, CronTrigger(hour=10, minute=0))
    
    # - Unfinished books check daily at 8 PM
    scheduler.add_job(check_unfinished_books, CronTrigger(hour=20, minute=0))
    
    # - New books check every 6 hours
    scheduler.add_job(check_new_books, CronTrigger(hour='*/6', minute=0))
    
    scheduler.start()
    logger.info("Scheduler started")
    
    return scheduler