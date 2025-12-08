# telegram-bot/bot.py

import logging
from telegram import Update, WebAppInfo, KeyboardButton, ReplyKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)
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
MINI_APP_URL = os.getenv("MINI_APP_URL", "https://bookly-mini-app.vercel.app")

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message with a button to open the Mini App."""
    keyboard = [
        [KeyboardButton("📚 Open Library", web_app=WebAppInfo(url=MINI_APP_URL))]
    ]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
    
    await update.message.reply_text(
        "Welcome to Bookly! 📚\n\n"
        "Your personal library in Telegram. Read books, discover new authors, and enjoy your reading experience.",
        reply_markup=reply_markup
    )

async def library(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Open the library Mini App."""
    await update.message.reply_text(
        "📚 Opening your library...",
        reply_markup=ReplyKeyboardMarkup(
            [[KeyboardButton("📚 My Books", web_app=WebAppInfo(url=f"{MINI_APP_URL}/my-books"))]],
            resize_keyboard=True
        )
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a help message."""
    help_text = (
        "📖 Bookly Help\n\n"
        "Commands:\n"
        "/start - Start the bot and open the library\n"
        "/library - Open your personal library\n"
        "/help - Show this help message\n\n"
        "Features:\n"
        "• Browse and read books\n"
        "• Add books to favorites\n"
        "• Purchase books with Telegram Stars\n"
        "• Track your reading progress\n"
        "• Get personalized recommendations\n\n"
        "Enjoy your reading experience! 📚"
    )
    await update.message.reply_text(help_text)

async def web_app_data(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle data sent from the web app."""
    query = update.effective_message
    print(f"Received web app data: {query.web_app_data.data}")
    await query.reply_text(f"Thank you for sending: {query.web_app_data.data}")

def main() -> None:
    """Run the bot."""
    # Create the Application and pass it your bot's token.
    application = Application.builder().token(BOT_TOKEN).build()

    # Add command handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("library", library))
    application.add_handler(CommandHandler("help", help_command))
    
    # Handle web app data
    application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, web_app_data))

    # Run the bot until the user presses Ctrl-C
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()