"""
Message handlers for the bot
Handles regular text messages and other message types
"""
import logging
import re
from config import BotConfig
from firebase_service import get_firebase_service

logger = logging.getLogger(__name__)

# Import user_states from callback_handler
from handlers.callback_handler import user_states

def setup_message_handlers(bot):
    """Setup all message handlers for the bot"""
    
    @bot.message_handler(func=lambda message: True)
    async def echo_handler(message):
        """Handle all other messages"""
        try:
            user_id = str(message.from_user.id)
            text = message.text.strip()
            
            # Check if user is in deposit or withdrawal flow
            if user_id in user_states:
                state = user_states[user_id]
                logger.info(f"Main handler - User {user_id}, State: {state['state']}, Text: {text}")
                
                # Check if user is admin for admin flows
                if state['state'] in ['waiting_deposit_id', 'waiting_amount'] or (state['state'] == 'confirming' and 'deposit_id' in state):
                    if not BotConfig.is_admin(user_id):
                        logger.warning(f"Unauthorized deposit flow access attempt by user {user_id}")
                        del user_states[user_id]
                        await bot.reply_to(message, "❌ **Access Denied**\n\nYou don't have permission to access admin features.\n\nThis feature is restricted to authorized administrators only.")
                        return
                    logger.info(f"Routing to deposit flow for user {user_id}")
                    await handle_deposit_flow(bot, message, user_id, text)
                elif state['state'] in ['waiting_withdrawal_id', 'waiting_withdrawal_amount'] or (state['state'] == 'confirming' and 'withdrawal_id' in state):
                    if not BotConfig.is_admin(user_id):
                        logger.warning(f"Unauthorized withdrawal flow access attempt by user {user_id}")
                        del user_states[user_id]
                        await bot.reply_to(message, "❌ **Access Denied**\n\nYou don't have permission to access admin features.\n\nThis feature is restricted to authorized administrators only.")
                        return
                    logger.info(f"Routing to withdrawal flow for user {user_id}")
                    await handle_withdrawal_flow(bot, message, user_id, text)
                else:
                    # Invalid state, clear and send error
                    logger.warning(f"Invalid state in main handler for user {user_id}: {state['state']}")
                    del user_states[user_id]
                    await bot.reply_to(message, "❌ Invalid state. Please start over with /adminDashboard")
            else:
                # Get start prompt based on user's language preference
                # For now, default to English - can be extended to get user's language from database
                await bot.reply_to(message, get_start_prompt())
            
        except Exception as e:
            logger.error(f"Error in echo handler: {e}")
            await bot.send_message(message.chat.id, get_error_message())
    
async def handle_deposit_flow(bot, message, user_id, text):
    """Handle deposit flow based on user state"""
    try:
        state = user_states[user_id]
        logger.info(f"Deposit flow - User {user_id}, State: {state['state']}, Text: '{text}', Full state: {state}")
        
        if state['state'] == 'waiting_deposit_id':
            logger.info(f"Processing deposit ID input for user {user_id}")
            await handle_deposit_id_input(bot, message, user_id, text)
            
        elif state['state'] == 'waiting_amount':
            logger.info(f"Processing amount input for user {user_id}")
            await handle_amount_input(bot, message, user_id, text)
            
        elif state['state'] == 'confirming':
            logger.info(f"User {user_id} is in confirming state, ignoring text input")
            # User is in confirmation state, ignore text input
            await bot.reply_to(message, "⏳ **Transaction Ready for Confirmation**\n\nYou have entered an amount and are ready to complete the transaction.\n\n🎯 **Please use the buttons in the previous message:**\n• ✅ **Complete** - to approve the transaction\n• 🔙 **Back to Admin** - to cancel and return to dashboard\n\n⚠️ **Do not send more text messages at this stage.**")
            
        else:
            # Invalid state, clear and send error
            logger.warning(f"Invalid deposit state for user {user_id}: {state['state']}, Full state: {state}")
            del user_states[user_id]
            await bot.reply_to(message, "❌ Invalid state. Please start over with /adminDashboard")
            
    except Exception as e:
        logger.error(f"Error in handle_deposit_flow: {e}")
        await bot.reply_to(message, "❌ An error occurred. Please try again.")

