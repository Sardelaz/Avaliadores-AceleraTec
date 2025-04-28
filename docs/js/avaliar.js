import { db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
    const conteudo = document.getElementById("conteudo-avaliacao");

    // Pega o ID do projeto da URL
    const urlParams = new URLSearchParams(window.location.search);
    const projetoId = urlParams.get('id');

    if (!projetoId) {
        conteudo.innerHTML = "<p class='erro'>ID do projeto não encontrado.</p>";
        return;
    }

    try {
        const projetoRef = doc(db, "projetos", projetoId);
        const projetoSnap = await getDoc(projetoRef);

        if (!projetoSnap.exists()) {
            conteudo.innerHTML = "<p class='erro'>Projeto não encontrado.</p>";
            return;
        }

        const projeto = projetoSnap.data();
        console.log("Projeto carregado:", projeto);

        // Exibição dos detalhes do projeto
        conteudo.innerHTML = `
            <section class="projeto-detalhes">
                <h2>${projeto.nomeProjeto || "Sem título"}</h2>
                <p><strong>Jogadores:</strong> ${projeto.integrantes ? projeto.integrantes.join(", ") : "Não informado"}</p>
                <p><strong>Professor(a) Auxiliar:</strong> ${projeto.professorAuxiliar || "Não informado"}</p>
                <p><strong>Descrição:</strong> ${projeto.descricaoProjeto || "Não disponível"}</p>
                <p><strong>Curso/Ano:</strong> ${projeto.turmaEquipe || "Não disponível"}</p>
                <p><strong>Link do Canva:</strong> 
                    ${projeto.linkCanva
                        ? `<a href="${projeto.linkCanva}" target="_blank">Visualizar</a>`
                        : "Não disponível"
                    }
                </p>
                <hr />
                <h3>Área de Avaliação:</h3>
                // <textarea id="comentario" placeholder="Comentário sobre o projeto (escreva um feedback para cada slide e sugira correções)" rows="100"></textarea> 
                <br/>
                <label for="nota">Nota:</label>
                <select id="nota">
                    <option value="10">10 - Excelente</option>
                    <option value="9">9 - Excelente</option>
                    <option value="8">8 - Excelente</option>
                    <option value="7">7 - Excelente</option>
                    <option value="6">6 - Excelente</option>
                    <option value="5">5 - Excelente</option>
                    <option value="4">4 - Muito Bom</option>
                    <option value="3">3 - Bom</option>
                    <option value="2">2 - Regular</option>
                    <option value="1">1 - Ruim</option>
                </select>
                <br/>
                <button id="btn-enviar-avaliacao">Enviar Avaliação</button>
            </section>
        `;

        // Adiciona ação para o botão de enviar avaliação
        document.getElementById("btn-enviar-avaliacao").addEventListener("click", () => {
            const comentario = document.getElementById("comentario").value.trim();
            const nota = document.getElementById("nota").value;

            if (!comentario) {
                alert("Por favor, escreva um comentário.");
                return;
            }

            console.log(`Avaliação enviada! Comentário: ${comentario}, Nota: ${nota}`);
            alert("Avaliação enviada! (Ainda não está salvando no banco)");  // Placeholder para salvar a avaliação no Firestore
        });

    } catch (error) {
        console.error("Erro ao carregar projeto:", error);
        conteudo.innerHTML = "<p class='erro'>Erro ao carregar o projeto.</p>";
    }
});
