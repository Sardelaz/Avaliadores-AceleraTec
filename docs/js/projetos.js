import { auth, db } from "./firebase-config.js";
import {
    onAuthStateChanged,
    signOut,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
    collection,
    getDocs,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const projetosContainer = document.getElementById("projetos-container");
    const logoutButton = document.querySelector(".btn-logout");

    // Função para criar elementos HTML
    const criarElemento = (tag, classes = [], texto = "") => {
        const el = document.createElement(tag);
        if (classes.length) el.classList.add(...classes);
        if (texto) el.textContent = texto;
        return el;
    };

    // Função para exibir loading
    const mostrarLoading = () => {
        if (projetosContainer) {
            projetosContainer.innerHTML = '<p class="carregando speak">Carregando projetos...</p>';
        }
    };

    // Função para exibir erro
    const mostrarErro = () => {
        if (projetosContainer) {
            projetosContainer.innerHTML = '<p class="erro speak">Erro ao carregar os projetos.</p>';
        }
    };

    // Função para exibir mensagem de vazio
    const mostrarVazio = () => {
        if (projetosContainer) {
            projetosContainer.innerHTML = '<p class="vazio speak">Nenhum projeto cadastrado.</p>';
        }
    };

    // Função para exibir projetos
    const exibirProjetos = (projetos) => {
        if (!projetosContainer) return;

        projetosContainer.innerHTML = "";

        if (!projetos.length) {
            mostrarVazio();
            return;
        }

        projetos.forEach((projeto) => {
            const projetoDiv = criarElemento("div", ["projeto-item", "fade-in"]);
            const titulo = criarElemento("h3", ["speak"], projeto.nomeProjeto || projeto.titulo || "Título não disponível");
            const integrantes = criarElemento("p", ["speak"], `Jogadores: ${projeto.integrantes ? projeto.integrantes.join(", ") : "Não informado"}`);
            const professor = criarElemento("p", ["speak"], `Professor(a) Auxiliar: ${projeto.professorAuxiliar || "Não informado"}`);
            const descricao = criarElemento("p", ["speak"], projeto.descricaoProjeto || "Descrição não disponível");
            const data = criarElemento("p", ["speak"]);
            if (projeto.dataCriacao?.toDate) {
                data.textContent = `Inscrito em: ${projeto.dataCriacao.toDate().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}`;
            } else {
                data.textContent = "Inscrito em: Não informada";
            }

            const cursoAno = criarElemento("p", ["speak"], `Curso/Ano: ${projeto.turmaEquipe || projeto.cursoAno || "Curso/Ano não disponível"}`);
            const linkCanva = criarElemento("p", ["speak"], "Link do Canva: ");
            const linkAnchor = criarElemento("a", []);
            linkAnchor.href = projeto.linkCanva || "#";
            linkAnchor.target = "_blank";
            linkAnchor.textContent = projeto.linkCanva ? "Visualizar" : "Link não disponível";
            linkCanva.appendChild(linkAnchor);

            const botaoAvaliar = criarElemento("button", ["btn-avaliar"], "Avaliar");
            botaoAvaliar.addEventListener("click", () => {
                window.location.href = `avaliar.html?id=${projeto.id}`;
            });

            projetoDiv.append(titulo, integrantes, professor, descricao, data, cursoAno, linkCanva, botaoAvaliar);
            projetosContainer.appendChild(projetoDiv);
        });
    };

    // Função para buscar projetos no Firestore
    const buscarProjetos = async () => {
        try {
            mostrarLoading();
            const projetosRef = collection(db, "projetos");
            const querySnapshot = await getDocs(projetosRef);

            if (querySnapshot.empty) {
                console.log("Nenhum projeto encontrado.");
                mostrarVazio();
                return;
            }

            const projetos = [];
            querySnapshot.forEach((doc) => {
                projetos.push({ id: doc.id, ...doc.data() });
            });

            console.log("Projetos encontrados:", projetos); // Verificação
            exibirProjetos(projetos);
        } catch (error) {
            console.error("Erro ao buscar projetos:", error);
            mostrarErro();
        }
    };

    // Lida com a autenticação
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = "index.html"; // Se deslogado, volta para o login
        } else {
            console.log("Usuário autenticado:", user.email);
        }
    });

    // Botão de logout
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            if (confirm("Tem certeza que deseja sair?")) {
                signOut(auth)
                    .then(() => {
                        window.location.href = "index.html";
                    })
                    .catch((error) => {
                        console.error("Erro ao fazer logout:", error);
                        alert("Erro ao fazer logout. Tente novamente.");
                    });
            }
        });
    }

    // Busca inicial dos projetos
    buscarProjetos();
});
