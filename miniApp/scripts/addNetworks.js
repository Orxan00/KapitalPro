const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc } = require('firebase/firestore');
require('dotenv').config({ path: '../.env' });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Network configurations
const networks = [
  {
    id: 'usdt-trc20',
    name: 'Tron (TRC20) - USDT',
    symbol: 'USDT',
    address: 'TXvKyQxfDoQiAG2uHdBn3GGPrL5wqFoyuB',
    icon: '💎',
    type: 'deposit',
    isActive: true
  },
  {
    id: 'usdt-bep20',
    name: 'BNB (BEP20) - USDT',
    symbol: 'USDT',
    address: '0x25d2be7148dee80d3d8797403ec8026b709d2ced',
    icon: '🟡',
    type: 'deposit',
    isActive: true
  },
  {
    id: 'usdt-arbitrum',
    name: 'Arbitrum One - USDT',
    symbol: 'USDT',
    address: '0x25d2be7148dee80d3d8797403ec8026b709d2ced',
    icon: '🔵',
    type: 'deposit',
    isActive: true
  },
  {
    id: 'usdt-aptos',
    name: 'Aptos USDT',
    symbol: 'USDT',
    address: '0x2c7249a069c427ec6d2c00f3e0223586942205a0eeefbaa48753bab7256f1b8a',
    icon: '🟣',
    type: 'deposit',
    isActive: true
  }
];

// Withdrawal networks (same networks but for withdrawal)
const withdrawalNetworks = [
  {
    id: 'usdt-trc20-withdraw',
    name: 'Tron (TRC20) - USDT',
    symbol: 'USDT',
    icon: '💎',
    type: 'withdrawal',
    isActive: true
  },
  {
    id: 'usdt-bep20-withdraw',
    name: 'BNB (BEP20) - USDT',
    symbol: 'USDT',
    icon: '🟡',
    type: 'withdrawal',
    isActive: true
  },
  {
    id: 'usdt-arbitrum-withdraw',
    name: 'Arbitrum One - USDT',
    symbol: 'USDT',
    icon: '🔵',
    type: 'withdrawal',
    isActive: true
  },
  {
    id: 'usdt-aptos-withdraw',
    name: 'Aptos USDT',
    symbol: 'USDT',
    icon: '🟣',
    type: 'withdrawal',
    isActive: true
  }
];

async function addNetworks() {
  try {
    console.log('🚀 Starting to add networks to Firebase...');
    
    const networksRef = collection(db, 'networks');
    
    // Add deposit networks
    console.log('📥 Adding deposit networks...');
    for (const network of networks) {
      try {
        await setDoc(doc(networksRef, network.id), network);
        console.log(`✅ Added deposit network: ${network.name}`);
      } catch (error) {
        console.error(`❌ Error adding deposit network ${network.name}:`, error);
      }
    }
    
    // Add withdrawal networks
    console.log('📤 Adding withdrawal networks...');
    for (const network of withdrawalNetworks) {
      try {
        await setDoc(doc(networksRef, network.id), network);
        console.log(`✅ Added withdrawal network: ${network.name}`);
      } catch (error) {
        console.error(`❌ Error adding withdrawal network ${network.name}:`, error);
      }
    }
    
    console.log('🎉 All networks have been added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding networks:', error);
  }
}

// Run the script
addNetworks().then(() => {
  console.log('Script completed!');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
}); 