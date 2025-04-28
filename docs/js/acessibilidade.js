// Seletores de elementos
const modal = document.getElementById("accessibilityModal");
const openBtn = document.getElementById("openAccessibility");
const closeBtn = document.getElementById("closeModal");
const talkTouchStatus = document.getElementById("talkTouchStatus");
const languageSelector = document.getElementById("languageSelector");

// Botão TalkTouch no modal - Seleção melhorada usando ID
const toggleTalkTouchBtn = document.getElementById("toggleTalkTouchButton");

// Funcionalidade do Modal
if (modal && openBtn && closeBtn) {
  openBtn.addEventListener("click", () => modal.classList.remove("hidden"));
  closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });
} else {
  // Adicionado um aviso caso os seletores básicos do modal falhem
  if (!modal) console.warn("Modal (#accessibilityModal) não encontrado.");
  if (!openBtn)
    console.warn("Botão para abrir modal (#openAccessibility) não encontrado.");
  if (!closeBtn)
    console.warn("Botão para fechar modal (#closeModal) não encontrado.");
}

// Inicializa o estado lendo do localStorage. Default é false (desligado).
let talkTouchEnabled = localStorage.getItem("talkTouch") === "true" || false;

// Alterna estado do TalkTouch
function toggleTalkTouch() {
  talkTouchEnabled = !talkTouchEnabled;
  localStorage.setItem("talkTouch", talkTouchEnabled); // Salva no localStorage
  applyTalkTouch();
  updateTalkTouchStatus();

  const lang = localStorage.getItem("lang") || "pt";
  const t = translations[lang] || translations["pt"];

  const statusToSpeak = talkTouchEnabled
    ? t.talkTouchEnabledStatus
    : t.talkTouchDisabledStatus;

  const fullPhraseToSpeak = `${t.talkTouchLabel} ${statusToSpeak}`;

  const utterance = new SpeechSynthesisUtterance(fullPhraseToSpeak);
  setSpeechLanguage(utterance, lang);

  window.speechSynthesis.cancel(); // Para qualquer fala em andamento
  window.speechSynthesis.speak(utterance); // Fala o status
}

// Define o idioma para a síntese de fala
function setSpeechLanguage(utterance, lang) {
  if (lang === "en") utterance.lang = "en-US";
  else if (lang === "es") utterance.lang = "es-ES";
  else utterance.lang = "pt-BR"; // Padrão português
}

// Adiciona/remove ouvintes de clique (.speak) e do seletor (.speak) com base no estado TalkTouch
function applyTalkTouch() {
  const speakElements = document.querySelectorAll(".speak");
  speakElements.forEach((el) => {
    // Sempre remove o ouvinte primeiro para evitar duplicidade
    el.removeEventListener("click", speakText);
    if (talkTouchEnabled) {
      el.addEventListener("click", speakText);
    }
  });

  // *** Adiciona/remove ouvinte para o seletor de curso/ano ***
  const filtroCursoSelect = document.getElementById("filtroCurso");
  if (filtroCursoSelect) {
    // Remove o ouvinte existente para evitar duplicidade
    filtroCursoSelect.removeEventListener("change", speakSelectedOption);
    if (talkTouchEnabled) {
      // Adiciona o ouvinte para falar a opção selecionada na mudança
      filtroCursoSelect.addEventListener("change", speakSelectedOption);
    }
  } else {
    console.warn("Seletor de Curso/Ano (#filtroCurso) não encontrado.");
  }
}

