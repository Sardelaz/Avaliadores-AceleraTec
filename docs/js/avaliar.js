import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  doc,
  getDoc,
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Importe a função para gerar IDs únicos
import { v4 as uuidv4 } from "https://jspm.dev/uuid";
// Se estiver usando npm/yarn e um empacotador, use:
// import { v4 as uuidv4 } from 'uuid';

document.addEventListener("DOMContentLoaded", () => {
  const projetoId = new URLSearchParams(window.location.search).get("id");
  const projetoContainer = document.getElementById("conteudo-avaliacao");

  // Variáveis para referências dos elementos dinamicamente criados
  let comentarioInput = null;
  let notaInput = null;
  let enviarAvaliacaoBtn = null;
  let avaliacaoStatus = null;
  let secaoAvaliacaoDiv = null; // A div que envolve o formulário de avaliação

  let currentUser = null; // Variável para armazenar o usuário logado

  // Função para carregar os detalhes do projeto e renderizar a página
  const carregarProjeto = async () => {
    if (!projetoContainer) {
      console.warn("Elemento '#conteudo-avaliacao' não encontrado.");
      return;
    }

    if (!projetoId) {
      console.error("ID do projeto não fornecido na URL.");
      // Usando <p> simples conforme seu CSS parece sugerir para conteúdo
      projetoContainer.innerHTML =
        '<p class="erro">ID do projeto não encontrado.</p>';
      return;
    }

    try {
      const projetoRef = doc(db, "projetos", projetoId);
      const projetoDoc = await getDoc(projetoRef);

      if (!projetoDoc.exists()) {
        console.error(`Projeto com ID ${projetoId} não encontrado.`);
        // Usando <p> simples conforme seu CSS parece sugerir para conteúdo
        projetoContainer.innerHTML = `<p class="erro">Projeto não encontrado com o ID: ${projetoId}.</p>`;
        return;
      }

      const projeto = projetoDoc.data();

      // Formata a data, se existir
      let dataInscricaoFormatada = "Não informada";
      if (projeto.dataCriacao && projeto.dataCriacao.toDate) {
        dataInscricaoFormatada = projeto.dataCriacao
          .toDate()
          .toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
      }

      // Cria a string HTML completa, ajustando classes e IDs conforme o CSS
      const projetoCompletoHTML = `
                <div class="projeto-detalhes">
                    <h1>${projeto.nomeProjeto || "Título não disponível"}</h1>
                    <p><strong>Email de contato:</strong> ${
                      projeto.emailResponsavel || "Não informado"
                    }</p>
                    <p><strong>Jogadores:</strong> ${
                      projeto.integrantes
                        ? projeto.integrantes.join(", ")
                        : "Não informado"
                    }</p>
                    <p><strong>Professor(a) Auxiliar:</strong> ${
                      projeto.professorAuxiliar || "Não informado"
                    }</p>
                    <p><strong>Descrição:</strong></p>
                    <p>${
                      projeto.descricaoProjeto || "Descrição não disponível"
                    }</p>
                    <p><strong>Inscrito em:</strong> ${dataInscricaoFormatada}</p>
                    <p><strong>Curso/Ano:</strong> ${
                      projeto.turmaEquipe ||
                      projeto.cursoAno ||
                      "Curso/Ano não disponível"
                    }</p>
                    <p><strong>Link do Canva:</strong> ${
                      projeto.linkCanva
                        ? `<a href="${projeto.linkCanva}" target="_blank">Visualizar</a>`
                        : "Link do Canva não disponível"
                    }</p>
                </div>

                <hr>

                <div id="secao-avaliacao-dinamica">
                    <h2>Sua Avaliação</h2>

                    <div class="form-group">
                        <label for="comentario">Comentário:</label>
                        <textarea id="comentario" class="form-control" placeholder="Comentário sobre o projeto (escreva um feedback para cada slide e sugira correções)" rows="10" required></textarea>
                    </div>

                    <div class="form-group">
                        <label for="nota">Nota (1-10):</label>
                        <select id="nota" class="form-control" required>
                            <option value="">Selecione uma nota</option>
                            ${Array.from({ length: 10 }, (_, i) => i + 1)
                              .map(
                                (num) =>
                                  `<option value="${num}">${num}</option>`
                              )
                              .join("")}
                        </select>
                    </div>

                    <button id="enviarAvaliacao">Enviar Avaliação</button>
                    <p id="avaliacao-status"></p>
                </div>
            `;

      // Define o innerHTML do container com todo o conteúdo gerado
      projetoContainer.innerHTML = projetoCompletoHTML;

      // === IMPORTANTE: Pegar as referências dos elementos AGORA que eles existem ===
      // Use querySelector dentro do container para garantir que pega os elementos dinâmicos
      secaoAvaliacaoDiv = projetoContainer.querySelector(
        "#secao-avaliacao-dinamica"
      );
      comentarioInput = projetoContainer.querySelector("#comentario");
      notaInput = projetoContainer.querySelector("#nota");
      enviarAvaliacaoBtn = projetoContainer.querySelector("#enviarAvaliacao");
      avaliacaoStatus = projetoContainer.querySelector("#avaliacao-status");

      // === Configurar o listener do botão AGORA que ele existe ===
      if (enviarAvaliacaoBtn) {
        enviarAvaliacaoBtn.addEventListener("click", async () => {
          // Desabilita o botão para evitar múltiplos cliques
          enviarAvaliacaoBtn.disabled = true;
          if (avaliacaoStatus) avaliacaoStatus.textContent = "Enviando...";
          // Não há classe específica para cor de status no CSS fornecido, mantendo estilo inline
          if (avaliacaoStatus) avaliacaoStatus.style.color = "blue";

          if (!currentUser) {
            if (avaliacaoStatus) {
              avaliacaoStatus.textContent =
                "Você precisa estar logado para avaliar.";
              avaliacaoStatus.style.color = "red";
            }
            enviarAvaliacaoBtn.disabled = false; // Reabilita o botão
            return;
          }

          const comentario = comentarioInput.value.trim();
          const nota = parseInt(notaInput.value, 10);

          if (!projetoId) {
            if (avaliacaoStatus) {
              avaliacaoStatus.textContent =
                "Erro: ID do projeto não encontrado.";
              avaliacaoStatus.style.color = "red";
            }
            enviarAvaliacaoBtn.disabled = false;
            return;
          }

          // Validação: pelo menos um comentário NÃO VAZIO e/ou uma nota válida
          if (comentario === "" && (isNaN(nota) || nota < 1 || nota > 10)) {
            if (avaliacaoStatus) {
              avaliacaoStatus.textContent =
                "Por favor, adicione um comentário e/ou selecione uma nota válida.";
              avaliacaoStatus.style.color = "red";
            }
            enviarAvaliacaoBtn.disabled = false;
            return;
          }

          // Validação específica da nota
          if (isNaN(nota) || nota < 1 || nota > 10) {
            if (avaliacaoStatus) {
              avaliacaoStatus.textContent =
                "Por favor, selecione uma nota válida entre 1 e 10.";
              avaliacaoStatus.style.color = "red";
            }
            enviarAvaliacaoBtn.disabled = false;
            return;
          }

          // Gere um ID de acesso único para edição
          const acessoProjetoId = uuidv4();

          const avaliacaoData = {
            projetoId: projetoId,
            avaliadorId: currentUser.uid,
            comentario: comentario,
            nota: nota,
            timestamp: new Date(),
            acessoProjetoId: acessoProjetoId, // Inclua o ID de acesso no documento de avaliação
          };

          try {
            // 1. Salva a avaliação no Firestore
            await addDoc(collection(db, "avaliacoes"), avaliacaoData);

            // 2. Obtém o email do responsável pelo projeto novamente
            const projetoDoc = await getDoc(doc(db, "projetos", projetoId));
            const projeto = projetoDoc.data();
            const emailResponsavel = projeto.emailResponsavel;

            // 3. Envia requisição para o backend enviar o email (SE o email do responsável existir)
            if (
              emailResponsavel &&
              typeof emailResponsavel === "string" &&
              emailResponsavel.trim() !== "" &&
              emailResponsavel !== "Não informado"
            ) {
              // Use window.location.origin para pegar a base da URL atual
              // SUBSTITUA '/pagina-edicao-projeto.html' pela URL real da sua página de edição
              const linkEdicao = `${window.location.origin}/pagina-edicao-projeto.html?projetoId=${projetoId}&acessoId=${acessoProjetoId}`;

              const emailSubject = `Avaliação recebida para o projeto: "${
                projeto.nomeProjeto || "Seu Projeto"
              }"`;
              const emailText = `Olá,\n\nSeu projeto "${
                projeto.nomeProjeto || "Nome do Projeto"
              }" recebeu uma nova avaliação.\n\nVocê pode visualizar e editar seu projeto através deste link:\n${linkEdicao}\n\nPor favor, não compartilhe este link de acesso.`;

              const emailParams = {
                to: emailResponsavel,
                subject: emailSubject,
                text: emailText,
              };

              try {
                // === AJUSTE AQUI: Apontando para o backend local ===
                // SUBSTITUA 'http://localhost:3000/api/send-email' pelo caminho correto do seu endpoint
                // Quando for para produção, mude para a URL pública do seu backend
                const response = await fetch(
                  "http://localhost:3000/api/send-email",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(emailParams),
                  }
                );

                const responseData = await response.json();

                if (response.ok && responseData.success) {
                  if (avaliacaoStatus) {
                    avaliacaoStatus.textContent =
                      "Avaliação enviada com sucesso! Um email com o link de edição foi enviado ao responsável.";
                    avaliacaoStatus.style.color = "green";
                  }
                } else {
                  console.error(
                    "Erro no backend ao enviar email:",
                    responseData.error
                  );
                  if (avaliacaoStatus) {
                    avaliacaoStatus.textContent = `Avaliação enviada, mas houve um erro ao enviar o email (${
                      response.status
                    }): ${
                      responseData.error || "Erro desconhecido no backend"
                    }`;
                    avaliacaoStatus.style.color = "orange";
                  }
                }
              } catch (emailError) {
                console.error(
                  "Erro na requisição fetch para enviar email:",
                  emailError
                );
                if (avaliacaoStatus) {
                  avaliacaoStatus.textContent = `Avaliação enviada, mas houve um erro de comunicação ao tentar enviar o email: ${emailError.message}`;
                  avaliacaoStatus.style.color = "orange";
                }
              }
            } else {
              // Caso não haja email do responsável
              if (avaliacaoStatus) {
                avaliacaoStatus.textContent =
                  "Avaliação enviada com sucesso, mas o email do responsável não foi informado, então o link de edição não pôde ser enviado.";
                avaliacaoStatus.style.color = "orange";
              }
            }

            // Limpar os campos após enviar
            if (comentarioInput) comentarioInput.value = "";
            if (notaInput) notaInput.value = ""; // Limpa o select (volta para a opção padrão se houver)
          } catch (error) {
            console.error("Erro ao salvar avaliação no Firestore:", error);
            if (avaliacaoStatus) {
              avaliacaoStatus.textContent = `Erro ao enviar avaliação: ${error.message}`;
              avaliacaoStatus.style.color = "red";
            }
          } finally {
            // Reabilita o botão após o processo (sucesso ou falha)
            enviarAvaliacaoBtn.disabled = false;
          }
        });
      } else {
        console.warn(
          "Botão 'enviarAvaliacao' não encontrado após innerHTML. Verifique o ID no HTML gerado."
        );
      }

      // Controla a visibilidade da seção de avaliação com base no estado de login
      // Esta lógica é aplicada APÓS a renderização inicial em carregarProjeto
      if (secaoAvaliacaoDiv) {
        secaoAvaliacaoDiv.style.display = currentUser ? "block" : "none";
        if (!currentUser && avaliacaoStatus) {
          avaliacaoStatus.textContent = "Faça login para enviar sua avaliação.";
          avaliacaoStatus.style.color = "orange";
        } else if (currentUser && avaliacaoStatus) {
          avaliacaoStatus.textContent = ""; // Limpa a mensagem de login se logado
        }
      }
    } catch (error) {
      console.error("Erro fatal ao carregar o projeto:", error);
      if (projetoContainer) {
        // Usando <p> simples conforme seu CSS parece sugerir para conteúdo
        projetoContainer.innerHTML =
          '<p class="erro">Erro ao carregar o projeto. Tente novamente.</p>';
      }
      // Garante que a seção de avaliação dinâmica não apareça se houver erro no carregamento
      if (secaoAvaliacaoDiv) {
        secaoAvaliacaoDiv.style.display = "none";
      }
    }
  };

  // Inicia o carregamento do projeto se o ID estiver na URL
  if (projetoId) {
    carregarProjeto();
  } else {
    if (projetoContainer) {
      // Usando <p> simples conforme seu CSS parece sugerir para conteúdo
      projetoContainer.innerHTML =
        '<p class="erro">Nenhum ID de projeto especificado. Não é possível carregar para avaliação.</p>';
    }
  }

  // Monitora o estado de autenticação para controlar a visibilidade da seção de avaliação
  // e garantir que currentUser esteja sempre atualizado.
  onAuthStateChanged(auth, (user) => {
    console.log(
      "Estado do usuário:",
      user ? `Logado: ${user.uid}` : "Deslogado"
    );
    currentUser = user; // Atualiza a variável do usuário logado

    // Se a seção de avaliação já foi renderizada (ou seja, secaoAvaliacaoDiv não é null),
    // ajusta sua visibilidade com base no estado de login.
    // Se ainda não foi renderizada, carregarProjeto lidará com a visibilidade inicial.
    if (secaoAvaliacaoDiv) {
      secaoAvaliacaoDiv.style.display = currentUser ? "block" : "none";
      if (!currentUser && avaliacaoStatus) {
        avaliacaoStatus.textContent = "Faça login para enviar sua avaliação.";
        avaliacaoStatus.style.color = "orange";
      } else if (currentUser && avaliacaoStatus) {
        // A mensagem de status é limpa ao logar, a menos que haja um erro de projeto
        // ou uma mensagem de envio pendente. Deixe carregarProjeto ou o listener de envio
        // definir a mensagem principal.
        if (
          avaliacaoStatus.textContent ===
          "Faça login para enviar sua avaliação."
        ) {
          avaliacaoStatus.textContent = "";
        }
      }
    }
  });
});
