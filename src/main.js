import "./assets/main.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
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
initializeApp(firebaseConfig);

const app = createApp(App);

app.use(router);

app.mount("#app");


