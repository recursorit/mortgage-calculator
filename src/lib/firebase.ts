import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

export function isFirebaseConfigured(): boolean {
  return Boolean(
    import.meta.env.PUBLIC_FIREBASE_API_KEY &&
      import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN &&
      import.meta.env.PUBLIC_FIREBASE_PROJECT_ID &&
      import.meta.env.PUBLIC_FIREBASE_APP_ID,
  );
}

function requiredEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Firebase is not configured (missing ${name}). Set PUBLIC_FIREBASE_* env vars (e.g. in .env.local).`,
    );
  }
  return value;
}

function getFirebaseConfig() {
  return {
    apiKey: requiredEnv(
      'PUBLIC_FIREBASE_API_KEY',
      import.meta.env.PUBLIC_FIREBASE_API_KEY,
    ),
    authDomain: requiredEnv(
      'PUBLIC_FIREBASE_AUTH_DOMAIN',
      import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
    ),
    projectId: requiredEnv(
      'PUBLIC_FIREBASE_PROJECT_ID',
      import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
    ),
    storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: requiredEnv(
      'PUBLIC_FIREBASE_APP_ID',
      import.meta.env.PUBLIC_FIREBASE_APP_ID,
    ),
  } as const;
}

let appSingleton: FirebaseApp | null = null;
let authSingleton: Auth | null = null;
let dbSingleton: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!appSingleton) {
    appSingleton = initializeApp(getFirebaseConfig());
  }
  return appSingleton;
}

export function getFirebaseAuth(): Auth {
  if (!authSingleton) {
    authSingleton = getAuth(getFirebaseApp());
  }
  return authSingleton;
}

export function getFirebaseDb(): Firestore {
  if (!dbSingleton) {
    dbSingleton = getFirestore(getFirebaseApp());
  }
  return dbSingleton;
}
