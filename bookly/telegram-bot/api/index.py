# telegram-bot/api/index.py
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from bot import main
from flask import Flask, request, jsonify
import asyncio

app = Flask(__name__)

# Import the application logic
from bot import setup_handlers
from telegram.ext import Application

# Global application instance
bot_application = None

@app.route("/", methods=["POST"])
def hook():
    # Receive webhook data from Telegram
    data = request.get_json()
    
    # Process the update asynchronously
    # Since Flask is synchronous, we need to run the async function differently
    # This is a simplified version - in practice you'd run the update through your bot
    
    # For now, return success to Telegram
    return jsonify({"status": "ok"})

@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "running"})

def initialize_bot():
    global bot_application
    
    # Create application instance
    token = os.getenv('BOT_TOKEN')
    if not token:
        raise ValueError("BOT_TOKEN environment variable not set")
    
    bot_application = Application.builder().token(token).build()
    
    # Setup handlers
    setup_handlers(bot_application)

if __name__ != "__main__":
    # This runs when deployed to Vercel
    initialize_bot()

if __name__ == "__main__":
    main()