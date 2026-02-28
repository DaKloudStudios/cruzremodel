import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDOtiZ8mHUQHSE4L1QzMEgK_4dg-kowVKk",
    authDomain: "chriscruz-581eb.firebaseapp.com",
    projectId: "chriscruz-581eb",
    storageBucket: "chriscruz-581eb.firebasestorage.app",
    messagingSenderId: "454764657019",
    appId: "1:454764657019:web:8b81a8f27709ff07e7e5de"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
