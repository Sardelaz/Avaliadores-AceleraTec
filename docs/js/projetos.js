import { auth, db } from  "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  collection,
  addDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const projetosContainer = document.getElementById("projetos-container");
  const filtroCurso = document.getElementById("filtroCurso");

  const exibirProjetos = (projetos) => {
    if (!projetosContainer) {
      console.warn("Elemento 'projetos-container' não encontrado.");
      return;
    }

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

      const tituloProjeto = document.createElement("h3");
      tituloProjeto.textContent =
        projeto.nomeProjeto || projeto.titulo || "Título não disponível";
      tituloProjeto.classList.add("speak");

      const emailProjeto = document.createElement("p");
      emailProjeto.textContent = `Email de contato: ${
        projeto.emailResponsavel || "Não informado"
      }`;
      emailProjeto.classList.add("speak");

      const integrantesProjeto = document.createElement("p");
      integrantesProjeto.textContent = `Jogadores: ${
        projeto.integrantes ? projeto.integrantes.join(", ") : "Não informado"
      }`;
      integrantesProjeto.classList.add("speak");

      const professorAuxiliarProjeto = document.createElement("p");
      professorAuxiliarProjeto.textContent = `Professor(a) Auxiliar: ${
        projeto.professorAuxiliar || "Não informado"
      }`;
      professorAuxiliarProjeto.classList.add("speak");

      const descricaoProjeto = document.createElement("p");
      descricaoProjeto.textContent =
        projeto.descricaoProjeto || "Descrição não disponível";
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
      dataInscricaoProjeto.classList.add("speak");

      const cursoAnoProjeto = document.createElement("p");
      cursoAnoProjeto.textContent = `Curso/Ano: ${
        projeto.turmaEquipe || projeto.cursoAno || "Curso/Ano não disponível"
      }`;
      cursoAnoProjeto.classList.add("speak");

      const linkCanvaProjeto = document.createElement("p");
      linkCanvaProjeto.classList.add("speak");
      linkCanvaProjeto.textContent = `Link do Canva: `;

      const link = projeto.linkCanva || "Link do Canva não disponível";
      const linkAnchor = document.createElement("a");
      linkAnchor.href = link;
      linkAnchor.target = "_blank";
      linkAnchor.textContent =
        link === "Link do Canva não disponível" ? link : "Visualizar";
      linkCanvaProjeto.appendChild(linkAnchor);

      const btnAvaliar = document.createElement("a");
      btnAvaliar.href = `avaliar.html?id=${projeto.id}`;
      btnAvaliar.textContent = "Avaliar Projeto";
      btnAvaliar.classList.add("btn-avaliar");
      btnAvaliar.style.display = "inline-block";
      btnAvaliar.style.marginTop = "8px";

      projetoDiv.appendChild(tituloProjeto);
      projetoDiv.appendChild(emailProjeto);
      projetoDiv.appendChild(integrantesProjeto);
      projetoDiv.appendChild(professorAuxiliarProjeto);
      projetoDiv.appendChild(descricaoProjeto);
      projetoDiv.appendChild(dataInscricaoProjeto);
      projetoDiv.appendChild(cursoAnoProjeto);
      projetoDiv.appendChild(linkCanvaProjeto);
      projetoDiv.appendChild(btnAvaliar);

      projetosContainer.appendChild(projetoDiv);
    });

    if (typeof talkTouchEnabled !== "undefined" && talkTouchEnabled) {
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
      if (projetosContainer) {
        projetosContainer.innerHTML =
          '<p class="erro speak">Erro ao carregar os projetos.</p>';
      }
      if (typeof talkTouchEnabled !== "undefined" && talkTouchEnabled) {
        applyTalkTouch();
      }
    }
  };

  if (filtroCurso) {
    filtroCurso.addEventListener("change", (event) => {
      buscarProjetos(event.target.value);
    });

    filtroCurso.addEventListener("click", (event) => {
      if (
        event.target.tagName === "SELECT" &&
        talkTouchEnabled &&
        event.target.classList.contains("speak")
      ) {
        const selectedOption = event.target.options[event.target.selectedIndex];
        if (selectedOption) {
          speakText({ target: selectedOption });
        }
      }
    });
  }

  buscarProjetos();

  onAuthStateChanged(auth, (user) => {
    console.log("Estado do usuário:", user);
  });

  const logoutButton = document.querySelector(".btn-logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      signOut(auth)
        .then(() => {
          window.location.href = "index.html";
        })
        .catch((error) => {
          console.error("Erro ao fazer logout:", error);
          alert("Erro ao fazer logout. Tente novamente.");
        });
    });
  } else {
    console.warn("Botão de logout (.btn-logout) não encontrado.");
  }

  const projetoForm = document.getElementById("projetoForm");
  if (projetoForm) {
    projetoForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const nomeEquipe = document.getElementById("nomeEquipe").value;
      const turmaEquipe = document.getElementById("curso").value;
      const emailResponsavel = document.getElementById("email").value;
      const integrantes = [];
      for (let i = 1; i <= 5; i++) {
        const integrante = document.getElementById(`integrante${i}`).value;
        if (integrante) integrantes.push(integrante);
      }
      const professorAuxiliar =
        document.getElementById("professorAuxiliar").value;
      const nomeProjeto = document.getElementById("nomeProjeto").value;
      const descricaoProjeto =
        document.getElementById("descricaoProjeto").value;
      const linkCanva = document.getElementById("linkCanva").value;

      try {
        await addDoc(collection(db, "projetos"), {
          nomeEquipe,
          turmaEquipe,
          emailResponsavel,
          integrantes,
          professorAuxiliar,
          nomeProjeto,
          descricaoProjeto,
          linkCanva,
          dataCriacao: new Date(),
        });

        const modalSucesso = document.getElementById("modalSucesso");
        if (modalSucesso) {
          modalSucesso.classList.remove("hidden");
        }

        projetoForm.reset();
      } catch (error) {
        console.error("Erro ao enviar o projeto:", error);
      }
    });
  } else {
    console.warn(
      "Formulário com ID 'projetoForm' não encontrado. O listener de submit não foi anexado."
    );
  }
});
