import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, setLoading, setError } from '@/store/userSlice';
import { telegramId, firstName, lastName, userName, languageCode } from '@/lib/telegram';
import { initializeFirebase } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/types/user';

// Extend Window interface for Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
      };
    };
  }
}

interface UserContextType {
  isTelegramReady: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const [isTelegramReady, setIsTelegramReady] = useState(false);
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoadingState] = useState(true);
  const [error, setErrorState] = useState<string | null>(null);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Initialize Firebase first
        await initializeFirebase();
        
        if (!telegramId) {
          throw new Error('Telegram user not found');
        }

        // Create user object from Telegram data (fallback approach)
        const userData: User = {
          uid: String(telegramId),
          first_name: firstName || '',
          last_name: lastName || '',
          username: userName || '',
          language_code: languageCode || 'english',
          is_premium: false,
          balance: 0,
          created_at: Date.now(),
          updated_at: Date.now(),
          last_activity: Date.now(),
        };

        try {
          const userRef = doc(db, "users", String(telegramId));
          const docSnap = await getDoc(userRef);
          
          if (docSnap.exists()) {
            // Use existing user data from Firestore
            const data = docSnap.data();
            userData.first_name = data.first_name || userData.first_name;
            userData.last_name = data.last_name || userData.last_name;
            userData.username = data.username || userData.username;
            userData.language_code = data.language_code || userData.language_code;
            userData.is_premium = data.is_premium || false;
            userData.balance = data.balance || 0;
            userData.created_at = data.created_at?.toMillis?.() || userData.created_at;
            userData.updated_at = data.updated_at?.toMillis?.() || userData.updated_at;
            userData.last_activity = data.last_activity?.toMillis?.() || userData.last_activity;
          } else {
            try {
              const newUserData = {
                user_id: String(telegramId),
                first_name: userData.first_name,
                last_name: userData.last_name,
                username: userData.username,
                language_code: userData.language_code,
                balance: userData.balance,
                is_premium: userData.is_premium,
                created_at: new Date(),
                updated_at: new Date(),
                last_activity: new Date(),
              };
              await setDoc(userRef, newUserData);
            } catch (firestoreError) {
              console.warn('Could not save user to Firestore:', firestoreError);
            }
          }
        } catch (firestoreError) {
          console.warn('Firestore access denied, using local user data:', firestoreError);
        }
        
        dispatch(setUser(userData));
        setUserState(userData);
        setIsTelegramReady(true);
        dispatch(setLoading(false));
        setLoadingState(false);
      } catch (err) {
        console.error('User initialization error:', err);
        dispatch(setError('Failed to initialize user'));
        setErrorState('Failed to initialize user');
        dispatch(setLoading(false));
        setLoadingState(false);
      }
    };

    initializeUser();
  }, [dispatch]);

  // Initialize Telegram WebApp
  useEffect(() => {
    const initTelegram = async () => {
      try {
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.ready();
          window.Telegram.WebApp.expand();
        }
      } catch (error) {
        console.error('Telegram initialization error:', error);
      }
    };

    initTelegram();
  }, []);

  // Error boundary effect
  useEffect(() => {
    if (error) {
      dispatch(setError(error));
    }
  }, [error, dispatch]);

  const contextValue: UserContextType = {
    isTelegramReady,
    user,
    loading,
    error
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}; 