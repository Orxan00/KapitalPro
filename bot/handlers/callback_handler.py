"""Callback handlers for the bot"""
import logging
from telebot import types
from config import BotConfig
from firebase_service import get_firebase_service

logger = logging.getLogger(__name__)

# Store user states for deposit and withdrawal flows
user_states = {}

def setup_callback_handlers(bot):
    """Setup callback handlers for inline keyboard buttons"""
    
    @bot.callback_query_handler(func=lambda call: call.data.startswith('language_'))
    async def language_callback_handler(call):
        """Handle language selection callbacks"""
        try:
            # Extract language code from callback data
            language_code = call.data.split('_')[1]
            
            if language_code in BotConfig.LANGUAGES:
                # Send updated welcome card with new language
                username = call.from_user.username or "user"
                await send_welcome_card(bot, call.message.chat.id, username, language_code)
                
                # Answer callback query
                await bot.answer_callback_query(call.id, f"Language changed to {BotConfig.LANGUAGES[language_code]['name']}")
                
            else:
                await bot.answer_callback_query(call.id, "Invalid language selection")
                
        except Exception as e:
            logger.error(f"Error in language callback handler: {e}")
            await bot.answer_callback_query(call.id, "An error occurred")
    
    @bot.callback_query_handler(func=lambda call: call.data.startswith('admin_'))
    async def admin_callback_handler(call):
        """Handle admin dashboard callbacks"""
        try:
            user_id = str(call.from_user.id)
            
            # Check if user is admin
            if not BotConfig.is_admin(user_id):
                logger.warning(f"Unauthorized admin action attempt by user {user_id}: {call.data}")
                await bot.answer_callback_query(call.id, "❌ Access Denied - Admin Only")
                return
            
            action = call.data.split('_')[1]
            
            if action == 'deposit':
                # Start deposit flow
                await handle_deposit_start(bot, call)
                
            elif action == 'withdraw':
                # Start withdrawal flow
                await handle_withdrawal_start(bot, call)
                
            elif action == 'pending':
                # Show pending transactions
                await handle_pending_transactions(bot, call)
                
            elif action == 'back':
                # Return to admin dashboard
                await handle_admin_dashboard(bot, call)
                
            else:
                response = "❌ Unknown admin action"
                await bot.edit_message_text(
                    chat_id=call.message.chat.id,
                    message_id=call.message.message_id,
                    text=response,
                    parse_mode='Markdown'
                )
            
            # Answer callback query
            await bot.answer_callback_query(call.id)
            
        except Exception as e:
            logger.error(f"Error in admin callback handler: {e}")
            await bot.answer_callback_query(call.id, "An error occurred")
    
    @bot.callback_query_handler(func=lambda call: call.data.startswith('deposit_'))
    async def deposit_callback_handler(call):
        """Handle deposit-specific callbacks"""
        try:
            user_id = str(call.from_user.id)
            
            # Check if user is admin
            if not BotConfig.is_admin(user_id):
                logger.warning(f"Unauthorized deposit action attempt by user {user_id}: {call.data}")
                await bot.answer_callback_query(call.id, "❌ Access Denied - Admin Only")
                return
            
            action = call.data.split('_')[1]
            
            if action == 'back':
                # Return to admin dashboard
                await handle_admin_dashboard(bot, call)
                
            elif action == 'complete':
                # Complete the deposit process
                await handle_deposit_complete(bot, call)
                
            else:
                await bot.answer_callback_query(call.id, "Unknown deposit action")
                
        except Exception as e:
            logger.error(f"Error in deposit callback handler: {e}")
            await bot.answer_callback_query(call.id, "An error occurred")
    
    @bot.callback_query_handler(func=lambda call: call.data.startswith('withdrawal_'))
    async def withdrawal_callback_handler(call):
        """Handle withdrawal-specific callbacks"""
        try:
            user_id = str(call.from_user.id)
            
            # Check if user is admin
            if not BotConfig.is_admin(user_id):
                logger.warning(f"Unauthorized withdrawal action attempt by user {user_id}: {call.data}")
                await bot.answer_callback_query(call.id, "❌ Access Denied - Admin Only")
                return
            
            action = call.data.split('_')[1]
            
            if action == 'back':
                # Return to admin dashboard
                await handle_admin_dashboard(bot, call)
                
            elif action == 'complete':
                # Complete the withdrawal process
                await handle_withdrawal_complete(bot, call)
                
            else:
                await bot.answer_callback_query(call.id, "Unknown withdrawal action")
                
        except Exception as e:
            logger.error(f"Error in withdrawal callback handler: {e}")
            await bot.answer_callback_query(call.id, "An error occurred")
    
    @bot.callback_query_handler(func=lambda call: True)
    async def general_callback_handler(call):
        """Handle any other callbacks"""
        try:
            logger.info(f"Unhandled callback: {call.data} from user {call.from_user.id}")
            await bot.answer_callback_query(call.id, "This feature is not available yet")
            
        except Exception as e:
            logger.error(f"Error in general callback handler: {e}")
            await bot.answer_callback_query(call.id, "An error occurred")

