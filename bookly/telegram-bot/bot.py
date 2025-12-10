import logging
from telegram import Update, WebAppInfo, KeyboardButton, ReplyKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters
)
from dotenv import load_dotenv
import os
import asyncio

# Import scheduler
from scheduler import setup_scheduler

# Load environment variables
load_dotenv()

# Enable logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Command handlers
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /start is issued."""
    user = update.effective_user
    await update.message.reply_html(
        f'Привет, {user.mention_html()}! 👋\n\n'
        f'Добро пожаловать в Bookly - телеграмм бот для онлайн-библиотеки. '
        f'Через этого бота вы можете читать книги, добавлять их в избранное '
        f'и покупать платные издания.\n\n'
        f'Чтобы открыть приложение, нажмите кнопку "Открыть библиотеку" ниже.',
        reply_markup=ReplyKeyboardMarkup.from_button(
            KeyboardButton(
                text="📚 Открыть библиотеку",
                web_app=WebAppInfo(url=os.getenv('MINI_APP_URL', 'https://your-mini-app-url.com'))
            )
        )
    )

async def library(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Open the library Mini App."""
    await update.message.reply_text(
        'Откройте вашу библиотеку в Mini App:',
        reply_markup=ReplyKeyboardMarkup.from_button(
            KeyboardButton(
                text="📚 Мои книги",
                web_app=WebAppInfo(url=f"{os.getenv('MINI_APP_URL', 'https://your-mini-app-url.com')}/my-books")
            )
        )
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /help is issued."""
    await update.message.reply_text(
        '📖 Справка по боту Bookly:\n\n'
        '/start - Приветственное сообщение\n'
        '/library - Открыть вашу библиотеку\n'
        '/help - Показать это сообщение\n\n'
        'Для полноценного использования библиотеки '
        'используйте кнопки под сообщениями, '
        'которые открывают Mini App.'
    )

async def open_mini_app(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Open the main Mini App."""
    await update.message.reply_text(
        'Откройте Bookly:',
        reply_markup=ReplyKeyboardMarkup.from_button(
            KeyboardButton(
                text="📚 Открыть Bookly",
                web_app=WebAppInfo(url=os.getenv('MINI_APP_URL', 'https://your-mini-app-url.com'))
            )
        )
    )

def main() -> None:
    """Start the bot."""
    # Create the Application and pass it your bot's token.
    application = Application.builder().token(os.getenv('BOT_TOKEN')).build()

    # on different commands - answer in Telegram
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("library", library))
    application.add_handler(CommandHandler("help", help_command))

    # Handle messages with "библиотека", "книги", "читать" keywords
    application.add_handler(MessageHandler(
        filters.TEXT & ~filters.COMMAND, open_mini_app
    ))

    # Set up the scheduler for notifications
    scheduler = setup_scheduler(application)

    # Run the bot until the user presses Ctrl-C
    try:
        application.run_polling(allowed_updates=Update.ALL_TYPES)
    finally:
        # Shut down the scheduler when the bot stops
        scheduler.shutdown()

if __name__ == "__main__":
    main()