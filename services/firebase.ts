import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from './firebaseConfig';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app); // <-- تعريف Firestore
export const storage = getStorage(app);
