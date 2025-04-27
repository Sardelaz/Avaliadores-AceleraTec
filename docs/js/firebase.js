// dist/firebase.js
import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Função de registro
export function registrar(email, senha) {
  // Criação do usuário no Firebase Auth
  return createUserWithEmailAndPassword(auth, email, senha)
    .then((userCredential) => {
      console.log("Usuário registrado:", userCredential.user);

      // Após criar o usuário, podemos salvar os dados essenciais no Firestore
      return setDoc(doc(db, "usuarios", userCredential.user.uid), {
        email: email,
        criadoEm: new Date().toISOString(), // Data de criação
      })
        .then(() => {
          console.log("Dados do usuário salvos no Firestore.");
          return userCredential.user;
        })
        .catch((error) => {
          console.error("Erro ao salvar dados no Firestore:", error);
          throw error; // Repassa o erro
        });
    })
    .catch((error) => {
      console.error("Erro no registro:", error);
      throw error; // Repassa o erro
    });
}

// Função de login
export function login(email, senha) {
  return signInWithEmailAndPassword(auth, email, senha)
    .then((userCredential) => {
      console.log("Usuário logado:", userCredential.user);
      return userCredential.user;
    })
    .catch((error) => {
      console.error("Erro no login:", error);
      throw error; // Repassa o erro
    });
}

// Mostrar erro na página
export function mostrarErro(error) {
  const mensagem =
    {
      "auth/user-not-found": "Usuário não encontrado.",
      "auth/wrong-password": "Senha incorreta.",
      "auth/invalid-email": "Email inválido.",
      "auth/email-already-in-use": "Email já está em uso.",
      "auth/weak-password": "Senha muito fraca.",
    }[error.code] || "Erro desconhecido. Tente novamente.";

  const el = document.getElementById("mensagemErro");
  if (el) el.textContent = mensagem;
}
