import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA6i6u4gHX_MwintfmgL28oFoQjufLYBd4",
  authDomain: "tidy-8a203.firebaseapp.com",
  projectId: "tidy-8a203",
  storageBucket: "tidy-8a203.firebasestorage.app",
  messagingSenderId: "215404911667",
  appId: "1:215404911667:web:c179139d1c7060e5f59746",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
