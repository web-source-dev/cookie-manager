// Firebase Configuration
// Load from environment variables
import dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyBjJqzENRfqkG4BGmNIBL7qsZD26j-wZRU", // You'll need to get this from Firebase Console
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "kuch-bhi-b9078.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "kuch-bhi-b9078",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "kkuch-bhi-b9078.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "555595075111",
    appId: process.env.FIREBASE_APP_ID || "1:555595075111:web:6f1711efd415f1b3284802" // You'll need to get this from Firebase Console
};

// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
}

export { db, auth };
export default app;
