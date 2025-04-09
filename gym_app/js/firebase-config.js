// Firebase 設定
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCGsox95fxZh4J4ZQz4pm2o2_YwXUbXcaU",
  authDomain: "fudaoxiang-chat.firebaseapp.com",
  projectId: "fudaoxiang-chat",
  storageBucket: "fudaoxiang-chat.firebasestorage.app",
  messagingSenderId: "1008159058306",
  appId: "1:1008159058306:web:4ba3fd0ed4595a09ac479b",
  measurementId: "G-EWMWZBX4TT"
};

// Firebase 初期化
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// グローバル変数として設定
window.db = db;
window.auth = auth; 