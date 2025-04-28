// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCSJHZqPSsaswjczptvKcJzgfsIgNbZqyg",
  authDomain: "aceleratec-41568.firebaseapp.com",
  projectId: "aceleratec-41568",
  storageBucket: "aceleratec-41568.appspot.com",  
  messagingSenderId: "568282188545",
  appId: "1:568282188545:web:a5278f52a2201317242900",
  measurementId: "G-484WC39M5F",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
