"""
Firebase Firestore service for user data management
"""
import logging
import firebase_admin
from firebase_admin import credentials, firestore
from config import BotConfig

logger = logging.getLogger(__name__)

class FirebaseService:
    """Firebase Firestore service for managing user data"""
    
    def __init__(self):
        """Initialize Firebase service"""
        try:
            # Get Firebase credentials
            cred_dict = BotConfig.get_firebase_credentials()
            cred = credentials.Certificate(cred_dict)
            
            # Initialize Firebase app
            firebase_admin.initialize_app(cred, {
                'projectId': BotConfig.FIREBASE_PROJECT_ID
            })
            
            # Initialize Firestore client
            self.db = firestore.client()
            logger.info("Firebase service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Firebase service: {e}")
            raise
    
    def create_or_update_user(self, user_data):
        """
        Create or update user in Firestore
        
        Args:
            user_data (dict): User data to store
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            user_id = str(user_data['user_id'])
            user_ref = self.db.collection('users').document(user_id)
            
            # Prepare user document data
            doc_data = {
                'user_id': user_id,
                'first_name': user_data.get('first_name', ''),
                'last_name': user_data.get('last_name', ''),
                'username': user_data.get('username', ''),
                'language_code': user_data.get('language_code', 'english'),
                'is_premium': user_data.get('is_premium', False),
                'balance': user_data.get('balance', 0),
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'last_activity': firestore.SERVER_TIMESTAMP
            }
            
            # Check if user exists
            user_doc = user_ref.get()
            
            if user_doc.exists:
                # Update existing user (preserve balance and other fields)
                existing_data = user_doc.to_dict()
                doc_data['balance'] = existing_data.get('balance', 0)
                doc_data['created_at'] = existing_data.get('created_at')
                doc_data['updated_at'] = firestore.SERVER_TIMESTAMP
                
                user_ref.update(doc_data)
                logger.info(f"Updated user {user_id} in database")
            else:
                # Create new user
                user_ref.set(doc_data)
                logger.info(f"Created new user {user_id} in database")
            
            return True
            
        except Exception as e:
            logger.error(f"Error creating/updating user {user_data.get('user_id')}: {e}")
            return False

    def get_pending_deposits(self):
        """
        Get all pending deposits from Firestore
        
        Returns:
            list: List of pending deposit documents
        """
        try:
            deposits_ref = self.db.collection('deposits')
            query = deposits_ref.where('status', '==', 'pending')
            docs = query.stream()
            
            deposits = []
            for doc in docs:
                deposit_data = doc.to_dict()
                deposit_data['id'] = doc.id
                deposits.append(deposit_data)
            
            logger.info(f"Retrieved {len(deposits)} pending deposits")
            return deposits
            
        except Exception as e:
            logger.error(f"Error fetching pending deposits: {e}")
            return []

    def get_pending_withdrawals(self):
        """
        Get all pending withdrawals from Firestore
        
        Returns:
            list: List of pending withdrawal documents
        """
        try:
            withdrawals_ref = self.db.collection('withdrawals')
            query = withdrawals_ref.where('status', '==', 'pending')
            docs = query.stream()
            
            withdrawals = []
            for doc in docs:
                withdrawal_data = doc.to_dict()
                withdrawal_data['id'] = doc.id
                withdrawals.append(withdrawal_data)
            
            logger.info(f"Retrieved {len(withdrawals)} pending withdrawals")
            return withdrawals
            
        except Exception as e:
            logger.error(f"Error fetching pending withdrawals: {e}")
            return []

    def get_deposit_by_id(self, deposit_id):
        """
        Get a specific deposit by ID
        
        Args:
            deposit_id (str): Deposit document ID
            
        Returns:
            dict: Deposit data or None if not found
        """
        try:
            deposit_ref = self.db.collection('deposits').document(deposit_id)
            doc = deposit_ref.get()
            
            if doc.exists:
                deposit_data = doc.to_dict()
                deposit_data['id'] = doc.id
                return deposit_data
            else:
                logger.warning(f"Deposit {deposit_id} not found")
                return None
                
        except Exception as e:
            logger.error(f"Error fetching deposit {deposit_id}: {e}")
            return None

    def get_withdrawal_by_id(self, withdrawal_id):
        """
        Get a specific withdrawal by ID
        
        Args:
            withdrawal_id (str): Withdrawal document ID
            
        Returns:
            dict: Withdrawal data or None if not found
        """
        try:
            withdrawal_ref = self.db.collection('withdrawals').document(withdrawal_id)
            doc = withdrawal_ref.get()
            
            if doc.exists:
                withdrawal_data = doc.to_dict()
                withdrawal_data['id'] = doc.id
                return withdrawal_data
            else:
                logger.warning(f"Withdrawal {withdrawal_id} not found")
                return None
                
        except Exception as e:
            logger.error(f"Error fetching withdrawal {withdrawal_id}: {e}")
            return None

    def approve_deposit(self, deposit_id, admin_amount):
        """
        Accept amount manually from admin and update the deposit status to approved and update the user balance
        
        Args:
            deposit_id (str): Deposit document ID
            admin_amount (float): Amount approved by admin
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Get deposit data
            deposit_data = self.get_deposit_by_id(deposit_id)
            if not deposit_data:
                logger.error(f"Deposit {deposit_id} not found for approval")
                return False
            
            if deposit_data['status'] != 'pending':
                logger.warning(f"Deposit {deposit_id} is not pending (status: {deposit_data['status']})")
                return False
            
            user_id = deposit_data['user_id']
            original_amount = deposit_data['amount']
            
            # Update deposit status to approved with admin amount
            deposit_ref = self.db.collection('deposits').document(deposit_id)
            deposit_ref.update({
                'status': 'approved',
                'updated_at': firestore.SERVER_TIMESTAMP
            })
            
            # Update user balance with admin amount
            user_ref = self.db.collection('users').document(user_id)
            user_doc = user_ref.get()
            
            if user_doc.exists:
                current_balance = user_doc.to_dict().get('balance', 0)
                new_balance = current_balance + admin_amount
                
                user_ref.update({
                    'balance': new_balance,
                    'updated_at': firestore.SERVER_TIMESTAMP
                })
                
                logger.info(f"Approved deposit {deposit_id}: User {user_id} balance updated from {current_balance} to {new_balance} (admin amount: {admin_amount}, original: {original_amount})")
                return True
            else:
                logger.error(f"User {user_id} not found for balance update")
                return False
                
        except Exception as e:
            logger.error(f"Error approving deposit {deposit_id}: {e}")
            return False

    def approve_withdrawal(self, withdrawal_id, admin_amount):
        """
        Approve withdrawal manually from admin and update the withdrawal status to approved and deduct from user balance
        
        Args:
            withdrawal_id (str): Withdrawal document ID
            admin_amount (float): Amount approved by admin
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Get withdrawal data
            withdrawal_data = self.get_withdrawal_by_id(withdrawal_id)
            if not withdrawal_data:
                logger.error(f"Withdrawal {withdrawal_id} not found for approval")
                return False
            
            if withdrawal_data['status'] != 'pending':
                logger.warning(f"Withdrawal {withdrawal_id} is not pending (status: {withdrawal_data['status']})")
                return False
            
            user_id = withdrawal_data['user_id']
            original_amount = withdrawal_data['amount']
            
            # Check if user has sufficient balance
            user_ref = self.db.collection('users').document(user_id)
            user_doc = user_ref.get()
            
            if not user_doc.exists:
                logger.error(f"User {user_id} not found for balance check")
                return False
            
            current_balance = user_doc.to_dict().get('balance', 0)
            
            if current_balance < admin_amount:
                logger.warning(f"Insufficient balance for withdrawal {withdrawal_id}: User {user_id} has {current_balance}, requested {admin_amount}")
                return False
            
            # Update withdrawal status to approved
            withdrawal_ref = self.db.collection('withdrawals').document(withdrawal_id)
            withdrawal_ref.update({
                'status': 'approved',
                'updated_at': firestore.SERVER_TIMESTAMP
            })
            
            # Deduct from user balance
            new_balance = current_balance - admin_amount
            
            user_ref.update({
                'balance': new_balance,
                'updated_at': firestore.SERVER_TIMESTAMP
            })
            
            logger.info(f"Approved withdrawal {withdrawal_id}: User {user_id} balance updated from {current_balance} to {new_balance} (admin amount: {admin_amount}, original: {original_amount})")
            return True
                
        except Exception as e:
            logger.error(f"Error approving withdrawal {withdrawal_id}: {e}")
            return False

    def get_transaction_statistics(self):
        """
        Get transaction statistics for admin dashboard
        
        Returns:
            dict: Statistics including counts and totals
        """
        try:
            # Get pending deposits
            pending_deposits = self.get_pending_deposits()
            pending_withdrawals = self.get_pending_withdrawals()
            
            # Calculate totals
            total_deposit_amount = sum(deposit.get('amount', 0) for deposit in pending_deposits)
            total_withdrawal_amount = sum(withdrawal.get('amount', 0) for withdrawal in pending_withdrawals)
            
            # Get user count
            users_ref = self.db.collection('users')
            total_users = len(list(users_ref.stream()))
            
            stats = {
                'pending_deposits_count': len(pending_deposits),
                'pending_withdrawals_count': len(pending_withdrawals),
                'total_pending': len(pending_deposits) + len(pending_withdrawals),
                'total_deposit_amount': total_deposit_amount,
                'total_withdrawal_amount': total_withdrawal_amount,
                'total_users': total_users
            }
            
            logger.info(f"Retrieved transaction statistics: {stats}")
            return stats
            
        except Exception as e:
            logger.error(f"Error fetching transaction statistics: {e}")
            return {
                'pending_deposits_count': 0,
                'pending_withdrawals_count': 0,
                'total_pending': 0,
                'total_deposit_amount': 0,
                'total_withdrawal_amount': 0,
                'total_users': 0
            }

    def get_user_by_id(self, user_id):
        """
        Get user information by user ID
        
        Args:
            user_id (str): User ID
            
        Returns:
            dict: User data or None if not found
        """
        try:
            user_ref = self.db.collection('users').document(user_id)
            doc = user_ref.get()
            
            if doc.exists:
                user_data = doc.to_dict()
                user_data['id'] = doc.id
                return user_data
            else:
                logger.warning(f"User {user_id} not found")
                return None
                
        except Exception as e:
            logger.error(f"Error fetching user {user_id}: {e}")
            return None

# Global Firebase service instance
firebase_service = None

def get_firebase_service():
    """Get Firebase service instance"""
    global firebase_service
    if firebase_service is None:
        firebase_service = FirebaseService()
    return firebase_service 