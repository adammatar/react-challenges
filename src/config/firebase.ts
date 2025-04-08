import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NODE_ENV === 'test' ? 'test-api-key' : import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.NODE_ENV === 'test' ? 'test-auth-domain' : import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NODE_ENV === 'test' ? 'test-project-id' : import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NODE_ENV === 'test' ? 'test-storage-bucket' : import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NODE_ENV === 'test' ? 'test-messaging-sender-id' : import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NODE_ENV === 'test' ? 'test-app-id' : import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Set persistence to local
setPersistence(auth, browserLocalPersistence);

export default app; 