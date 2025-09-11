// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDXljGu9k_AX_GnzmJQ8knPIX7wfKHS7-o",
  authDomain: "fit5032-yliu.firebaseapp.com",
  projectId: "fit5032-yliu",
  storageBucket: "fit5032-yliu.firebasestorage.app",
  messagingSenderId: "141153786522",
  appId: "1:141153786522:web:9b8ffeb28cc99016f5dd23"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

onAuthStateChanged(auth, (user) => {
  console.log(user);
  if (user) {
    console.log(user.email);
  }
});
