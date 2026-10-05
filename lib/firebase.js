import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyABR5jXmdochKkzQ-y45PA2GWQxvpcxxfQY",
  authDomain: "besutori.firebaseapp.com",
  databaseURL: "https://besutori-default-rtdb.firebaseio.com",
  projectId: "besutori",
  storageBucket: "besutori.firebasestorage.app",
  messagingSenderId: "252832925659",
  appId: "1:252832925659:web:44126edbdbe94e08aac9fe"
};

const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

export const db = getDatabase(app);
