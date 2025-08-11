"""
Telegram Bot Webhook Handler - Refactored for Scalability
"""
import logging
import json
import asyncio
from http.server import BaseHTTPRequestHandler
from telebot.async_telebot import AsyncTeleBot
from telebot import types

# Import configuration and services
from config import BotConfig
from firebase_service import get_firebase_service

# Import separated handlers
from handlers import setup_command_handlers, setup_callback_handlers, setup_message_handlers

# Configure logging
logging.basicConfig(
    level=getattr(logging, BotConfig.LOG_LEVEL),
    format=BotConfig.LOG_FORMAT
)
logger = logging.getLogger(__name__)

class InvestmentBot:
    """Main bot application class"""
    
    def __init__(self):
        """Initialize the bot application"""
        self.bot = None
        self.firebase_service = None
        self._initialize_services()
        self._setup_handlers()
    
    def _initialize_services(self):
        """Initialize bot and external services"""
        try:
            # Validate configuration
            BotConfig.validate()
            logger.info("Configuration validated successfully")
            
            # Initialize bot
            self.bot = AsyncTeleBot(BotConfig.BOT_TOKEN)
            logger.info("Bot initialized successfully")
            
            # Initialize Firebase service
            self.firebase_service = get_firebase_service()
            logger.info("Firebase service initialized successfully")
            
        except ValueError as e:
            logger.error(f"Configuration error: {e}")
            raise
        except Exception as e:
            logger.error(f"Failed to initialize services: {e}")
            raise
    
    def _setup_handlers(self):
        """Setup all bot handlers"""
        try:
            # Setup command handlers (/start, /help, /balance, etc.)
            setup_command_handlers(self.bot)
            logger.info("Command handlers setup complete")
            
            # Setup callback handlers (inline keyboard buttons)
            setup_callback_handlers(self.bot)
            logger.info("Callback handlers setup complete")
            
            # Setup message handlers (text messages, photos, etc.)
            setup_message_handlers(self.bot)
            logger.info("Message handlers setup complete")
            
        except Exception as e:
            logger.error(f"Failed to setup handlers: {e}")
            raise
    
    async def process_update(self, update_dict):
        """Process incoming Telegram update"""
        try:
            update = types.Update.de_json(update_dict)
            await self.bot.process_new_updates([update])
        except Exception as e:
            logger.error(f"Error processing update: {e}")
    
    def get_bot(self):
        """Get bot instance"""
        return self.bot

# Global bot instance
investment_bot = InvestmentBot()
bot = investment_bot.get_bot()

# HTTP Server Handler
class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        update_dict = json.loads(post_data.decode('utf-8'))
        
        asyncio.run(investment_bot.process_update(update_dict))
        
        self.send_response(200)
        self.end_headers()
    
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write('Investment Bot v2.0 - Running with separated handlers!'.encode('utf-8'))
        
# Start polling
# if __name__ == '__main__':
#     logger.info("Bot starting...")
#     try:
#         import asyncio
#         asyncio.run(bot.polling())
#     except KeyboardInterrupt:
#         logger.info("Bot stopped by user")
#     except Exception as e:
#         logger.error(f"Bot error: {e}")
