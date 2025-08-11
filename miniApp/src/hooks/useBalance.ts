import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { updateBalance } from '@/store/userSlice';
import { fetchUserBalance, updateUserBalance } from '@/lib/api';
import { useUser } from '@/contexts/UserProvider';

export const useBalance = () => {
  const dispatch = useDispatch();
  const { user } = useUser();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch balance on mount and when user changes
  useEffect(() => {
    if (!user?.uid) return;

    const fetchBalance = async () => {
      setLoading(true);
      setError(null);
      try {
        const userBalance = await fetchUserBalance(user.uid);
        setBalance(userBalance);
        dispatch(updateBalance(userBalance));
      } catch (err) {
        setError('Failed to fetch balance');
        console.error('Error fetching balance:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [user?.uid, dispatch]);

  // Function to update balance
  const updateBalanceInBackend = useCallback(async (newBalance: number) => {
    if (!user?.uid) return false;

    setLoading(true);
    setError(null);
    try {
      const success = await updateUserBalance(user.uid, newBalance);
      if (success) {
        setBalance(newBalance);
        dispatch(updateBalance(newBalance));
      } else {
        setError('Failed to update balance');
      }
      return success;
    } catch (err) {
      setError('Failed to update balance');
      console.error('Error updating balance:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.uid, dispatch]);

  // Function to refresh balance
  const refreshBalance = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError(null);
    try {
      const userBalance = await fetchUserBalance(user.uid);
      setBalance(userBalance);
      dispatch(updateBalance(userBalance));
    } catch (err) {
      setError('Failed to refresh balance');
      console.error('Error refreshing balance:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, dispatch]);

  return {
    balance,
    loading,
    error,
    updateBalance: updateBalanceInBackend,
    refreshBalance,
  };
}; 