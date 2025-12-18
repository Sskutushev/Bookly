# telegram-bot/handlers/command_handlers.py
import os
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import ContextTypes
from dotenv import load_dotenv

load_dotenv()

MINI_APP_URL = os.getenv("MINI_APP_URL")

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Sends a welcome message with a button to open the Mini App."""
    if not MINI_APP_URL:
        await update.message.reply_text("Error: Mini App URL is not configured.")
        return

    keyboard = [
        [InlineKeyboardButton("📖 Открыть библиотеку", web_app=WebAppInfo(url=MINI_APP_URL))]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_photo(
        photo="https://storage.yandexcloud.net/bookly-bucket/bookly_promo.png",
        caption=(
            "📚 Добро пожаловать в Bookly!\n\n"
            "Читайте книги прямо в Telegram без установки "
            "дополнительных приложений.\n\n"
            "Нажмите кнопку ниже, чтобы начать."
        ),
        reply_markup=reply_markup
    )

async def library(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Sends a button to open the Mini App directly to the 'My Books' page."""
    if not MINI_APP_URL:
        await update.message.reply_text("Error: Mini App URL is not configured.")
        return
        
    my_books_url = f"{MINI_APP_URL}/my-books"
    keyboard = [
        [InlineKeyboardButton("📚 Открыть мои книги", web_app=WebAppInfo(url=my_books_url))]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text("Перейти в вашу личную библиотеку:", reply_markup=reply_markup)

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Sends a help message."""
    help_text = (
        "Bookly - это ваш удобный доступ к миру книг прямо в Telegram.\n\n"
        "Доступные команды:\n"
        "/start - Открыть главное меню и запустить приложение\n"
        "/library - Открыть вашу коллекцию книг\n"
        "/help - Показать это сообщение\n\n"
        "Все основные функции доступны внутри самого приложения. "
        "Нажмите 'Открыть библиотеку' для начала."
    )
    await update.message.reply_text(help_text)