async def handle_deposit_start(bot, call):
    """Handle the start of deposit flow"""
    try:
        user_id = str(call.from_user.id)
        
        # Set user state to waiting for deposit ID
        user_states[user_id] = {
            'state': 'waiting_deposit_id',
            'message_id': call.message.message_id,
            'chat_id': call.message.chat.id
        }
        
        # Show deposit ID input prompt
        response = """
💰 **Deposit Management**

Please enter the **Deposit ID** you want to process:

📝 **Format:** Enter the deposit ID (e.g., `ABC123`)

⚠️ **Note:** Make sure the deposit ID exists and is in pending status.
        """
        
        keyboard = types.InlineKeyboardMarkup()
        keyboard.add(
            types.InlineKeyboardButton("🔙 Back to Admin", callback_data="deposit_back")
        )
        
        await bot.edit_message_text(
            chat_id=call.message.chat.id,
            message_id=call.message.message_id,
            text=response,
            parse_mode='Markdown',
            reply_markup=keyboard
        )
        
        logger.info(f"Deposit flow started for user {user_id}")
        
    except Exception as e:
        logger.error(f"Error in handle_deposit_start: {e}")
        await bot.answer_callback_query(call.id, "An error occurred")

async def handle_withdrawal_start(bot, call):
    """Handle the start of withdrawal flow"""
    try:
        user_id = str(call.from_user.id)
        
        # Set user state to waiting for withdrawal ID
        user_states[user_id] = {
            'state': 'waiting_withdrawal_id',
            'message_id': call.message.message_id,
            'chat_id': call.message.chat.id
        }
        
        # Show withdrawal ID input prompt
        response = """
💸 **Withdrawal Management**

Please enter the **Withdrawal ID** you want to process:

📝 **Format:** Enter the withdrawal ID (e.g., `WTH123`)

⚠️ **Note:** Make sure the withdrawal ID exists and is in pending status.
        """
        
        keyboard = types.InlineKeyboardMarkup()
        keyboard.add(
            types.InlineKeyboardButton("🔙 Back to Admin", callback_data="withdrawal_back")
        )
        
        await bot.edit_message_text(
            chat_id=call.message.chat.id,
            message_id=call.message.message_id,
            text=response,
            parse_mode='Markdown',
            reply_markup=keyboard
        )
        
        logger.info(f"Withdrawal flow started for user {user_id}")
        
    except Exception as e:
        logger.error(f"Error in handle_withdrawal_start: {e}")
        await bot.answer_callback_query(call.id, "An error occurred")

