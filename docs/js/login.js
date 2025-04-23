// dist/login.js
import { login, mostrarErro } from './firebase.js';
import { auth } from '../../firebase-config.js';
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
                    window.location.href = "projetos.html";
                })
                .catch((error) => {
                    console.error("Erro no login:", error.code, error.message);
                    mostrarErro(error);
                });
        });
    }

    // Proteção de rota: Redireciona para login se o usuário NÃO estiver logado
    onAuthStateChanged(auth, (user) => {
        console.log("Pathname:", window.location.pathname); // Para depuração
        console.log("User state:", user); // Para depuração
        if (!user) {
            console.log("Usuário não está logado, redirecionando para login.");
            window.location.href = "login.html";
        }
    });

});