async def handle_withdrawal_flow(bot, message, user_id, text):
    """Handle withdrawal flow based on user state"""
    try:
        state = user_states[user_id]
        logger.info(f"Withdrawal flow - User {user_id}, State: {state['state']}, Text: {text}")
        
        if state['state'] == 'waiting_withdrawal_id':
            await handle_withdrawal_id_input(bot, message, user_id, text)
            
        elif state['state'] == 'waiting_withdrawal_amount':
            await handle_withdrawal_amount_input(bot, message, user_id, text)
            
        elif state['state'] == 'confirming':
            # User is in confirmation state, ignore text input
            await bot.reply_to(message, "⏳ **Transaction Ready for Confirmation**\n\nYou have entered an amount and are ready to complete the transaction.\n\n🎯 **Please use the buttons in the previous message:**\n• ✅ **Complete** - to approve the transaction\n• 🔙 **Back to Admin** - to cancel and return to dashboard\n\n⚠️ **Do not send more text messages at this stage.**")
            
        else:
            # Invalid state, clear and send error
            logger.warning(f"Invalid withdrawal state for user {user_id}: {state['state']}")
            del user_states[user_id]
            await bot.reply_to(message, "❌ Invalid state. Please start over with /adminDashboard")
            
    except Exception as e:
        logger.error(f"Error in handle_withdrawal_flow: {e}")
        await bot.reply_to(message, "❌ An error occurred. Please try again.")

async def handle_deposit_id_input(bot, message, user_id, text):
    """Handle deposit ID input"""
    try:
        # Validate deposit ID format (alphanumeric, 3-20 characters)
        if not re.match(r'^[A-Za-z0-9]{3,20}$', text):
            await bot.reply_to(message, "❌ **Invalid Deposit ID Format**\n\nPlease enter a valid deposit ID (3-20 alphanumeric characters).")
            return
        
        # Check if deposit exists and is pending
        firebase_service = get_firebase_service()
        deposit_data = firebase_service.get_deposit_by_id(text)
        
        if not deposit_data:
            await bot.reply_to(message, f"❌ **Deposit Not Found**\n\nDeposit ID `{text}` was not found in the database.\n\nPlease verify the deposit ID and try again.")
            return
        
        if deposit_data['status'] != 'pending':
            await bot.reply_to(message, f"❌ **Deposit Already Processed**\n\nDeposit ID `{text}` has status: **{deposit_data['status'].title()}**\n\nOnly pending deposits can be processed.")
            return
        
        # Store deposit ID and update state
        user_states[user_id]['deposit_id'] = text
        user_states[user_id]['state'] = 'waiting_amount'
        user_states[user_id]['original_amount'] = deposit_data['amount']
        
        # Show amount input prompt
        response = f"""
💰 **Deposit Processing**

✅ **Deposit Found:**
• ID: `{text}`
• Original Amount: ${deposit_data['amount']:.2f}
• Status: Pending

**Enter the amount to approve:
        """
        
        from telebot import types
        keyboard = types.InlineKeyboardMarkup()
        keyboard.add(
            types.InlineKeyboardButton("🔙 Back to Admin", callback_data="deposit_back")
        )
        
        await bot.reply_to(message, response, parse_mode='Markdown', reply_markup=keyboard)
        
        logger.info(f"Deposit ID {text} validated for user {user_id}")
        
    except Exception as e:
        logger.error(f"Error in handle_deposit_id_input: {e}")
        await bot.reply_to(message, "❌ An error occurred while processing the deposit ID.")

async def handle_withdrawal_id_input(bot, message, user_id, text):
    """Handle withdrawal ID input"""
    try:
        # Validate withdrawal ID format (alphanumeric, 3-20 characters)
        if not re.match(r'^[A-Za-z0-9]{3,20}$', text):
            await bot.reply_to(message, "❌ **Invalid Withdrawal ID Format**\n\nPlease enter a valid withdrawal ID (3-20 alphanumeric characters).")
            return
        
        # Check if withdrawal exists and is pending
        firebase_service = get_firebase_service()
        withdrawal_data = firebase_service.get_withdrawal_by_id(text)
        
        if not withdrawal_data:
            await bot.reply_to(message, f"❌ **Withdrawal Not Found**\n\nWithdrawal ID `{text}` was not found in the database.\n\nPlease verify the withdrawal ID and try again.")
            return
        
        if withdrawal_data['status'] != 'pending':
            await bot.reply_to(message, f"❌ **Withdrawal Already Processed**\n\nWithdrawal ID `{text}` has status: **{withdrawal_data['status'].title()}**\n\nOnly pending withdrawals can be processed.")
            return
        
        # Store withdrawal ID and update state
        user_states[user_id]['withdrawal_id'] = text
        user_states[user_id]['state'] = 'waiting_withdrawal_amount'
        user_states[user_id]['original_amount'] = withdrawal_data['amount']
        user_states[user_id]['user_id'] = withdrawal_data['user_id']
        
        # Show amount input prompt
        response = f"""
💸 **Withdrawal Processing**

✅ **Withdrawal Found:**
• ID: `{text}`
• Original Amount: ${withdrawal_data['amount']:.2f}
• Status: Pending

**Enter the amount to approve:
        """
        
        from telebot import types
        keyboard = types.InlineKeyboardMarkup()
        keyboard.add(
            types.InlineKeyboardButton("🔙 Back to Admin", callback_data="withdrawal_back")
        )
        
        await bot.reply_to(message, response, parse_mode='Markdown', reply_markup=keyboard)
        
        logger.info(f"Withdrawal ID {text} validated for user {user_id}")
        
    except Exception as e:
        logger.error(f"Error in handle_withdrawal_id_input: {e}")
        await bot.reply_to(message, "❌ An error occurred while processing the withdrawal ID.")

