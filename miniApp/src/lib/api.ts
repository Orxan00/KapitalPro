// API Configuration for Backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL}/api` 
  : 'http://localhost:3000/api';


// API Response type
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  transaction_id?: string;
  subscription_id?: string;
  currentBalance?: number;
  requiredAmount?: number;
}

// User types
interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  username: string;
  language_code: string;
  balance: number;
  is_premium?: boolean;
  created_at: any;
  updated_at: any;
  last_activity: any;
}

// Network types
interface Network {
  id: string;
  name: string;
  symbol: string;
  address?: string;
  icon: string;
  minAmount?: number;
  maxAmount: number;
  type: 'deposit' | 'withdrawal';
  isActive: boolean;
}

interface DepositData {
  user_id: string;
  user_username?: string;
  user_first_name?: string;
  user_last_name?: string;
  amount: number;
  network: string;
  network_name: string;
  transaction_ref: string;
}

interface WithdrawalData {
  user_id: string;
  user_username?: string;
  user_first_name?: string;
  user_last_name?: string;
  amount: number;
  network: string;
  network_name: string;
  withdrawal_address: string;
}

interface SubscriptionData {
  user_id: string;
  user_username?: string;
  user_first_name?: string;
  user_last_name?: string;
  package_name: string;
  package_price: number;
  daily_return: string;
  duration_days: number;
  total_return: number;
}

interface Subscription {
  id: string;
  user_id: string;
  package_name: string;
  package_price: number;
  daily_return: string;
  duration_days: number;
  total_return: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'pending';
  total_earned: number;
  remaining_days: number;
  last_earnings_update: string;
  created_at: string;
  updated_at: string;
}

// API Functions
class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
 
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });


      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Network error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // User endpoints
  async getUser(userId: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${userId}`);
  }

  // Transaction endpoints
  async createDeposit(depositData: DepositData): Promise<ApiResponse<{ transaction_id: string }>> {
    return this.request<{ transaction_id: string }>('/deposits', {
      method: 'POST',
      body: JSON.stringify(depositData),
    });
  }

  async createWithdrawal(withdrawalData: WithdrawalData): Promise<ApiResponse<{ transaction_id: string }>> {
    return this.request<{ transaction_id: string }>('/withdrawals', {
      method: 'POST',
      body: JSON.stringify(withdrawalData),
    });
  }

  // Subscription endpoints
  async createSubscription(subscriptionData: SubscriptionData): Promise<ApiResponse<{ subscription_id: string }>> {
    return this.request<{ subscription_id: string }>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
  }

  async getUserSubscriptions(userId: string): Promise<ApiResponse<Subscription[]>> {
    return this.request<Subscription[]>(`/subscriptions/user/${userId}`);
  }

  async getSubscriptionById(subscriptionId: string): Promise<ApiResponse<Subscription>> {
    return this.request<Subscription>(`/subscriptions/${subscriptionId}`);
  }

  async updateSubscriptionEarnings(subscriptionId: string): Promise<ApiResponse<{ amount_added: number }>> {
    return this.request<{ amount_added: number }>(`/subscriptions/${subscriptionId}/update-earnings`, {
      method: 'POST',
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types
export type { ApiResponse, User, Network, DepositData, WithdrawalData, SubscriptionData, Subscription };

// Balance API functions
export const fetchUserBalance = async (userId: string): Promise<number> => {
  try {
    const url = `${API_BASE_URL}/users/${userId}/balance`;
    
    const response = await fetch(url);

    if (!response.ok) {
      return 0;
    }
    
    const data = await response.json();
    
    if (data.success) {
      return data.balance;
    } else {
      return 0;
    }
  } catch (error) {
    return 0;
  }
};

export const updateUserBalance = async (userId: string, newBalance: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/balance`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ balance: newBalance }),
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    return false;
  }
};

// Transaction API functions
export const fetchUserDeposits = async (userId: string) => {
  try {
    const url = `${API_BASE_URL}/users/${userId}/deposits`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
};

export const fetchUserWithdrawals = async (userId: string) => {
  try {
    const url = `${API_BASE_URL}/users/${userId}/withdrawals`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
}; 