async def handle_deposit_complete(bot, call):
    """Handle deposit completion"""
    try:
        user_id = str(call.from_user.id)
        
        if user_id not in user_states:
            await bot.answer_callback_query(call.id, "No active deposit session")
            return
        
        state = user_states[user_id]
        
        if 'deposit_id' not in state or 'amount' not in state:
            await bot.answer_callback_query(call.id, "Missing deposit information")
            return
        
        # Process the deposit
        firebase_service = get_firebase_service()
        success = firebase_service.approve_deposit(state['deposit_id'], state['amount'])
        
        if success:
            response = f"""
✅ **Deposit Completed Successfully!**

📋 **Details:**
• Deposit ID: `{state['deposit_id']}`
• Amount Approved: ${state['amount']:.2f}
• Status: ✅ Approved

💰 The user's balance has been updated accordingly.
            """
        else:
            response = f"""
❌ **Deposit Processing Failed**

📋 **Details:**
• Deposit ID: `{state['deposit_id']}`
• Amount: ${state['amount']:.2f}

⚠️ **Possible reasons:**
• Deposit ID not found
• Deposit already processed
• Database error

Please verify the deposit ID and try again.
            """
        
        # Clear user state
        del user_states[user_id]
        
        keyboard = types.InlineKeyboardMarkup()
        keyboard.add(
            types.InlineKeyboardButton("🔙 Back to Admin", callback_data="deposit_back")
        )
        
        await bot.edit_message_text(
            chat_id=call.message.chat.id,
            message_id=call.message.message_id,
            text=response,
            parse_mode='Markdown',
            reply_markup=keyboard
        )
        
        logger.info(f"Deposit completed for user {user_id}: {success}")
        
    except Exception as e:
        logger.error(f"Error in handle_deposit_complete: {e}")
        await bot.answer_callback_query(call.id, "An error occurred")

async def handle_withdrawal_complete(bot, call):
    """Handle withdrawal completion"""
    try:
        user_id = str(call.from_user.id)
        
        if user_id not in user_states:
            await bot.answer_callback_query(call.id, "No active withdrawal session")
            return
        
        state = user_states[user_id]
        
        if 'withdrawal_id' not in state or 'amount' not in state:
            await bot.answer_callback_query(call.id, "Missing withdrawal information")
            return
        
        # Process the withdrawal
        firebase_service = get_firebase_service()
        success = firebase_service.approve_withdrawal(state['withdrawal_id'], state['amount'])
        
        if success:
            response = f"""
✅ **Withdrawal Completed Successfully!**

📋 **Details:**
• Withdrawal ID: `{state['withdrawal_id']}`
• Amount Approved: ${state['amount']:.2f}
• Status: ✅ Approved

💰 The user's balance has been deducted accordingly.
            """
        else:
            response = f"""
❌ **Withdrawal Processing Failed**

📋 **Details:**
• Withdrawal ID: `{state['withdrawal_id']}`
• Amount: ${state['amount']:.2f}

⚠️ **Possible reasons:**
• Withdrawal ID not found
• Withdrawal already processed
• Insufficient user balance
• Database error

Please verify the withdrawal ID and try again.
            """
        
        # Clear user state
        del user_states[user_id]
        
        keyboard = types.InlineKeyboardMarkup()
        keyboard.add(
            types.InlineKeyboardButton("🔙 Back to Admin", callback_data="withdrawal_back")
        )
        
        await bot.edit_message_text(
            chat_id=call.message.chat.id,
            message_id=call.message.message_id,
            text=response,
            parse_mode='Markdown',
            reply_markup=keyboard
        )
        
        logger.info(f"Withdrawal completed for user {user_id}: {success}")
        
    except Exception as e:
        logger.error(f"Error in handle_withdrawal_complete: {e}")
        await bot.answer_callback_query(call.id, "An error occurred")

