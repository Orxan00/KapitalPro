import logging
import json
import asyncio
from http.server import BaseHTTPRequestHandler
from telebot.async_telebot import AsyncTeleBot
from telebot import types
from config import BotConfig
from firebase_service import get_firebase_service

# Configure logging
logging.basicConfig(
    level=getattr(logging, BotConfig.LOG_LEVEL),
    format=BotConfig.LOG_FORMAT
)
logger = logging.getLogger(__name__)

# Validate configuration
try:
    BotConfig.validate()
except ValueError as e:
    logger.error(f"Configuration error: {e}")
    exit(1)

# Initialize bot
bot = AsyncTeleBot(BotConfig.BOT_TOKEN)

# Initialize Firebase service
try:
    firebase_service = get_firebase_service()
    logger.info("Firebase service initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Firebase service: {e}")
    exit(1)

def generate_keyboard(selected_language='english'):
    """Generate inline keyboard with language selection and action buttons"""
    keyboard = types.InlineKeyboardMarkup(row_width=2)
    
    # Language buttons
    language_buttons = []
    for lang_code, lang_data in BotConfig.LANGUAGES.items():
        label = lang_data['name']
        if selected_language == lang_code:
            label += " ✅"
        language_buttons.append(
            types.InlineKeyboardButton(label, callback_data=f"language_{lang_code}")
        )
    
    # Add language buttons in rows
    for i in range(0, len(language_buttons), 2):
        row = language_buttons[i:i+2]
        keyboard.add(*row)
    
    # Action buttons
    keyboard.add(
        types.InlineKeyboardButton(BotConfig.BUTTONS['launch_app'], web_app=types.WebAppInfo(url=BotConfig.WEBAPP_URL)),
        types.InlineKeyboardButton(BotConfig.BUTTONS['contact'], url=BotConfig.CONTACT_URL)
    )
    
    return keyboard

def get_welcome_message(username, language='english'):
    """Get welcome message for specified language"""
    lang_data = BotConfig.LANGUAGES.get(language, BotConfig.LANGUAGES['english'])
    return lang_data['welcome'].format(username=username)

def get_error_message(language='english'):
    """Get error message for specified language"""
    lang_data = BotConfig.LANGUAGES.get(language, BotConfig.LANGUAGES['english'])
    return lang_data['error']

def get_start_prompt(language='english'):
    """Get start prompt for specified language"""
    lang_data = BotConfig.LANGUAGES.get(language, BotConfig.LANGUAGES['english'])
    return lang_data['start_prompt']

async def send_welcome_card(chat_id, username, language='english'):
    """Send welcome card with photo and keyboard"""
    try:
        message = get_welcome_message(username, language)
        keyboard = generate_keyboard(language)
        
        await bot.send_photo(
            chat_id=chat_id,
            photo=BotConfig.PHOTO_URL,
            caption=message,
            reply_markup=keyboard
        )
        logger.info(f"Welcome card sent to chat {chat_id} in {language}")
        
    except Exception as e:
        logger.error(f"Error sending welcome card: {e}")
        await bot.send_message(chat_id, get_error_message(language))

async def update_welcome_card(chat_id, message_id, username, language, call):
    """Update existing welcome card with new language"""
    try:
        message = get_welcome_message(username, language)
        keyboard = generate_keyboard(language)
        
        await bot.edit_message_media(
            chat_id=chat_id,
            message_id=message_id,
            media=types.InputMediaPhoto(
                media=BotConfig.PHOTO_URL,
                caption=message
            ),
            reply_markup=keyboard
        )
        
        lang_data = BotConfig.LANGUAGES.get(language, BotConfig.LANGUAGES['english'])
        await bot.answer_callback_query(call.id, lang_data['callback'])
        logger.info(f"Welcome card updated for chat {chat_id} to {language}")
        
    except Exception as e:
        logger.error(f"Error updating welcome card: {e}")
        await bot.answer_callback_query(call.id, get_error_message(language))

@bot.message_handler(commands=['start'])
async def start_handler(message):
    """Handle /start command"""
    try:
        user_id = str(message.from_user.id)
        username = message.from_user.username or "user"
        
        # Prepare user data for Firebase
        user_data = {
            'user_id': user_id,
            'first_name': message.from_user.first_name or '',
            'last_name': message.from_user.last_name or '',
            'username': username,
            'language_code': 'english',  # Default language
            'is_premium': getattr(message.from_user, 'is_premium', False),
            'balance': 0  # Default balance for new users
        }
        
        # Store user data in Firebase
        success = firebase_service.create_or_update_user(user_data)
        
        if success:
            logger.info(f"User data stored successfully for user {user_id}")
        else:
            logger.warning(f"Failed to store user data for user {user_id}")
        
        # Send welcome card with default language
        await send_welcome_card(message.chat.id, username, 'english')
        
    except Exception as e:
        logger.error(f"Error in start handler: {e}")
        await bot.send_message(message.chat.id, get_error_message())

@bot.callback_query_handler(func=lambda call: call.data.startswith('language_'))
async def language_handler(call):
    """Handle language selection callbacks"""
    try:
        language = call.data.split('_')[1]
        username = call.from_user.username or "user"
        
        if language in BotConfig.LANGUAGES:
            # Update welcome card with new language
            await update_welcome_card(call.message.chat.id, call.message.message_id, username, language, call)
        else:
            await bot.answer_callback_query(call.id, "Invalid language selection")
            logger.warning(f"Invalid language selection: {language}")
            
    except Exception as e:
        logger.error(f"Error in language handler: {e}")
        await bot.answer_callback_query(call.id, get_error_message())

@bot.message_handler(func=lambda message: True)
async def echo_handler(message):
    """Handle all other messages"""
    try:
        await bot.reply_to(message, get_start_prompt())
    except Exception as e:
        logger.error(f"Error in echo handler: {e}")

# HTTP Server to handle updates from Telegram Webhook
# class Handler(BaseHTTPRequestHandler):
#     def do_POST(self):
#         content_length = int(self.headers['Content-Length'])  
#         post_data = self.rfile.read(content_length)
#         update_dict = json.loads(post_data.decode('utf-8'))

#         asyncio.run(self.process_update(update_dict))

#         self.send_response(200)
#         self.end_headers()

#     async def process_update(self, update_dict):
#         update = types.Update.de_json(update_dict)
#         await bot.process_new_updates([update])

#     def do_GET(self):
#         self.send_response(200)
#         self.end_headers()
#         self.wfile.write('Hello, BOT is running!'.encode('utf-8'))

# Start polling
if __name__ == '__main__':
    logger.info("Bot starting...")
    try:
        import asyncio
        asyncio.run(bot.polling())
    except KeyboardInterrupt:
        logger.info("Bot stopped by user")
    except Exception as e:
        logger.error(f"Bot error: {e}")
