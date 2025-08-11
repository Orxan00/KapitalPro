import logging
from telebot import types
from config import BotConfig
from firebase_service import get_firebase_service
from handlers.callback_handler import generate_admin_keyboard

logger = logging.getLogger(__name__)

def setup_command_handlers(bot):
    """Setup all command handlers for the bot"""
    
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
            
            # Store user data in Firebase (optional)
            try:
                firebase_service = get_firebase_service()
                success = firebase_service.create_or_update_user(user_data)
                
                if success:
                    logger.info(f"User data stored successfully for user {user_id}")
                else:
                    logger.warning(f"Failed to store user data for user {user_id}")
            except Exception as firebase_error:
                logger.warning(f"Firebase service not available: {firebase_error}")
                # Continue without Firebase - bot should still work
            
            # Send welcome card with default language
            await send_welcome_card(bot, message.chat.id, username, 'english')
            
        except Exception as e:
            logger.error(f"Error in start handler: {e}")
            await bot.send_message(message.chat.id, get_error_message())
    
    @bot.message_handler(commands=['help'])
    async def help_handler(message):
        """Handle /help command"""
        try:
            user_id = str(message.from_user.id)
            is_admin = BotConfig.is_admin(user_id)
            
            help_text = """
🤖 **Bot Commands:**

/start - Start the bot and show main menu
/help - Show this help message
"""
            
            if is_admin:
                help_text += """/adminDashboard - Admin dashboard with deposit, withdrawal, and pending transaction management

🚀 **Quick Actions:**
• Use the "Launch App" button to access the investment platform
• Contact support for any issues

💼 **Admin Features:**
• Process pending deposits
• Process pending withdrawals
• View all pending transactions
• Manage user balances
• Transaction approval system
"""
            else:
                help_text += """
🚀 **Quick Actions:**
• Use the "Launch App" button to access the investment platform
• Contact support for any issues
"""
            
            help_text += "\nFor more information, visit our support channel."
            
            await bot.send_message(message.chat.id, help_text, parse_mode='Markdown')
            
        except Exception as e:
            logger.error(f"Error in help handler: {e}")
            await bot.send_message(message.chat.id, get_error_message())
    
    @bot.message_handler(commands=['adminDashboard'])
    async def admin_dashboard_handler(message):
        """Handle /adminDashboard command"""
        try:
            user_id = str(message.from_user.id)
            
            # Check if user is admin
            if not BotConfig.is_admin(user_id):
                logger.warning(f"Unauthorized access attempt to admin dashboard by user {user_id}")
                await bot.reply_to(message, "❌ **Access Denied**\n\nYou don't have permission to access the admin dashboard.\n\nThis feature is restricted to authorized administrators only.")
                return
            
            # Admin dashboard with functional deposit and withdrawal features
            dashboard_text = """
🔧 **Admin Dashboard**

📊 **Transaction Management:**
Select an option below to manage transactions.

✅ **Available Features:**
• 💰 Deposit - Process pending deposits
• 💸 Withdraw - Process pending withdrawals
• 🟡 Pending Transactions - View all pending transactions
            """
            
            # Create simple admin keyboard with 3 buttons
            keyboard = generate_admin_keyboard()
            
            await bot.send_message(
                message.chat.id,
                dashboard_text,
                parse_mode='Markdown',
                reply_markup=keyboard
            )
            
            logger.info(f"Admin dashboard displayed for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error in admin dashboard handler: {e}")
            await bot.send_message(message.chat.id, get_error_message())

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

async def send_welcome_card(bot_instance, chat_id, username, language='english'):
    """Send welcome card with photo and keyboard"""
    try:
        message = get_welcome_message(username, language)
        keyboard = generate_keyboard(language)
        
        await bot_instance.send_photo(
            chat_id=chat_id,
            photo=BotConfig.PHOTO_URL,
            caption=message,
            reply_markup=keyboard
        )
        logger.info(f"Welcome card sent to chat {chat_id} in {language}")
        
    except Exception as e:
        logger.error(f"Error sending welcome card: {e}")
        await bot_instance.send_message(chat_id, get_error_message(language)) 