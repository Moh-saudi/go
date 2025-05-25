// src/lib/firebase/config.ts
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDCQQxUbeQQrlty5HnF65-7TK0TB2zB7R4",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "hagzzgo-87884.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "hagzzgo-87884",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "hagzzgo-87884.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "865241332465",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:865241332465:web:158ed5fb2f0a80eecf0750",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-RQ3ENTG6KJ"
};

// تهيئة Firebase - التحقق من عدم تكرار التهيئة
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | null = null;

// تهيئة الخدمات فقط إذا لم يتم ذلك بالفعل
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  // تهيئة Analytics فقط في بيئة المتصفح
  if (typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(app);
    } catch (error) {
      console.error('Analytics initialization error:', error);
    }
  }
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db, analytics };