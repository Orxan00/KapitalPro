import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase function
export const initializeFirebase = async () => {
  return app;
};

// Fetch user balance from Firestore
export const getUserBalance = async (userId: string): Promise<number> => {
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      const userData = docSnap.data();
      return userData.balance || 0;
    }
    
    return 0;
  } catch (error) {
    console.error('Error fetching user balance:', error);
    return 0;
  }
};

// Subscribe to real-time balance updates
export const subscribeToBalance = (userId: string, callback: (balance: number) => void) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        const balance = userData.balance || 0;
        callback(balance);
      } else {
        callback(0);
      }
    }, (error) => {
      console.error('Error subscribing to balance updates:', error);
      callback(0);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up balance subscription:', error);
    return () => {}; // Return empty unsubscribe function
  }
};

// Update user balance in Firestore
export const updateUserBalance = async (userId: string, newBalance: number): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      balance: newBalance,
      updated_at: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating user balance:', error);
    return false;
  }
};

// Fetch networks from Firestore
export const getNetworks = async () => {
  try {
    const networksRef = collection(db, 'networks');
    const querySnapshot = await getDocs(networksRef);
    
    const networks = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];
    
    console.log('Networks fetched from Firebase:', networks);
    
    // If we successfully got networks from Firebase, return them
    if (networks && networks.length > 0) {
      return networks;
    }
   
  } catch (error) {
    
  }
}; 