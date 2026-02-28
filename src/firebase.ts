// Firebase configuration - replace with your project credentials
// Get config from Firebase Console > Project Settings > General > Your apps

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getMessaging, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let messaging: Messaging | null = null;

export function initFirebase(): FirebaseApp {
  if (app) return app;
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      messaging = getMessaging(app);
    } catch {
      // Messaging not supported in this environment
    }
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) initFirebase();
  return auth!;
}

export function getFirebaseDb(): Firestore {
  if (!db) initFirebase();
  return db!;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) initFirebase();
  return storage!;
}

export function getFirebaseMessaging(): Messaging | null {
  if (!messaging && app) {
    try {
      messaging = getMessaging(app);
    } catch {
      return null;
    }
  }
  return messaging;
}

export { app };
