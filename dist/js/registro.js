// dist/registro.js
import { registrar, mostrarErro } from './firebase.js';

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value;
            const senha = document.getElementById("senha").value;

            registrar(email, senha)  // Passando apenas o email e senha
                .then(() => {
                    window.location.href = "login.html";
                })
                .catch((error) => {
                    console.error("Erro no registro:", error.code, error.message);
                    mostrarErro(error);
                });
        });
    }
});


