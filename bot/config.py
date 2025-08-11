"""
Configuration file for the Telegram Bot
"""
import os
import json
from dotenv import load_dotenv

load_dotenv()

class BotConfig:
    """Bot configuration settings"""
    BOT_TOKEN = os.getenv('BOT_TOKEN')
    PHOTO_URL = os.getenv('PHOTO_URL', "https://www.cio.com/wp-content/uploads/2023/05/SW-Blog-image-Getty-1170x600-2.jpg?quality=50&strip=all")
    WEBAPP_URL = os.getenv('WEBAPP_URL', "https://invest-app-neon.vercel.app")
    CONTACT_URL = os.getenv('CONTACT_URL', "https://t.me/KapitalPro_Support")
    
    # Admin configuration
    ADMIN_ID = os.getenv('ADMIN_ID')
    
    # Firebase configuration
    FIREBASE_SERVICE_ACCOUNT = os.getenv('FIREBASE_SERVICE_ACCOUNT')
    FIREBASE_PROJECT_ID = os.getenv('FIREBASE_PROJECT_ID')
    
    # Logging configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    
    # Language configurations
    LANGUAGES = {
        'english': {
            'name': '🇬🇧 English',
            'welcome': 'Dear user: @{username}!\nWelcome to KapitalPro.\nKapitalPro integrates the power of artificial intelligence and machine learning into every stage of our value chain. AI technology is the core of our strategic growth engine and processes. Invest in cryptocurrencies using AI strategies and achieve stable returns.\n\nChoose your preferred language:',
            'callback': 'Language changed to English',
            'error': 'Error. Please try again!',
            'start_prompt': 'Please use /start to begin.'
        },
        'azerbaijani': {
            'name': '🇦🇿 Azerbaijani',
            'welcome': 'Hörmətli istifadəçi: @{username}!\nKapitalPro-ya xoş gəlmisiniz.\nKapitalPro süni intellekt və maşın öyrənməsinin gücünü dəyər zəncirimizin hər mərhələsinə inteqrasiya edir. AI texnologiyası strategiyamızın böyümə mühərriki və proseslərinin əsasını təşkil edir. AI strategiyalarından istifadə edərək kriptovalyutalara investisiya edin və sabit gəlir əldə edin.\n\nDil seçin:',
            'callback': 'Dil Azərbaycan dilinə dəyişdirildi',
            'error': 'Xəta. Zəhmət olmasa yenidən cəhd edin!',
            'start_prompt': 'Zəhmət olmasa başlamaq üçün /start istifadə edin.'
        },
        'russian': {
            'name': '🇷🇺 Russian',
            'welcome': 'Уважаемый пользователь: @{username}!\nДобро пожаловать в KapitalPro.\nKapitalPro интегрирует мощь искусственного интеллекта и машинного обучения на каждом этапе нашей цепочки создания стоимости. Технология ИИ является ядром нашего стратегического двигателя роста и процессов. Инвестируйте в криптовалюты, используя стратегии ИИ, и получайте стабильную прибыль.\n\nВыберите язык:',
            'callback': 'Язык изменен на русский',
            'error': 'Ошибка. Пожалуйста, попробуйте снова!',
            'start_prompt': 'Пожалуйста, используйте /start для начала.'
        }
    }
    
    # Button configurations
    BUTTONS = {
        'launch_app': '🚀 Launch App',
        'contact': '💬 Technical Support'
    }
    
    @classmethod
    def validate(cls):
        """Validate required configuration"""
        if not cls.BOT_TOKEN:
            raise ValueError("BOT_TOKEN is required in environment variables")
        if not cls.ADMIN_ID:
            raise ValueError("ADMIN_ID is required in environment variables")
        if not cls.FIREBASE_SERVICE_ACCOUNT:
            raise ValueError("FIREBASE_SERVICE_ACCOUNT is required in environment variables")
        if not cls.FIREBASE_PROJECT_ID:
            raise ValueError("FIREBASE_PROJECT_ID is required in environment variables")
        return True
    
    @classmethod
    def get_firebase_credentials(cls):
        """Get Firebase credentials from environment variable"""
        try:
            return json.loads(cls.FIREBASE_SERVICE_ACCOUNT)
        except (json.JSONDecodeError, TypeError) as e:
            raise ValueError(f"Invalid FIREBASE_SERVICE_ACCOUNT JSON: {e}")
    
    @classmethod
    def is_admin(cls, user_id):
        """Check if a user ID matches the admin ID"""
        return str(user_id) == str(cls.ADMIN_ID) 