async def handle_admin_dashboard(bot, call):
    """Return to admin dashboard"""
    try:
        user_id = str(call.from_user.id)
        
        # Clear user state if exists
        if user_id in user_states:
            del user_states[user_id]
        
        # Show admin dashboard
        dashboard_text = """
🔧 **Admin Dashboard**

📊 **Transaction Management:**
Select an option below to manage transactions.

✅ **Available Features:**
• 💰 Deposit - Process pending deposits
• 💸 Withdraw - Process pending withdrawals
• 🟡 Pending Transactions - View all pending transactions
        """
        
        keyboard = generate_admin_keyboard()
        
        await bot.edit_message_text(
            chat_id=call.message.chat.id,
            message_id=call.message.message_id,
            text=dashboard_text,
            parse_mode='Markdown',
            reply_markup=keyboard
        )
        
        logger.info(f"Admin dashboard displayed for user {user_id}")
        
    except Exception as e:
        logger.error(f"Error in handle_admin_dashboard: {e}")
        await bot.answer_callback_query(call.id, "An error occurred")

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

def generate_admin_keyboard():
    """Generate simple admin dashboard keyboard with 3 buttons"""
    keyboard = types.InlineKeyboardMarkup(row_width=1)
    
    # Three main admin buttons
    keyboard.add(
        types.InlineKeyboardButton("💰 Deposit", callback_data="admin_deposit")
    )
    keyboard.add(
        types.InlineKeyboardButton("💸 Withdraw", callback_data="admin_withdraw")
    )
    keyboard.add(
        types.InlineKeyboardButton("🟡 Pending Transactions", callback_data="admin_pending")
    )
    
    return keyboard

def get_welcome_message(username, language='english'):
    """Get welcome message for specified language"""
    lang_data = BotConfig.LANGUAGES.get(language, BotConfig.LANGUAGES['english'])
    return lang_data['welcome'].format(username=username)

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

def get_error_message(language='english'):
    """Get error message for specified language"""
    lang_data = BotConfig.LANGUAGES.get(language, BotConfig.LANGUAGES['english'])
    return lang_data['error']

