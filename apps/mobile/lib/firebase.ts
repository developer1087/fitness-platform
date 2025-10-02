import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Production Firebase Configuration (same as web app)
const firebaseConfig = {
  apiKey: "AIzaSyBv4edZFdKq5UieQchPC3SXjDtKXuUYsd0",
  authDomain: "fitness-platform-us-1759049736.firebaseapp.com",
  projectId: "fitness-platform-us-1759049736",
  storageBucket: "fitness-platform-us-1759049736.firebasestorage.app",
  messagingSenderId: "388593504795",
  appId: "1:388593504795:web:f0c3b2e60b3076d2cd9ebe",
  measurementId: "G-657169BEFM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth (getAuth works for both web and React Native)
const auth = getAuth(app);

// Initialize other Firebase services
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app;