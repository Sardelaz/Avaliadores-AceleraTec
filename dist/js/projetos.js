import { auth, db } from '../../firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const projetosContainer = document.getElementById("projetos-container");
  const filtroCurso = document.getElementById("filtroCurso");

  const exibirProjetos = (projetos) => {
    projetosContainer.innerHTML = '';

    if (projetos.length === 0) {
      const mensagemNenhumProjeto = document.createElement('p');
      mensagemNenhumProjeto.textContent = 'Nenhum projeto cadastrado.';
      projetosContainer.appendChild(mensagemNenhumProjeto);
      return;
    }

    projetos.forEach(projeto => {
      const projetoDiv = document.createElement('div');
      projetoDiv.classList.add('projeto-item');

      const tituloProjeto = document.createElement('h3');
      tituloProjeto.textContent = projeto.nomeProjeto || projeto.titulo || 'Título não disponível';

      const integrantesProjeto = document.createElement('p');
      integrantesProjeto.textContent = `Jogadores: ${projeto.integrantes ? projeto.integrantes.join(', ') : 'Não informado'}`;

      const professorAuxiliarProjeto = document.createElement('p');
      professorAuxiliarProjeto.textContent = `Professor(a) Auxiliar: ${projeto.professorAuxiliar || 'Não informado'}`;

      const descricaoProjeto = document.createElement('p');
      descricaoProjeto.textContent = projeto.descricaoProjeto || 'Descrição não disponível';

      const dataInscricaoProjeto = document.createElement('p');
      if (projeto.dataCriacao && projeto.dataCriacao.toDate) {
        const dataFormatada = projeto.dataCriacao.toDate().toLocaleDateString('pt-BR', {
          day: '2-digit', month: '2-digit', year: 'numeric'
        });
        dataInscricaoProjeto.textContent = `Inscrito em: ${dataFormatada}`;
      } else {
        dataInscricaoProjeto.textContent = 'Inscrito em: Não informada';
      }

      const cursoAnoProjeto = document.createElement('p');
      cursoAnoProjeto.textContent = `Curso/Ano: ${projeto.turmaEquipe || projeto.cursoAno || 'Curso/Ano não disponível'}`;

      const linkCanvaProjeto = document.createElement('p');
      const link = projeto.linkCanva || 'Link do Canva não disponível';
      linkCanvaProjeto.innerHTML = `Link do Canva: <a href="${link}" target="_blank">${link === 'Link do Canva não disponível' ? link : 'Visualizar'}</a>`;

      projetoDiv.appendChild(tituloProjeto);
      projetoDiv.appendChild(integrantesProjeto);
      projetoDiv.appendChild(professorAuxiliarProjeto);
      projetoDiv.appendChild(descricaoProjeto);
      projetoDiv.appendChild(dataInscricaoProjeto);
      projetoDiv.appendChild(cursoAnoProjeto);
      projetoDiv.appendChild(linkCanvaProjeto);

      projetosContainer.appendChild(projetoDiv);
    });
  };

  const buscarProjetos = async (filtro = '') => {
    try {
      const projetosRef = collection(db, 'projetos');
      const querySnapshot = await getDocs(projetosRef);
      const projetos = [];
      querySnapshot.forEach((doc) => {
        projetos.push({ id: doc.id, ...doc.data() });
      });

      let projetosFiltrados = projetos;
      if (filtro) {
        projetosFiltrados = projetos.filter(projeto => projeto.turmaEquipe === filtro || projeto.cursoAno === filtro);
      }

      exibirProjetos(projetosFiltrados);

    } catch (error) {
      console.error("Erro ao buscar projetos:", error);
      projetosContainer.innerHTML = '<p class="erro">Erro ao carregar os projetos.</p>';
    }
  };

  if (filtroCurso) {
    filtroCurso.addEventListener('change', (event) => {
      buscarProjetos(event.target.value);
    });
  }

  buscarProjetos();

  onAuthStateChanged(auth, (user) => {
    console.log("Estado do usuário:", user);
  });

  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      signOut(auth).then(() => {
        window.location.href = "login.html";
      });
    });
  }
});
