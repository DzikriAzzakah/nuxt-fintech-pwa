import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCsUVEUR1cNJkHY7AnOZWEDrSsyrHM9TBg",
  authDomain: "nuxt-fintech-pwa.firebaseapp.com",
  projectId: "nuxt-fintech-pwa",
  storageBucket: "nuxt-fintech-pwa.firebasestorage.app",
  messagingSenderId: "270544277817",
  appId: "1:270544277817:web:089252f75d771b1ca358e8",
  measurementId: "G-VTEC68ZZNB"
};
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