// Lê o texto do elemento clicado
function speakText(event) {
  // Tenta obter texto de innerText, value ou placeholder
  const text =
    event.target.innerText || event.target.value || event.target.placeholder;
  if (!text || text.trim() === "") return;

  const utterance = new SpeechSynthesisUtterance(text);
  const lang = localStorage.getItem("lang") || "pt"; // Pega o idioma do localStorage
  setSpeechLanguage(utterance, lang); // Define o idioma para a síntese de fala

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

// *** Nova função para falar a opção selecionada no seletor ***
function speakSelectedOption(event) {
  const selectElement = event.target;
  const selectedOptionText =
    selectElement.options[selectElement.selectedIndex].text;

  if (!selectedOptionText || selectedOptionText.trim() === "") return;

  const utterance = new SpeechSynthesisUtterance(selectedOptionText);
  const lang = localStorage.getItem("lang") || "pt"; // Pega o idioma do localStorage
  setSpeechLanguage(utterance, lang); // Define o idioma para a síntese de fala

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

// Atualiza status visual do TalkTouch (parágrafo e botão)
function updateTalkTouchStatus() {
  const lang = localStorage.getItem("lang") || "pt";
  const t = translations[lang] || translations["pt"];

  const statusText = talkTouchEnabled
    ? t.talkTouchEnabledStatus
    : t.talkTouchDisabledStatus;

  const fullStatusString = `${t.talkTouchLabel}: ${statusText}`;

  if (talkTouchStatus) {
    talkTouchStatus.textContent = fullStatusString;
  } else {
    console.warn(
      "Elemento de status do TalkTouch (#talkTouchStatus) não encontrado."
    );
  }

  if (toggleTalkTouchBtn && t.talkTouchBtnLabel) {
    const iconMatch = toggleTalkTouchBtn.innerText.match(/^(\S+)\s*/);
    const icon = iconMatch ? iconMatch[0] : "🎙️ ";
    const newText = `${icon}${t.talkTouchBtnLabel}: ${statusText}`;
    toggleTalkTouchBtn.innerText = newText;
  } else {
    console.warn(
      "Botão TalkTouch no modal (#toggleTalkTouchButton) não encontrado ou tradução da label faltando."
    );
  }
}

// Adiciona ouvinte ao botão TalkTouch para chamar toggleTalkTouch
if (toggleTalkTouchBtn) {
  toggleTalkTouchBtn.addEventListener("click", toggleTalkTouch);
} else {
  console.warn(
    "Ouvinte de clique NÃO adicionado ao botão TalkTouch pois ele (#toggleTalkTouchButton) não foi encontrado."
  );
}

// Ouvinte para mudança de idioma no seletor
if (languageSelector) {
  languageSelector.addEventListener("change", changeLanguage);
} else {
  console.warn("Seletor de Idioma (#languageSelector) não encontrado.");
}

// Lida com a mudança de idioma
function changeLanguage() {
  if (!languageSelector) return;
  const lang = languageSelector.value;
  localStorage.setItem("lang", lang);
  console.log("Idioma alterado para:", lang);
  updateContent(lang);
}

// Objeto de traduções para diferentes idiomas
const translations = {
  pt: {
    // Textos comuns (modal, etc.)
    talkTouchBtnLabel: "TalkTouch",
    talkTouchLabel: "TalkTouch",
    talkTouchEnabledStatus: "Ligado",
    talkTouchDisabledStatus: "Desligado",
    languageLabel: "Idioma",
    contrastBtnLabel: "Contraste",
    configuracoesBtn: "⚙️",
    // Textos da página Inicial (index.html)
    indexPageTitle: "Área dos Avaliadores",
    welcomeText:
      "Bem-vindo ao painel do <strong>AceleraTec</strong>! <br /> Aqui, professores e avaliadores podem acessar os projetos enviados pelos alunos e conferir todos os detalhes cadastrados.",
    alreadyHaveAccountBtn: "Já tenho uma conta",
    createAccountBtn: "Criar conta",
    // Textos da página de Login (login.html)
    loginTitle: "Login - AceleraTec",
    emailLabel: "Email:",
    emailPlaceholder: "Digite seu email",
    senhaLabel: "Senha:",
    senhaPlaceholder: "Digite sua senha",
    entrarBtn: "Entrar",
    naoConta: "Não tem uma conta?",
    registreSe: "Registre-se",
    // Textos da página de Registro (registro.html)
    registroTitle: "Registro - AceleraTec",
    registrarBtn: "Registrar",
    jaConta: "Já tem uma conta?",
    loginLink: "Login",
    // Textos da página de Projetos (projetos.html)
    projetosTitle: "Projetos Cadastrados - AceleraTec 2025",
    filtroCurso: "Filtrar por Curso e Ano:",
    sair: "Sair",
    carregando: "Carregando projetos...",

    // *** Adicionadas traduções para as opções do filtro de curso/ano ***
    filterOptions: {
      "": "Todos",
      "Comércio Exterior - 1º Ano": "Comércio Exterior - 1º Ano",
      "Comércio Exterior - 2º Ano": "Comércio Exterior - 2º Ano",
      "Comércio Exterior - 3º Ano": "Comércio Exterior - 3º Ano",
      "Informática para Internet - 1º Ano":
        "Informática para Internet - 1º Ano",
      "Informática para Internet - 2º Ano":
        "Informática para Internet - 2º Ano",
      "Informática para Internet - 3º Ano":
        "Informática para Internet - 3º Ano",
      "Marketing - 1º Ano": "Marketing - 1º Ano",
      "Marketing - 2º Ano": "Marketing - 2º Ano",
      "Marketing - 3º Ano": "Marketing - 3º Ano",
      "Recursos Humanos - 1º Ano": "Recursos Humanos - 1º Ano",
      "Recursos Humanos - 2º Ano": "Recursos Humanos - 2º Ano",
      "Recursos Humanos - 3º Ano": "Recursos Humanos - 3º Ano",
      "Serviços Jurídicos - 1º Ano": "Serviços Jurídicos - 1º Ano",
      "Serviços Jurídicos - 2º Ano": "Serviços Jurídicos - 2º Ano",
      "Serviços Jurídicos - 3º Ano": "Serviços Jurídicos - 3º Ano",
      "Desenvolvimento de Sistemas - 1º Ano":
        "Desenvolvimento de Sistemas - 1º Ano",
      "Desenvolvimento de Sistemas - 2º Ano":
        "Desenvolvimento de Sistemas - 2º Ano",
      "Desenvolvimento de Sistemas - 3º Ano":
        "Desenvolvimento de Sistemas - 3º Ano",
      "Segurança do Trabalho - 1º Ano": "Segurança do Trabalho - 1º Ano",
      "Segurança do Trabalho - 2º Ano": "Segurança do Trabalho - 2º Ano",
      "Segurança do Trabalho - 3º Ano": "Segurança do Trabalho - 3º Ano",
    },
  },
  en: {
    // Textos comuns
    talkTouchBtnLabel: "TalkTouch",
    talkTouchLabel: "TalkTouch",
    talkTouchEnabledStatus: "On",
    talkTouchDisabledStatus: "Off",
    languageLabel: "Language",
    contrastBtnLabel: "Contrast",
    configuracoesBtn: "⚙️",
    // Textos da página Inicial
    indexPageTitle: "Evaluators Area",
    welcomeText:
      "Welcome to the <strong>AceleraTec</strong> panel! <br /> Here, teachers and evaluators can access the projects submitted by students and check all registered details.",
    alreadyHaveAccountBtn: "Already have an account",
    createAccountBtn: "Create account",
    // Textos da página de Login
    loginTitle: "Login - AceleraTec",
    emailLabel: "Email:",
    emailPlaceholder: "Enter your email",
    senhaLabel: "Password:",
    senhaPlaceholder: "Enter your password",
    entrarBtn: "Login",
    naoConta: "Don't have an account?",
    registreSe: "Register",
    // Textos da página de Registro
    registroTitle: "Registration - AceleraTec",
    registrarBtn: "Register",
    jaConta: "Already have an account?",
    loginLink: "Login",
    // Textos da página de Projetos
    projetosTitle: "Registered Projects - AceleraTec 2025",
    filtroCurso: "Filter by Course and Year:",
    sair: "Logout",
    carregando: "Loading projects...",

    // *** Adicionadas traduções para as opções do filtro de curso/ano ***
    filterOptions: {
      "": "All",
      "Comércio Exterior - 1º Ano": "Foreign Trade - 1st Year",
      "Comércio Exterior - 2º Ano": "Foreign Trade - 2nd Year",
      "Comércio Exterior - 3º Ano": "Foreign Trade - 3rd Year",
      "Informática para Internet - 1º Ano": "Internet Computing - 1st Year",
      "Informática para Internet - 2º Ano": "Internet Computing - 2nd Year",
      "Informática para Internet - 3º Ano": "Internet Computing - 3rd Year",
      "Marketing - 1º Ano": "Marketing - 1st Year",
      "Marketing - 2º Ano": "Marketing - 2nd Year",
      "Marketing - 3º Ano": "Marketing - 3rd Year",
      "Recursos Humanos - 1º Ano": "Human Resources - 1st Year",
      "Recursos Humanos - 2º Ano": "Human Resources - 2nd Year",
      "Recursos Humanos - 3º Ano": "Human Resources - 3rd Year",
      "Serviços Jurídicos - 1º Ano": "Legal Services - 1st Year",
      "Serviços Jurídicos - 2º Ano": "Legal Services - 2nd Year",
      "Serviços Jurídicos - 3º Ano": "Legal Services - 3rd Year",
      "Desenvolvimento de Sistemas - 1º Ano": "Systems Development - 1st Year",
      "Desenvolvimento de Sistemas - 2º Ano": "Systems Development - 2nd Year",
      "Desenvolvimento de Sistemas - 3º Ano": "Systems Development - 3rd Year",
      "Segurança do Trabalho - 1º Ano": "Work Safety - 1st Year",
      "Segurança do Trabalho - 2º Ano": "Work Safety - 2nd Year",
      "Segurança do Trabalho - 3º Ano": "Work Safety - 3rd Year",
    },
  },
  es: {
    // Textos comuns
    talkTouchBtnLabel: "TalkTouch",
    talkTouchLabel: "TalkTouch",
    talkTouchEnabledStatus: "Activado",
    talkTouchDisabledStatus: "Desactivado",
    languageLabel: "Idioma",
    contrastBtnLabel: "Contraste",
    configuracoesBtn: "⚙️",
    indexPageTitle: "Área de Evaluadores",
    welcomeText:
      "¡Bienvenido al panel de <strong>AceleraTec</strong>! <br /> Aquí, profesores y evaluadores pueden acceder a los proyectos enviados por los alumnos y verificar todos los detalles registrados.",
    alreadyHaveAccountBtn: "Ya tengo una cuenta",
    createAccountBtn: "Crear cuenta",
    // Textos de la página Login.html
    loginTitle: "Inicio de sesión - AceleraTec",
    emailLabel: "Correo electrónico:",
    emailPlaceholder: "Ingrese su correo electrónico",
    senhaLabel: "Contraseña:",
    senhaPlaceholder: "Ingrese su contraseña",
    entrarBtn: "Ingresar",
    naoConta: "¿No tienes una cuenta?",
    registreSe: "Regístrate",
    // Textos de la página Registro.html
    registroTitle: "Registro - AceleraTec",
    registrarBtn: "Registrar",
    jaConta: "¿Ya tienes una cuenta?",
    loginLink: "Iniciar sesión",
    // Textos de la página Projetos.html
    projetosTitle: "Proyectos Registrados - AceleraTec 2025",
    filtroCurso: "Filtrar por Curso y Año:",
    sair: "Cerrar sesión",
    carregando: "Cargando proyectos...",

    // *** Adicionadas traduções para as opções do filtro de curso/año ***
    filterOptions: {
      "": "Todos",
      "Comércio Exterior - 1º Ano": "Comercio Exterior - 1º Año",
      "Comércio Exterior - 2º Ano": "Comercio Exterior - 2º Año",
      "Comércio Exterior - 3º Ano": "Comercio Exterior - 3º Año",
      "Informática para Internet - 1º Ano":
        "Informática para Internet - 1º Año",
      "Informática para Internet - 2º Ano":
        "Informática para Internet - 2º Año",
      "Informática para Internet - 3º Ano":
        "Informática para Internet - 3º Año",
      "Marketing - 1º Ano": "Marketing - 1º Año",
      "Marketing - 2º Ano": "Marketing - 2º Año",
      "Marketing - 3º Ano": "Marketing - 3º Año",
      "Recursos Humanos - 1º Ano": "Recursos Humanos - 1º Año",
      "Recursos Humanos - 2º Ano": "Recursos Humanos - 2º Año",
      "Recursos Humanos - 3º Ano": "Recursos Humanos - 3º Año",
      "Serviços Jurídicos - 1º Ano": "Servicios Jurídicos - 1º Año",
      "Serviços Jurídicos - 2º Ano": "Servicios Jurídicos - 2º Año",
      "Serviços Jurídicos - 3º Ano": "Servicios Jurídicos - 3º Año",
      "Desenvolvimento de Sistemas - 1º Ano": "Desarrollo de Sistemas - 1º Año",
      "Desenvolvimento de Sistemas - 2º Ano": "Desarrollo de Sistemas - 2º Año",
      "Desenvolvimento de Sistemas - 3º Ano": "Desarrollo de Sistemas - 3º Año",
      "Segurança do Trabalho - 1º Ano": "Seguridad Laboral - 1º Año",
      "Segurança do Trabalho - 2º Ano": "Seguridad Laboral - 2º Año",
      "Segurança do Trabalho - 3º Ano": "Seguridad Laboral - 3º Año",
    },
  },
};

// Atualiza conteúdo da página por idioma
function updateContent(lang) {
  console.log("updateContent chamado para idioma:", lang);
  let t = translations[lang];

  if (!t) {
    console.warn(`Traduções para "${lang}" não encontradas. Usando pt.`);
    lang = "pt";
    t = translations["pt"];
    if (!t) {
      console.error(
        "Traduções padrão 'pt' também não encontradas. Conteúdo não atualizado."
      );
      return;
    }
  }

  const languageLabelElement = document.querySelector(
    "#accessibilityModal label[for='languageSelector']"
  );
  if (languageLabelElement && t.languageLabel) {
    languageLabelElement.innerText = t.languageLabel;
  }

  const contrastButtonInModal = document.querySelector(
    "#accessibilityModal button[onclick='toggleContrast()']"
  );
  if (contrastButtonInModal && t.contrastBtnLabel) {
    const iconMatch = contrastButtonInModal.innerText.match(/^(\S+)\s*/);
    const icon = iconMatch ? iconMatch[0] : "🌗 ";
    contrastButtonInModal.innerText = icon + t.contrastBtnLabel;
  } else {
    console.warn(
      "Botão Contraste no modal (querySelector com onclick) não encontrado."
    );
  }

  updateTalkTouchStatus();

  // Atualiza conteúdo da página Inicial (index.html)
  const indexPageContainer = document.querySelector("div.container.speak");
  if (indexPageContainer) {
    const h1Element = indexPageContainer.querySelector("h1.speak");
    if (h1Element && t.indexPageTitle) h1Element.innerText = t.indexPageTitle;

    const pElement = indexPageContainer.querySelector("p.speak");
    if (pElement && t.welcomeText) pElement.innerHTML = t.welcomeText;

    const buttonsDiv = indexPageContainer.querySelector(".buttons");
    if (buttonsDiv) {
      const loginLink = buttonsDiv.querySelector("a.btn-primary.speak");
      if (loginLink && t.alreadyHaveAccountBtn)
        loginLink.innerText = t.alreadyHaveAccountBtn;

      const registerLink = buttonsDiv.querySelector("a.btn-secondary.speak");
      if (registerLink && t.createAccountBtn)
        registerLink.innerText = t.createAccountBtn;
    }
  }

  // Atualiza conteúdo da página de Login (login.html)
  const loginForm = document.querySelector("form#loginForm");
  if (loginForm) {
    const loginH1 = document.querySelector("h1");
    if (loginH1 && t.loginTitle) loginH1.innerText = t.loginTitle;
    const emailLabel = loginForm.querySelector("label[for='email']");
    if (emailLabel && t.emailLabel) emailLabel.innerText = t.emailLabel;
    const emailInput = loginForm.querySelector("input#email");
    if (emailInput && t.emailPlaceholder)
      emailInput.placeholder = t.emailPlaceholder;
    const senhaLabel = loginForm.querySelector("label[for='senha']");
    if (senhaLabel && t.senhaLabel) senhaLabel.innerText = t.senhaLabel;
    const senhaInput = loginForm.querySelector("input#senha");
    if (senhaInput && t.senhaPlaceholder)
      senhaInput.placeholder = t.senhaPlaceholder;
    const loginButton = loginForm.querySelector("button[type='submit']");
    if (loginButton && t.entrarBtn) loginButton.innerText = t.entrarBtn;
    const loginNoAccountPara = loginForm.querySelector("p");
    if (loginNoAccountPara && t.naoConta && t.registreSe)
      loginNoAccountPara.innerHTML = `${t.naoConta} <a href="registro.html">${t.registreSe}</a>`;
  }

  // Atualiza conteúdo da página de Registro (registro.html)
  const registerForm = document.querySelector("form#registerForm");
  if (registerForm) {
    const registerH1 = document.querySelector("h1");
    if (registerH1 && t.registroTitle) registerH1.innerText = t.registroTitle;
    const emailLabel = registerForm.querySelector("label[for='email']");
    if (emailLabel && t.emailLabel) emailLabel.innerText = t.emailLabel;
    const emailInput = registerForm.querySelector("input#email");
    if (emailInput && t.emailPlaceholder)
      emailInput.placeholder = t.emailPlaceholder;
    const senhaLabel = registerForm.querySelector("label[for='senha']");
    if (senhaLabel && t.senhaLabel) senhaLabel.innerText = t.senhaLabel;
    const senhaInput = registerForm.querySelector("input#senha");
    if (senhaInput && t.senhaPlaceholder)
      senhaInput.placeholder = t.senhaPlaceholder;
    const registerButton = registerForm.querySelector("button[type='submit']");
    if (registerButton && t.registrarBtn)
      registerButton.innerText = t.registrarBtn;
    const registerHasAccountPara = registerForm.querySelector("p");
    if (registerHasAccountPara && t.jaConta && t.loginLink)
      registerHasAccountPara.innerHTML = `${t.jaConta} <a href="login.html">${t.loginLink}</a>`;
  }

  // Atualiza conteúdo da página de Projetos (projetos.html)
  const appContent = document.querySelector(".app-content");
  if (appContent) {
    const headerLogoH1 = document.querySelector(".header-logo h1");
    if (headerLogoH1 && t.projetosTitle)
      headerLogoH1.innerText = t.projetosTitle;

    const contentHeaderH2 = document.querySelector(".content-header h2");
    if (contentHeaderH2 && t.projetosTitle)
      contentHeaderH2.innerText = t.projetosTitle;

    const filtroLabel = appContent.querySelector("label[for='filtroCurso']");
    if (filtroLabel && t.filtroCurso) filtroLabel.innerText = t.filtroCurso;

    const logoutButton = document.querySelector(".btn-logout");
    if (logoutButton && t.sair) logoutButton.innerText = t.sair;

    // *** Atualiza texto do parágrafo de carregamento ***
    const loadingPara = appContent.querySelector(
      "#projetos-container p.loading"
    );
    if (loadingPara && t.carregando) {
      loadingPara.innerText = t.carregando;
    } else if (!loadingPara) {
      console.warn(
        "Parágrafo de carregamento (#projetos-container p.loading) não encontrado para tradução. Ele pode ter sido removido dinamicamente."
      );
    }

    // *** Traduz as opções do seletor de curso/ano ***
    const filtroCursoSelect = document.getElementById("filtroCurso");
    if (filtroCursoSelect && t.filterOptions) {
      for (let i = 0; i < filtroCursoSelect.options.length; i++) {
        const option = filtroCursoSelect.options[i];
        // Usa o 'value' da option como chave para buscar a tradução
        const translationKey = option.value;
        // Fallback para innerText se a chave de tradução não for encontrada pelo value
        const translatedText =
          t.filterOptions[translationKey] ||
          (translations["pt"].filterOptions
            ? translations["pt"].filterOptions[translationKey]
            : null) ||
          option.innerText;
        option.innerText = translatedText;
      }
    } else if (!filtroCursoSelect) {
      console.warn(
        "Seletor de Curso/Ano (#filtroCurso) não encontrado para tradução."
      );
    } else if (!t.filterOptions) {
      console.warn(
        `Objeto de traduções para as opções do filtro ("filterOptions") não encontrado para o idioma "${lang}".`
      );
    }
  }
}

// Inicialização ao carregar o DOM
document.addEventListener("DOMContentLoaded", () => {
  if (closeBtn) {
    closeBtn.innerText = "❌";
  } else {
    console.warn(
      "Botão fechar modal (#closeModal) não encontrado durante DOMContentLoaded."
    );
  }

  const lang = localStorage.getItem("lang") || "pt";
  if (languageSelector) {
    languageSelector.value = lang;
    if (languageSelector.value !== lang) {
      console.warn(
        `Idioma "${lang}" do localStorage não encontrado nas opções do languageSelector. Usando o valor selecionado no seletor (${languageSelector.value}).`
      );
      localStorage.setItem("lang", languageSelector.value);
    }
    console.log("Idioma inicial (DOMContentLoaded):", languageSelector.value);
  } else {
    console.warn(
      "Seletor de Idioma (#languageSelector) não encontrado durante DOMContentLoaded."
    );
  }

  updateContent(lang);
  applyTalkTouch();
});
document.addEventListener('DOMContentLoaded', function () {
  const filtroCurso = document.getElementById("filtroCurso");
  const openAccessibilityButton = document.getElementById("openAccessibility");
  const accessibilityModal = document.getElementById("accessibilityModal");
  const closeModalButton = document.getElementById("closeModal");

  // Abre o modal de acessibilidade
  if (openAccessibilityButton) {
      openAccessibilityButton.addEventListener("click", () => {
          accessibilityModal.classList.remove("hidden");
      });
  }

  // Fecha o modal de acessibilidade
  if (closeModalButton) {
      closeModalButton.addEventListener("click", () => {
          accessibilityModal.classList.add("hidden");
      });
  }

  // Função para alterar idioma
  function changeLanguage() {
      const languageSelector = document.getElementById("languageSelector");
      const language = languageSelector.value;
      // Lógica para mudar idioma (exemplo)
      alert(`Idioma selecionado: ${language}`);
  }

  // Função para ativar/desativar contraste
  function toggleContrast() {
      document.body.classList.toggle('high-contrast');
  }

  // Função para ativar/desativar leitura em voz alta
  function toggleTalkTouch() {
      const talkTouchStatus = document.getElementById("talkTouchStatus");
      const talkTouchEnabled = talkTouchStatus.textContent.includes("Desativado");
      talkTouchStatus.textContent = talkTouchEnabled ? "TalkTouch: Ativado" : "TalkTouch: Desativado";
  }

  // Event listener para o filtro de curso
  if (filtroCurso) {
      filtroCurso.addEventListener("change", function (event) {
          const selectedOption = event.target.value;
          console.log(`Curso selecionado: ${selectedOption}`);
      });
  }
});