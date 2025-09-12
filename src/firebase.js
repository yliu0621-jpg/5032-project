// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
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
export function parseUserRole(userString) {
  if (!userString) {
    return { username: '', role: '' };
  }
  let username = userString;
  let role = 'user';

  const lastColonIndex = userString.lastIndexOf(':');

  if (lastColonIndex !== -1) {
    // `username:role`
    const potentialUsername = userString.substring(0, lastColonIndex);
    const potentialRole = userString.substring(lastColonIndex + 1);

    if (potentialRole === 'admin' || potentialRole === 'user') {
      username = potentialUsername;
      role = potentialRole;
    }
  }

  return { username, role };
}
export function getUserName(user) {
  if (user) {
    return parseUserRole(user?.displayName).username
  } else {
    return parseUserRole(auth.currentUser?.displayName).username
  }
}
export function getUserRole(user) {
  if (user) {
    return parseUserRole(user?.displayName).role
  } else {
    return parseUserRole(auth.currentUser?.displayName).role
  }
}
