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

    // Proteção de rota + redirecionamento se já estiver logado
    onAuthStateChanged(auth, (user) => {
        const isLoginPage = window.location.pathname.includes("login.html");

        if (!user && !isLoginPage) {
            console.log("Usuário não está logado, redirecionando para login.");
            window.location.href = "login.html";
        }

        if (user && isLoginPage) {
            console.log("Usuário já logado, redirecionando para projetos.");
            window.location.href = "projetos.html";
        }
    });
});
