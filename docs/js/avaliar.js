// Importações do firebase-config.js (assumindo que ele existe)
import { auth, db } from  "./firebase-config.js";
// Importação do Firebase Auth
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
// Importações do Firebase Firestore
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query, // <-- Adicionado
  where, // <-- Adicionado
  getDocs, // <-- Adicionado
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// UUID para gerar IDs únicos (ainda necessário para a primeira avaliação)
import { v4 as uuidv4 } from "https://jspm.dev/uuid";

document.addEventListener("DOMContentLoaded", () => {
  // Obtém o ID do projeto a partir dos parâmetros da URL
  const projectId = new URLSearchParams(window.location.search).get("id");
  // Obtém o container para os detalhes do projeto e o formulário de avaliação
  const projectContent = document.getElementById("conteudo-avaliacao");

  // Variáveis para armazenar referências aos elementos do formulário
  let commentInput = null;
  let scoreInput = null;
  let sendEvaluationBtn = null;
  let evaluationStatusElement = null;
  let evaluationSectionDiv = null;

  // Variáveis para armazenar usuário atual e detalhes do projeto
  let currentUser = null;
  let projectDetails = null;

  // Define a URL base da API backend
  const API_BASE_URL = "http://localhost:3000"; // Ajuste conforme necessário para produção

  // Função para carregar os detalhes do projeto do Firestore
  const loadProject = async () => {
    if (!projectContent) return;

    if (!projectId) {
      projectContent.innerHTML =
        '<p class="error">ID do projeto não encontrado.</p>';
      return;
    }

    try {
      const projectRef = doc(db, "projetos", projectId);
      const projectDoc = await getDoc(projectRef);

      if (!projectDoc.exists()) {
        projectContent.innerHTML = `<p class="error">Projeto não encontrado com ID: ${projectId}.</p>`;
        return;
      }

      const project = projectDoc.data();

      projectDetails = {
        projectName: project.nomeProjeto || "Título não disponível",
        responsibleEmail: project.emailResponsavel || "Não informado",
      };

      let formattedEnrollmentDate = "Não informado";
      if (project.dataCriacao && project.dataCriacao.toDate) {
        formattedEnrollmentDate = project.dataCriacao
          .toDate()
          .toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
      }

      // Conteúdo HTML permanece o mesmo, pois a lógica de reuso do ID é no JS
      const projectHTML = `
        <div class="project-details">
            <h1>${projectDetails.projectName}</h1>
            <p><strong>Email de contato:</strong> ${
              projectDetails.responsibleEmail
            }</p>
            <p><strong>Integrantes:</strong> ${
              project.integrantes
                ? project.integrantes.join(", ")
                : "Não informado"
            }</p>
            <p><strong>Professor(a) auxiliar:</strong> ${
              project.professorAuxiliar || "Não informado"
            }</p>
            <p><strong>Descrição:</strong></p>
            <p>${project.descricaoProjeto || "Descrição não disponível"}</p>
            <p><strong>Inscrito em:</strong> ${formattedEnrollmentDate}</p>
            <p><strong>Turma/Ano:</strong> ${
              project.turmaEquipe ||
              project.cursoAno ||
              "Turma/Ano não disponível"
            }</p>
            <p><strong>Link do Canva:</strong> ${
              project.linkCanva
                ? `<a href="${project.linkCanva}" target="_blank">Visualizar</a>`
                : "Link do Canva não disponível"
            }</p>
        </div>
        <hr>
        <div id="secao-avaliacao-dinamica">
            <h2>Sua Avaliação</h2>
            <div class="form-group">
                <label for="comentario">Comentário:</label>
                <textarea id="comentario" class="form-control" placeholder="Comente sobre o projeto (dê feedback slide por slide e sugestões de correções)" rows="10"></textarea>
            </div>
            <div class="form-group">
                <label for="nota">Nota (1 a 10):</label>
                <select id="nota" class="form-control" required>
                    <option value="">Selecione uma nota</option>
                    ${Array.from({ length: 10 }, (_, i) => i + 1)
                      .map((num) => `<option value="${num}">${num}</option>`)
                      .join("")}
                </select>
            </div>
            <button id="enviarAvaliacao">Enviar Avaliação</button>
            <p id="avaliacao-status"></p>
        </div>
      `;

      projectContent.innerHTML = projectHTML;

      // Re-obter referências após atualizar innerHTML
      evaluationSectionDiv = projectContent.querySelector(
        "#secao-avaliacao-dinamica"
      );
      commentInput = projectContent.querySelector("#comentario");
      scoreInput = projectContent.querySelector("#nota");
      sendEvaluationBtn = projectContent.querySelector("#enviarAvaliacao");
      evaluationStatusElement =
        projectContent.querySelector("#avaliacao-status");

      if (sendEvaluationBtn) {
        sendEvaluationBtn.addEventListener("click", async () => {
          sendEvaluationBtn.disabled = true;
          if (evaluationStatusElement) {
            evaluationStatusElement.textContent = "Enviando...";
            evaluationStatusElement.style.color = "blue";
          }

          if (!currentUser) {
            if (evaluationStatusElement) {
              evaluationStatusElement.textContent =
                "Você precisa estar logado para avaliar.";
              evaluationStatusElement.style.color = "red";
            }
            sendEvaluationBtn.disabled = false;
            return;
          }

          const comment = commentInput.value.trim();
          const score = parseInt(scoreInput.value, 10);

          if (!projectId) {
            if (evaluationStatusElement) {
              evaluationStatusElement.textContent =
                "Erro: ID do projeto não encontrado para enviar avaliação.";
              evaluationStatusElement.style.color = "red";
            }
            sendEvaluationBtn.disabled = false;
            return;
          }

          const isCommentValid = comment !== "";
          const isScoreValid = !isNaN(score) && score >= 1 && score <= 10;

          if (!isCommentValid && !isScoreValid) {
            if (evaluationStatusElement) {
              evaluationStatusElement.textContent =
                "Adicione um comentário e/ou selecione uma nota válida (1 a 10).";
              evaluationStatusElement.style.color = "red";
            }
            sendEvaluationBtn.disabled = false;
            return;
          }

          // --- Lógica para verificar e reutilizar o accessProjectId existente ---
          let accessProjectId;
          try {
            const evaluationsRef = collection(db, "avaliacoes");
            const q = query(
              evaluationsRef,
              where("projectId", "==", projectId),
              where("evaluatorId", "==", currentUser.uid)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              // Já existe uma avaliação deste avaliador para este projeto
              // Pega o accessProjectId da primeira avaliação encontrada
              accessProjectId = querySnapshot.docs[0].data().accessProjectId;
              console.log(
                "Reutilizando accessProjectId existente:",
                accessProjectId
              );
            } else {
              // Primeira avaliação deste avaliador para este projeto
              accessProjectId = uuidv4(); // Gera um novo ID
              console.log("Gerando novo accessProjectId:", accessProjectId);
            }
          } catch (error) {
            console.error("Erro ao verificar avaliações existentes:", error);
            // Em caso de erro na consulta, podemos optar por gerar um novo ID
            // ou parar o processo. Gerar um novo ID é mais seguro para não travar.
            accessProjectId = uuidv4();
            if (evaluationStatusElement) {
              evaluationStatusElement.textContent =
                "Aviso: Não foi possível verificar avaliações anteriores. Gerando novo código de acesso.";
              evaluationStatusElement.style.color = "orange";
            }
            console.warn(
              "Continuando com novo accessProjectId devido a erro na consulta."
            );
          }
          // --- Fim da lógica de verificação e reutilização ---

          const evaluationData = {
            projectId: projectId,
            evaluatorId: currentUser.uid,
            comment: comment,
            score: isScoreValid ? score : null,
            timestamp: new Date(),
            accessProjectId: accessProjectId, // Usando o ID determinado acima
          };

          try {
            // Adiciona a nova avaliação (mesmo que seja uma reavaliação,
            // queremos registrar o novo feedback, apenas o código de acesso é o mesmo)
            await addDoc(collection(db, "avaliacoes"), evaluationData);

            const responsibleEmail = projectDetails.responsibleEmail;
            const projectName = projectDetails.projectName;

            // Envio de e-mail permanece o mesmo, usando o accessProjectId (reutilizado ou novo)
            if (
              responsibleEmail &&
              typeof responsibleEmail === "string" &&
              responsibleEmail.trim() !== "" &&
              responsibleEmail !== "Não informado"
            ) {
              const emailSubject = `Nova avaliação recebida para o projeto: "${projectName}"`;

              const emailText = `Olá,

Seu projeto "${projectName}" recebeu uma nova avaliação.

${isCommentValid ? `Comentário do avaliador:\n${comment}\n` : ""}
${isScoreValid ? `Nota atribuída: ${score}/10\n` : ""}

Para visualizar o feedback completo e editar seu projeto, use o código de acesso abaixo:

Código de Acesso: ${accessProjectId}

Por favor, não compartilhe esse código. Ele permite editar o projeto.`;

              const emailParams = {
                to: responsibleEmail,
                subject: emailSubject,
                text: emailText,
              };

              await fetch(`${API_BASE_URL}/api/send-email`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(emailParams),
              });
            }

            if (evaluationStatusElement) {
              evaluationStatusElement.textContent =
                "Avaliação enviada com sucesso! O responsável foi notificado por e-mail.";
              evaluationStatusElement.style.color = "green";
            }
            // Não desabilite o botão permanentemente se quiser permitir reavaliações rápidas,
            // mas é comum desabilitar após um envio bem-sucedido para evitar envios duplicados.
            // sendEvaluationBtn.disabled = true; // Mantido desabilitado como no original
          } catch (error) {
            console.error("Erro ao enviar avaliação:", error);
            if (evaluationStatusElement) {
              evaluationStatusElement.textContent =
                "Erro ao enviar a avaliação. Tente novamente.";
              evaluationStatusElement.style.color = "red";
            }
            sendEvaluationBtn.disabled = false;
          }
        });
      }
    } catch (error) {
      console.error("Erro ao carregar os detalhes do projeto:", error);
      projectContent.innerHTML =
        '<p class="error">Erro ao carregar os detalhes do projeto.</p>';
    }
  };

  // Verifica o estado de autenticação do usuário
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      loadProject(); // Carrega o projeto apenas se o usuário estiver logado
    } else {
      currentUser = null;
      // Limpa o conteúdo e mostra mensagem de login se não houver usuário
      if (projectContent) {
        projectContent.innerHTML =
          '<p class="error">Você precisa estar logado para acessar este projeto.</p>';
      }
    }
  });
});
