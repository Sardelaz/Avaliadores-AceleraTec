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
  const filtroCurso = document.getElementById("filtroCurso");

  const exibirProjetos = (projetos) => {
    projetosContainer.innerHTML = "";

    if (projetos.length === 0) {
      const mensagemNenhumProjeto = document.createElement("p");
      mensagemNenhumProjeto.textContent = "Nenhum projeto cadastrado.";
      projetosContainer.appendChild(mensagemNenhumProjeto);
      return;
    }

    projetos.forEach((projeto) => {
      const projetoDiv = document.createElement("div");
      projetoDiv.classList.add("projeto-item");
      // Opcional: Adicione 'speak' aqui se clicar em qualquer lugar do item deve ler um resumo
      // projetoDiv.classList.add("speak");

      const tituloProjeto = document.createElement("h3");
      tituloProjeto.textContent =
        projeto.nomeProjeto || projeto.titulo || "Título não disponível";
      // Adiciona a classe 'speak' para que o TalkTouch possa ler o título
      tituloProjeto.classList.add("speak");

      const integrantesProjeto = document.createElement("p");
      integrantesProjeto.textContent = `Jogadores: ${
        projeto.integrantes ? projeto.integrantes.join(", ") : "Não informado"
      }`;
      // Adiciona a classe 'speak' para que o TalkTouch possa ler os integrantes
      integrantesProjeto.classList.add("speak");

      const professorAuxiliarProjeto = document.createElement("p");
      professorAuxiliarProjeto.textContent = `Professor(a) Auxiliar: ${
        projeto.professorAuxiliar || "Não informado"
      }`;
      // Adiciona a classe 'speak'
      professorAuxiliarProjeto.classList.add("speak");

      const descricaoProjeto = document.createElement("p");
      descricaoProjeto.textContent =
        projeto.descricaoProjeto || "Descrição não disponível";
      // Adiciona a classe 'speak'
      descricaoProjeto.classList.add("speak");

      const dataInscricaoProjeto = document.createElement("p");
      if (projeto.dataCriacao && projeto.dataCriacao.toDate) {
        const dataFormatada = projeto.dataCriacao
          .toDate()
          .toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        dataInscricaoProjeto.textContent = `Inscrito em: ${dataFormatada}`;
      } else {
        dataInscricaoProjeto.textContent = "Inscrito em: Não informada";
      }
      // Adiciona a classe 'speak'
      dataInscricaoProjeto.classList.add("speak");

      const cursoAnoProjeto = document.createElement("p");
      cursoAnoProjeto.textContent = `Curso/Ano: ${
        projeto.turmaEquipe || projeto.cursoAno || "Curso/Ano não disponível"
      }`;
      // Adiciona a classe 'speak'
      cursoAnoProjeto.classList.add("speak");

      const linkCanvaProjeto = document.createElement("p"); // Adiciona a classe 'speak' ao parágrafo para ler "Link do Canva: [texto do link]"
      linkCanvaProjeto.classList.add("speak");
      linkCanvaProjeto.textContent = `Link do Canva: `; // Define o texto estático

      const link = projeto.linkCanva || "Link do Canva não disponível";
      const linkAnchor = document.createElement("a"); // Cria o elemento âncora
      linkAnchor.href = link;
      linkAnchor.target = "_blank";
      linkAnchor.textContent =
        link === "Link do Canva não disponível" ? link : "Visualizar";
      // Não precisa adicionar 'speak' na âncora se o parágrafo pai já tem e lerá o conteúdo completo

      linkCanvaProjeto.appendChild(linkAnchor); // Adiciona a âncora ao parágrafo

      projetoDiv.appendChild(tituloProjeto);
      projetoDiv.appendChild(integrantesProjeto);
      projetoDiv.appendChild(professorAuxiliarProjeto);
      projetoDiv.appendChild(descricaoProjeto);
      projetoDiv.appendChild(dataInscricaoProjeto);
      projetoDiv.appendChild(cursoAnoProjeto);
      projetoDiv.appendChild(linkCanvaProjeto); // Adiciona o parágrafo contendo o link

      projetosContainer.appendChild(projetoDiv);
    });

    // Após exibir ou atualizar os projetos, reaplica os ouvintes de evento TalkTouch
    // Isso garante que os novos elementos criados dinamicamente tenham os ouvintes
    if (talkTouchEnabled) {
      // Verifica se o TalkTouch está ativo antes de aplicar
      applyTalkTouch();
    }
  };

  const buscarProjetos = async (filtro = "") => {
    try {
      const projetosRef = collection(db, "projetos");
      const querySnapshot = await getDocs(projetosRef);
      const projetos = [];
      querySnapshot.forEach((doc) => {
        projetos.push({ id: doc.id, ...doc.data() });
      });

      let projetosFiltrados = projetos;
      if (filtro) {
        projetosFiltrados = projetos.filter(
          (projeto) =>
            projeto.turmaEquipe === filtro || projeto.cursoAno === filtro
        );
      }

      exibirProjetos(projetosFiltrados);
    } catch (error) {
      console.error("Erro ao buscar projetos:", error);
      projetosContainer.innerHTML =
        '<p class="erro speak">Erro ao carregar os projetos.</p>'; // Adicionada a classe 'speak'
      // Reaplica ouvintes caso a mensagem de erro seja exibida
      if (talkTouchEnabled) {
        applyTalkTouch();
      }
    }
  };

  if (filtroCurso) {
    filtroCurso.addEventListener("change", (event) => {
      buscarProjetos(event.target.value);
    });
    // Adiciona um ouvinte de clique ao próprio select para tentar ler o texto selecionado
    // Nota: A leitura de options em selects nativos pode ser inconsistente com scripts customizados.
    filtroCurso.addEventListener("click", (event) => {
      // Verifica se o clique foi em uma option dentro do select
      if (event.target.tagName === "OPTION" && talkTouchEnabled) {
        // A função speakText já lida com a leitura do elemento clicado
        // Não precisamos chamar speakText explicitamente aqui se o applyTalkTouch estiver funcionando corretamente
        // applyTalkTouch já adiciona o ouvinte de clique às options com a classe 'speak'
        // Este ouvinte no select é mais para garantir que o select em si (se tivesse a classe speak) ou suas options sejam clicáveis/faláveis.
        // A classe 'speak' já está nas options no HTML fornecido.
      } else if (
        event.target.tagName === "SELECT" &&
        talkTouchEnabled &&
        event.target.classList.contains("speak")
      ) {
        // Se clicar no select (e ele tiver a classe speak), tentar ler o valor selecionado
        const selectedOption = event.target.options[event.target.selectedIndex];
        if (selectedOption) {
          speakText({ target: selectedOption }); // Simula o evento para speakText
        }
      }
    });
  }

  buscarProjetos();

  onAuthStateChanged(auth, (user) => {
    console.log("Estado do usuário:", user); // Você pode adicionar lógica aqui para redirecionar se o usuário não estiver logado
  });

  const logoutButton = document.querySelector(".btn-logout"); // Seleciona pelo seletor correto
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      signOut(auth)
        .then(() => {
          // Redirecionar para a página de login após logout
          window.location.href = "index.html"; // Ou a página inicial/login
        })
        .catch((error) => {
          console.error("Erro ao fazer logout:", error);
          alert("Erro ao fazer logout. Tente novamente.");
        });
    });
  } else {
    console.warn("Botão de logout (.btn-logout) não encontrado.");
  }
});
