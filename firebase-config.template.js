import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Este arquivo será processado por build.js para substituir os valores abaixo

const firebaseConfig = {
  apiKey: "%%APIKEY%%",
  authDomain: "%%AUTHDOMAIN%%",
  projectId: "%%PROJECTID%%",
  storageBucket: "%%STORAGEBUCKET%%",  
  messagingSenderId: "%%MESSAGINGSENDERID%%",
  appId: "%%APPID%%",
  measurementId: "%%MEASUREMENTID%%",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