async def handle_pending_transactions(bot, call):
    """Handle pending transactions display"""
    try:
        user_id = str(call.from_user.id)
        
        # Fetch pending transactions and statistics from Firebase
        firebase_service = get_firebase_service()
        pending_deposits = firebase_service.get_pending_deposits()
        pending_withdrawals = firebase_service.get_pending_withdrawals()
        stats = firebase_service.get_transaction_statistics()
        
        # Build response message
        response = "🟡 **Pending Transactions**\n\n"
        
        # Add statistics header
        response += f"📊 **Overview:**\n"
        response += f"• Total Pending: **{stats['total_pending']}**\n"
        response += f"• Pending Deposits: **{stats['pending_deposits_count']}** (${stats['total_deposit_amount']:.2f})\n"
        response += f"• Pending Withdrawals: **{stats['pending_withdrawals_count']}** (${stats['total_withdrawal_amount']:.2f})\n"
        response += f"• Total Users: **{stats['total_users']}**\n\n"
        
        if not pending_deposits and not pending_withdrawals:
            response += "✅ **No pending transactions found!**\n\nAll transactions have been processed."
        else:
            # Display pending deposits
            if pending_deposits:
                response += f"💰 **Pending Deposits ({len(pending_deposits)})**\n"
                response += "─" * 40 + "\n"
                
                for i, deposit in enumerate(pending_deposits[:5], 1):  # Show first 5
                    # Get user information
                    user_data = firebase_service.get_user_by_id(deposit.get('user_id'))
                    if user_data:
                        user_info = f"@{user_data.get('username', 'Unknown')}" if user_data.get('username') else f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip() or f"User {deposit.get('user_id', 'Unknown')}"
                    else:
                        user_info = f"User {deposit.get('user_id', 'Unknown')}"
                    
                    amount = deposit.get('amount', 0)
                    network = deposit.get('network_name', deposit.get('network', 'Unknown'))
                    created_at = deposit.get('created_at', 'Unknown')
                    
                    # Format timestamp if available
                    if hasattr(created_at, 'strftime'):
                        time_str = created_at.strftime('%Y-%m-%d %H:%M')
                    else:
                        time_str = str(created_at)[:19] if created_at else 'Unknown'
                    
                    response += f"{i}. **ID:** `{deposit['id']}`\n"
                    response += f"   👤 **User:** {user_info}\n"
                    response += f"   💵 **Amount:** ${amount:.2f} {network}\n"
                    response += f"   ⏰ **Time:** {time_str}\n\n"
                
                if len(pending_deposits) > 5:
                    response += f"*... and {len(pending_deposits) - 5} more deposits*\n\n"
            
            # Display pending withdrawals
            if pending_withdrawals:
                response += f"💸 **Pending Withdrawals ({len(pending_withdrawals)})**\n"
                response += "─" * 40 + "\n"
                
                for i, withdrawal in enumerate(pending_withdrawals[:5], 1):  # Show first 5
                    # Get user information
                    user_data = firebase_service.get_user_by_id(withdrawal.get('user_id'))
                    if user_data:
                        user_info = f"@{user_data.get('username', 'Unknown')}" if user_data.get('username') else f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip() or f"User {withdrawal.get('user_id', 'Unknown')}"
                    else:
                        user_info = f"User {withdrawal.get('user_id', 'Unknown')}"
                    
                    amount = withdrawal.get('amount', 0)
                    network = withdrawal.get('network_name', withdrawal.get('network', 'Unknown'))
                    address = withdrawal.get('withdrawal_address', 'Unknown')
                    created_at = withdrawal.get('created_at', 'Unknown')
                    
                    # Format timestamp if available
                    if hasattr(created_at, 'strftime'):
                        time_str = created_at.strftime('%Y-%m-%d %H:%M')
                    else:
                        time_str = str(created_at)[:19] if created_at else 'Unknown'
                    
                    response += f"{i}. **ID:** `{withdrawal['id']}`\n"
                    response += f"   👤 **User:** {user_info}\n"
                    response += f"   💵 **Amount:** ${amount:.2f} {network}\n"
                    response += f"   📍 **Address:** `{address[:20]}...`\n"
                    response += f"   ⏰ **Time:** {time_str}\n\n"
                
                if len(pending_withdrawals) > 5:
                    response += f"*... and {len(pending_withdrawals) - 5} more withdrawals*\n\n"
            
            response += "💡 **Quick Actions:**\n"
            response += "• Use 💰 **Process Deposits** to approve deposits\n"
            response += "• Use 💸 **Process Withdrawals** to approve withdrawals\n"
        
        # Create keyboard with action buttons
        keyboard = types.InlineKeyboardMarkup(row_width=2)
        keyboard.add(
            types.InlineKeyboardButton("💰 Process Deposits", callback_data="admin_deposit"),
            types.InlineKeyboardButton("💸 Process Withdrawals", callback_data="admin_withdraw")
        )
        keyboard.add(
            types.InlineKeyboardButton("🔙 Back to Admin", callback_data="admin_back")
        )
        
        await bot.edit_message_text(
            chat_id=call.message.chat.id,
            message_id=call.message.message_id,
            text=response,
            parse_mode='Markdown',
            reply_markup=keyboard
        )
        
        logger.info(f"Pending transactions displayed for user {user_id}: {len(pending_deposits)} deposits, {len(pending_withdrawals)} withdrawals")
        
    except Exception as e:
        logger.error(f"Error in handle_pending_transactions: {e}")
        await bot.answer_callback_query(call.id, "An error occurred")
        await bot.edit_message_text(
            chat_id=call.message.chat.id,
            message_id=call.message.message_id,
            text="❌ **Error Loading Pending Transactions**\n\nAn error occurred while fetching pending transactions. Please try again.",
            parse_mode='Markdown'
        ) 