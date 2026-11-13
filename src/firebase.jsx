import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyMockKeyForEnvironmentSafety00",
  authDomain: "wandergen---ai-travel-planner.firebaseapp.com",
  projectId: "wandergen---ai-travel-planner",
  storageBucket: "wandergen---ai-travel-planner.appspot.com",
  messagingSenderId: "580794530028",
  appId: "1:580794530028:web:d2f89fb2d3eb6d59fa4dc9",
  measurementId: "G-BMF6MV66M8"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
