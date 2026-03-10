import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCOoAdqK_oVZts0QJNRSv5eVLEbRxleb80",
  authDomain: "summary-blog.firebaseapp.com",
  projectId: "summary-blog",
  storageBucket: "summary-blog.firebasestorage.app",
  messagingSenderId: "1051308334624",
  appId: "1:1051308334624:web:dc03c32336ba5589816645",
  measurementId: "G-1LVX9DYT8C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Authentication exports
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Firestore export
const db = getFirestore(app);

export { app, analytics, auth, googleProvider, db };
