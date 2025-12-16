# telegram-bot/api/webhook.py

import os
import asyncio
from flask import Flask, request, jsonify
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Initialize bot application
BOT_TOKEN = os.getenv('BOT_TOKEN')
if not BOT_TOKEN:
    raise ValueError("BOT_TOKEN environment variable not set")

# Create the Application and pass it your bot's token.
application = Application.builder().token(BOT_TOKEN).build()

# Command handlers
async def start(update, context):
    """Send a message when the command /start is issued."""
    user = update.effective_user
    await update.message.reply_html(
        f'Привет, {user.mention_html()}! 👋\n\n'
        f'Добро пожаловать в Bookly - телеграмм бот для онлайн-библиотеки. '
        f'Через этого бота вы можете читать книги, добавлять их в избранное '
        f'и покупать платные издания.\n\n'
        f'Чтобы открыть приложение, нажмите кнопку "Открыть библиотеку" ниже.',
        reply_markup=None  # In webhook mode, we don't send buttons via this route directly
    )

async def library(update, context):
    """Open the library Mini App."""
    await update.message.reply_text(
        'Откройте вашу библиотеку в Mini App:',
        reply_markup=None  # Don't send buttons
    )

async def help_command(update, context):
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

async def open_mini_app(update, context):
    """Open the main Mini App."""
    await update.message.reply_text(
        'Откройте Bookly:',
        reply_markup=None  # Don't send buttons in webhook mode
    )

# Add handlers to the application
application.add_handler(CommandHandler("start", start))
application.add_handler(CommandHandler("library", library))
application.add_handler(CommandHandler("help", help_command))

# Handle messages with "библиотека", "книги", "читать" keywords
application.add_handler(MessageHandler(
    filters.TEXT & ~filters.COMMAND, open_mini_app
))

@app.route('/webhook', methods=['POST'])
def webhook():
    """Handle incoming webhook updates from Telegram"""
    try:
        # Get the update data from the request
        update_data = request.get_json()
        
        # Create an Update object from the data
        # For simplicity, we'll just process it directly
        # In a real implementation, you'd properly deserialize and update
        
        # Schedule the update to be processed by the application
        async def process_update():
            update = Update.de_json(update_data)
            await application.process_update(update)
        
        # In a real Flask app with async support, you'd use something like asyncio.run
        # But for Vercel, we need to handle it differently
        # This is a simplified approach
        
        # Since we can't directly await async in Flask sync context,
        # we'll handle it with asyncio.run in a thread-safe way
        # For Vercel deployment, this approach should work
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(process_update())
        loop.close()
        
        return jsonify({'status': 'ok'})
    except Exception as e:
        print(f"Error processing webhook: {e}")
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'bot': 'Bookly Telegram Bot'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)