async def handle_amount_input(bot, message, user_id, text):
    """Handle amount input for deposits"""
    try:
        logger.info(f"Processing amount input for user {user_id}: {text}")
        
        # Validate amount format
        try:
            amount = float(text)
            if amount <= 0:
                raise ValueError("Amount must be positive")
        except ValueError:
            await bot.reply_to(message, "❌ **Invalid Amount Format**\n\nPlease enter a valid positive number (e.g., `100.50` or `100`).")
            return
        
        # Store amount and show confirmation
        state = user_states[user_id]
        logger.info(f"Current state before update: {state}")
        
        state['amount'] = amount
        state['state'] = 'confirming'
        
        logger.info(f"State after update: {state}")
        
        original_amount = state.get('original_amount', 0)
        
        response = f"""
💰 **Confirm Deposit Approval**

📋 **Deposit Details:**
• Deposit ID: `{state['deposit_id']}`
• Original Amount: ${original_amount:.2f}
• Amount to Approve: ${amount:.2f}

⚠️ **This action will:**
• Approve the deposit
• Update user balance by ${amount:.2f}
• Mark deposit as completed

🎯 **Next Step:** Use the buttons below to complete or cancel.
        """
        
        from telebot import types
        keyboard = types.InlineKeyboardMarkup(row_width=2)
        keyboard.add(
            types.InlineKeyboardButton("✅ Complete", callback_data="deposit_complete"),
            types.InlineKeyboardButton("🔙 Back to Admin", callback_data="deposit_back")
        )
        
        await bot.reply_to(message, response, parse_mode='Markdown', reply_markup=keyboard)
        
        logger.info(f"Amount {amount} confirmed for deposit {state['deposit_id']} by user {user_id}")
        
    except Exception as e:
        logger.error(f"Error in handle_amount_input: {e}")
        await bot.reply_to(message, "❌ An error occurred while processing the amount.")

async def handle_withdrawal_amount_input(bot, message, user_id, text):
    """Handle amount input for withdrawals"""
    try:
        # Validate amount format
        try:
            amount = float(text)
            if amount <= 0:
                raise ValueError("Amount must be positive")
        except ValueError:
            await bot.reply_to(message, "❌ **Invalid Amount Format**\n\nPlease enter a valid positive number (e.g., `100.50` or `100`).")
            return
        
        # Store amount and show confirmation
        state = user_states[user_id]
        state['amount'] = amount
        state['state'] = 'confirming'
        
        original_amount = state.get('original_amount', 0)
        
        response = f"""
💸 **Confirm Withdrawal Approval**

📋 **Withdrawal Details:**
• Withdrawal ID: `{state['withdrawal_id']}`
• Original Amount: ${original_amount:.2f}
• Amount to Approve: ${amount:.2f}

⚠️ **This action will:**
• Approve the withdrawal
• Deduct ${amount:.2f} from user balance
• Mark withdrawal as completed

🎯 **Next Step:** Use the buttons below to complete or cancel.
        """
        
        from telebot import types
        keyboard = types.InlineKeyboardMarkup(row_width=2)
        keyboard.add(
            types.InlineKeyboardButton("✅ Complete", callback_data="withdrawal_complete"),
            types.InlineKeyboardButton("🔙 Back to Admin", callback_data="withdrawal_back")
        )
        
        await bot.reply_to(message, response, parse_mode='Markdown', reply_markup=keyboard)
        
        logger.info(f"Amount {amount} confirmed for withdrawal {state['withdrawal_id']} by user {user_id}")
        
    except Exception as e:
        logger.error(f"Error in handle_withdrawal_amount_input: {e}")
        await bot.reply_to(message, "❌ An error occurred while processing the amount.")

def get_start_prompt(language='english'):
    """Get start prompt for specified language"""
    lang_data = BotConfig.LANGUAGES.get(language, BotConfig.LANGUAGES['english'])
    return lang_data['start_prompt']

def get_error_message(language='english'):
    """Get error message for specified language"""
    lang_data = BotConfig.LANGUAGES.get(language, BotConfig.LANGUAGES['english'])
    return lang_data['error']