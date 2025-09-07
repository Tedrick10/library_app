import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDOtEXjWx54d8AuyX6cbzOselKyDzNOGZo",
  authDomain: "library-app-cdf61.firebaseapp.com",
  projectId: "library-app-cdf61",
  storageBucket: "library-app-cdf61.firebasestorage.app",
  messagingSenderId: "515880385706",
  appId: "1:515880385706:web:14f17c68bcb4822877e4d3",
  measurementId: "G-5KTLCLDKFP"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firebaseApp = app; // Export the Firebase app instance
export const googleProvider = new GoogleAuthProvider();