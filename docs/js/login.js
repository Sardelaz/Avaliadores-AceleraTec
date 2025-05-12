// js/login.js
import { login, mostrarErro } from "./firebase.js";
import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const senha = document.getElementById("senha").value;

      login(email, senha)
        .then(() => {
          console.log("Login realizado com sucesso!");
          window.location.href = "projetos.html"; // Redireciona só após login
        })
        .catch((error) => {
          console.error("Erro no login:", error.code, error.message);
          mostrarErro(error);
        });
    });
  }

  // Não redireciona automaticamente se já estiver logado
  onAuthStateChanged(auth, (user) => {
    if (!user && !window.location.pathname.includes("login.html")) {
      console.log("Usuário não está logado, redirecionando para login.");
      window.location.href = "login.html";
    }
  });
});
