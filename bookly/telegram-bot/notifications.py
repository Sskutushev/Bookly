# telegram-bot/notifications.py

import logging
from telegram import Bot
from datetime import datetime, timedelta
import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Enable logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

# Get environment variables
BOT_TOKEN = os.getenv("BOT_TOKEN")

class NotificationManager:
    def __init__(self):
        self.bot = Bot(token=BOT_TOKEN)

    async def send_inactive_reminder(self, user_id: int, genre: str = None, new_books_count: int = 0):
        """Send inactive reminder to users who haven't been active for 3+ days."""
        try:
            if new_books_count > 0:
                if genre:
                    message = (
                        f"📚 Привет! Мы скучали по тебе. В библиотеке появилось {new_books_count} новых книг в жанре {genre}. "
                        f"Возвращайся почитать что-то интересное!"
                    )
                else:
                    message = (
                        f"📚 Привет! Мы скучали по тебе. В библиотеке появилось {new_books_count} новых книг. "
                        f"Возвращайся почитать что-то интересное!"
                    )
            else:
                message = "📚 Привет! Мы скучали по тебе. Возвращайся в библиотеку, там много интересного!"

            keyboard = [
                [{"text": "Открыть библиотеку", "web_app": {"url": os.getenv("MINI_APP_URL", "https://bookly-mini-app.vercel.app")}}]
            ]
            
            await self.bot.send_message(
                chat_id=user_id,
                text=message,
                reply_markup={"inline_keyboard": keyboard}
            )
            logger.info(f"Inactive reminder sent to user {user_id}")
        except Exception as e:
            logger.error(f"Error sending inactive reminder to user {user_id}: {e}")

    async def send_unfinished_reminder(self, user_id: int, book_title: str, book_id: str, progress: float):
        """Send reminder to continue reading unfinished books."""
        try:
            message = f"📖 Вы остановились на {progress}% книги «{book_title}». Продолжить чтение?"

            keyboard = [
                [{"text": "Продолжить чтение", "web_app": {"url": f"{os.getenv('MINI_APP_URL', 'https://bookly-mini-app.vercel.app')}/reader/{book_id}"}}]
            ]
            
            await self.bot.send_message(
                chat_id=user_id,
                text=message,
                reply_markup={"inline_keyboard": keyboard}
            )
            logger.info(f"Unfinished reminder sent to user {user_id} for book {book_id}")
        except Exception as e:
            logger.error(f"Error sending unfinished reminder to user {user_id}: {e}")

    async def send_new_book_notification(self, user_id: int, book: dict, genre: str = None):
        """Send notification about new books in user's favorite genres."""
        try:
            price_text = f"💰 {book['price']}₽" if not book.get('is_free') else "💰 Бесплатно"
            
            caption = f"🆕 Новая книга в жанре {genre or 'книги'}!\n📕 {book['title']}\n✍️ {book['author']}\n{price_text}"

            keyboard = [
                [{"text": "Посмотреть книгу", "web_app": {"url": f"{os.getenv('MINI_APP_URL', 'https://bookly-mini-app.vercel.app')}?startapp=book_{book['id']}"}}]
            ]
            
            # Send book cover if available
            if book.get('cover_url'):
                await self.bot.send_photo(
                    chat_id=user_id,
                    photo=book['cover_url'],
                    caption=caption,
                    reply_markup={"inline_keyboard": keyboard}
                )
            else:
                # If no cover, send just the text
                await self.bot.send_message(
                    chat_id=user_id,
                    text=caption,
                    reply_markup={"inline_keyboard": keyboard}
                )
            
            logger.info(f"New book notification sent to user {user_id} for book {book['id']}")
        except Exception as e:
            logger.error(f"Error sending new book notification to user {user_id}: {e}")

# Example usage
async def main():
    # Initialize notification manager
    notifier = NotificationManager()
    
    # Example notifications (these would be called from other parts of the system)
    # await notifier.send_inactive_reminder(123456789, "Фантастика", 5)
    # await notifier.send_unfinished_reminder(123456789, "Название книги", "book_id_123", 65.5)
    # await notifier.send_new_book_notification(123456789, {"id": "book123", "title": "Новая книга", "author": "Автор", "price": 299, "is_free": False, "cover_url": "https://example.com/cover.jpg"}, "Фантастика")

if __name__ == "__main__":
    asyncio.run(main())