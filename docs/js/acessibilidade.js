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

// Funcionalidade TalkTouch (Leitura de Tela)
// Inicializa o estado lendo do localStorage. Default é false (desligado).
let talkTouchEnabled = localStorage.getItem("talkTouch") === "true" || false;

// Alterna estado do TalkTouch
function toggleTalkTouch() {
  talkTouchEnabled = !talkTouchEnabled; // Inverte o estado
  localStorage.setItem("talkTouch", talkTouchEnabled); // Salva no localStorage
  applyTalkTouch(); // Aplica/remove os ouvintes de evento de leitura
  updateTalkTouchStatus(); // Atualiza o texto de status na interface
}

// Adiciona/remove ouvintes de clique (.speak) com base no estado TalkTouch
function applyTalkTouch() {
  const speakElements = document.querySelectorAll(".speak");
  speakElements.forEach((el) => {
    // Sempre remove o ouvinte primeiro para evitar duplicidade
    el.removeEventListener("click", speakText);
    // Se TalkTouch estiver ligado, adiciona o ouvinte
    if (talkTouchEnabled) {
      el.addEventListener("click", speakText);
    }
  });
}

// Lê o texto do elemento clicado
function speakText(event) {
  // Tenta obter texto de innerText, value ou placeholder
  const text =
    event.target.innerText || event.target.value || event.target.placeholder;
  // Se não houver texto válido, para
  if (!text || text.trim() === "") return;

  const utterance = new SpeechSynthesisUtterance(text);
  const lang = localStorage.getItem("lang") || "pt"; // Pega o idioma do localStorage

  // Define o idioma para a síntese de fala
  if (lang === "en") utterance.lang = "en-US";
  else if (lang === "es") utterance.lang = "es-ES";
  else utterance.lang = "pt-BR"; // Padrão português

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

// Atualiza status visual do TalkTouch (parágrafo e botão)
function updateTalkTouchStatus() {
  const lang = localStorage.getItem("lang") || "pt";
  // Pega o objeto de tradução para o idioma atual ou padrão pt
  const t = translations[lang] || translations["pt"];

  // Determina o texto do status ("Ligado" ou "Desligado") com base no estado
  const statusText = talkTouchEnabled
    ? t.talkTouchEnabledStatus
    : t.talkTouchDisabledStatus;

  // Cria a string completa para o parágrafo de status
  const fullStatusString = `${t.talkTouchLabel}: ${statusText}`;

  // Atualiza o parágrafo de status se ele existir
  if (talkTouchStatus) {
    talkTouchStatus.textContent = fullStatusString;
  } else {
    console.warn(
      "Elemento de status do TalkTouch (#talkTouchStatus) não encontrado."
    );
  }

  // Atualiza o texto do botão de alternar se ele existir
  if (toggleTalkTouchBtn && t.talkTouchBtnLabel) {
    // Tenta manter o ícone inicial do botão
    const iconMatch = toggleTalkTouchBtn.innerText.match(/^(\S+)\s*/);
    const icon = iconMatch ? iconMatch[0] : "🎙️ "; // Ícone padrão caso não encontre

    // Atualiza o texto do botão (ícone + label + status)
    toggleTalkTouchBtn.innerText = `${icon}${t.talkTouchBtnLabel}: ${statusText}`;
  } else {
    // O aviso agora reflete que estamos buscando por ID
    console.warn(
      "Botão TalkTouch no modal (#toggleTalkTouchButton) não encontrado ou tradução da label faltando."
    );
  }
}

// Adiciona ouvinte ao botão TalkTouch para chamar toggleTalkTouch
// Agora ele confia na seleção por ID
if (toggleTalkTouchBtn) {
  toggleTalkTouchBtn.addEventListener("click", toggleTalkTouch);
} else {
  // O aviso agora reflete que estamos buscando por ID
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
  localStorage.setItem("lang", lang); // Salva o idioma no localStorage
  console.log("Idioma alterado para:", lang); // Log para confirmar a chamada
  updateContent(lang); // Atualiza todo o conteúdo da página com o novo idioma
}

// Objeto de traduções para diferentes idiomas
const translations = {
  pt: {
    // Textos comuns (modal, etc.)
    talkTouchBtnLabel: "TalkTouch",
    talkTouchLabel: "TalkTouch",
    talkTouchEnabledStatus: "Ligado", // Texto para status LIGADO
    talkTouchDisabledStatus: "Desligado", // Texto para status DESLIGADO
    languageLabel: "Idioma",
    increaseFontLabel: "Aumentar fonte", // Removido o ícone daqui
    decreaseFontLabel: "Diminuir fonte", // Removido o ícone daqui
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
  },
  en: {
    // Textos comuns
    talkTouchBtnLabel: "TalkTouch",
    talkTouchLabel: "TalkTouch",
    talkTouchEnabledStatus: "On", // Texto para status LIGADO
    talkTouchDisabledStatus: "Off", // Texto para status DESLIGADO
    languageLabel: "Language",
    increaseFontLabel: "Increase Font", // Removido o ícone
    decreaseFontLabel: "Decrease Font", // Removido o ícone
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
  },
  es: {
    // Textos comuns
    talkTouchBtnLabel: "TalkTouch",
    talkTouchLabel: "TalkTouch",
    talkTouchEnabledStatus: "Activado", // Texto para status LIGADO
    talkTouchDisabledStatus: "Desactivado", // Texto para status DESLIGADO
    languageLabel: "Idioma",
    increaseFontLabel: "Aumentar fuente", // Removido o ícone
    decreaseFontLabel: "Disminuir fuente", // Removido o ícone
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
  },
};

// Atualiza conteúdo da página por idioma
function updateContent(lang) {
  console.log("updateContent chamado para idioma:", lang); // Log para confirmar a chamada
  let t = translations[lang]; // Pega o objeto de tradução para o idioma atual

  // Verifica se o idioma e as traduções existem, caso contrário, usa pt
  if (!t) {
    console.warn(`Traduções para "${lang}" não encontradas. Usando pt.`);
    lang = "pt"; // Garante que lang seja 'pt' para a próxima linha
    t = translations["pt"];
    if (!t) {
      console.error(
        "Traduções padrão 'pt' também não encontradas. Conteúdo não atualizado."
      );
      return; // Sai da função se nem 'pt' for encontrado
    }
  }

  // Atualiza label do seletor de idioma no modal
  const languageLabelElement = document.querySelector(
    "#accessibilityModal label[for='languageSelector']"
  );
  if (languageLabelElement && t.languageLabel) {
    languageLabelElement.innerText = t.languageLabel;
    console.log("Label de idioma atualizado:", languageLabelElement.innerText); // Log
  }

  // --- Atualiza texto de Fonte ---
  // Busca pelos elementos span com IDs específicos adicionados no HTML para tradução
  const increaseTextElement = document.getElementById("increaseFontText");
  if (increaseTextElement && t.increaseFontLabel) {
    // Pega o ícone do próprio elemento span no HTML
    const iconMatch = increaseTextElement.textContent.match(/^(\S+)\s*/);
    const icon = iconMatch ? iconMatch[0] : ""; // Usa o ícone encontrado ou string vazia
    const newText = icon + t.increaseFontLabel;
    increaseTextElement.textContent = newText; // Atualiza o texto
    console.log("Texto 'Aumentar fonte' atualizado para:", newText); // Log
  } else if (!increaseTextElement) {
    // Apenas um aviso, pois a funcionalidade principal não depende disso
    console.warn(
      "Elemento para texto 'Aumentar fonte' (#increaseFontText) não encontrado para tradução."
    );
  } else {
    console.log(
      "Tradução 'Aumentar fonte' encontrada, mas elemento (#increaseFontText) não."
    ); // Log
  }

  const decreaseTextElement = document.getElementById("decreaseFontText");
  if (decreaseTextElement && t.decreaseFontLabel) {
    // Pega o ícone do próprio elemento span no HTML
    const iconMatch = decreaseTextElement.textContent.match(/^(\S+)\s*/);
    const icon = iconMatch ? iconMatch[0] : ""; // Usa o ícone encontrado ou string vazia
    const newText = icon + t.decreaseFontLabel;
    decreaseTextElement.textContent = newText; // Atualiza o texto
    console.log("Texto 'Diminuir fonte' atualizado para:", newText); // Log
  } else if (!decreaseTextElement) {
    // Apenas um aviso
    console.warn(
      "Elemento para texto 'Diminuir fonte' (#decreaseFontText) não encontrado para tradução."
    );
  } else {
    console.log(
      "Tradução 'Diminuir fonte' encontrada, mas elemento (#decreaseFontText) não."
    ); // Log
  }

  // Atualiza texto do botão de contraste no modal
  const contrastButtonInModal = document.querySelector(
    "#accessibilityModal button[onclick='toggleContrast()']"
  );
  if (contrastButtonInModal && t.contrastBtnLabel) {
    // Pega o ícone do próprio botão antes de atualizar o texto
    const iconMatch = contrastButtonInModal.innerText.match(/^(\S+)\s*/);
    const icon = iconMatch ? iconMatch[0] : "🌗 "; // Usa 🌗 como padrão se não encontrar
    const newText = icon + t.contrastBtnLabel;
    contrastButtonInModal.innerText = newText; // Mantém o ícone e atualiza o texto traduzido
    console.log("Texto 'Contraste' atualizado para:", newText); // Log
  } else {
    // Aviso caso o botão de contraste não seja encontrado (ele ainda usa onclick no seletor)
    console.warn(
      "Botão Contraste no modal (querySelector com onclick) não encontrado."
    );
  }

  // Atualiza status TalkTouch (chama a função que atualiza parágrafo e botão)
  updateTalkTouchStatus(); // Esta função já possui logs internos

  // --- Atualiza conteúdo específico da página (index.html, login.html, etc.) ---
  // Os seletores abaixo funcionam para a estrutura que você mostrou para index.html
  // e presumivelmente para as outras páginas, pois eles verificam se o elemento existe
  // antes de tentar atualizar.

  // Atualiza conteúdo da página Inicial (index.html)
  const indexPageContainer = document.querySelector("div.container.speak");
  if (indexPageContainer) {
    const h1Element = indexPageContainer.querySelector("h1.speak");
    if (h1Element && t.indexPageTitle) h1Element.innerText = t.indexPageTitle;

    const pElement = indexPageContainer.querySelector("p.speak");
    if (pElement && t.welcomeText) pElement.innerHTML = t.welcomeText; // Usa innerHTML por causa do <strong> e <br />

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

  // Atualiza conteúdo da página de Login (login.html) - Seletores genéricos H1 e P, podem precisar de ajuste
  const loginForm = document.querySelector("form#loginForm");
  if (loginForm) {
    const loginH1 = document.querySelector("h1"); // Melhor usar um ID ou classe específica para o título
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
    const loginNoAccountPara = loginForm.querySelector("p"); // Melhor usar um ID ou classe específica para este parágrafo
    if (loginNoAccountPara && t.naoConta && t.registreSe)
      loginNoAccountPara.innerHTML = `${t.naoConta} <a href="registro.html">${t.registreSe}</a>`;
  }

  // Atualiza conteúdo da página de Registro (registro.html) - Seletores genéricos H1 e P
  const registerForm = document.querySelector("form#registerForm");
  if (registerForm) {
    const registerH1 = document.querySelector("h1"); // Melhor usar um ID ou classe específica
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
    const registerHasAccountPara = registerForm.querySelector("p"); // Melhor usar um ID ou classe específica
    if (registerHasAccountPara && t.jaConta && t.loginLink)
      registerHasAccountPara.innerHTML = `${t.jaConta} <a href="login.html">${t.loginLink}</a>`;
  }

  // Atualiza conteúdo da página de Projetos (projetos.html)
  const appContent = document.querySelector(".app-content"); // Container da página de projetos
  if (appContent) {
    // Ajuste os seletores abaixo (.header-logo h1, .content-header h2)
    // para o que realmente corresponde ao título principal na sua página de projetos.
    // Talvez seja apenas um H1 ou H2 específico.
    const headerLogoH1 = document.querySelector(".header-logo h1");
    if (headerLogoH1 && t.projetosTitle)
      headerLogoH1.innerText = t.projetosTitle;

    const contentHeaderH2 = document.querySelector(".content-header h2");
    if (contentHeaderH2 && t.projetosTitle)
      contentHeaderH2.innerText = t.projetosTitle;

    const filtroLabel = appContent.querySelector("label[for='filtroCurso']");
    if (filtroLabel && t.filtroCurso) filtroLabel.innerText = t.filtroCurso;

    // Supondo que o botão Sair tenha a classe .btn-logout e esteja na página de projetos
    const logoutButton = document.querySelector(".btn-logout");
    if (logoutButton && t.sair) logoutButton.innerText = t.sair;

    const loadingPara = appContent.querySelector(
      "#projetos-container p.loading"
    );
    if (loadingPara && t.carregando) loadingPara.innerText = t.carregando;
  }
}

// Inicialização ao carregar o DOM
document.addEventListener("DOMContentLoaded", () => {
  // Configura o texto inicial do botão fechar do modal
  if (closeBtn) {
    closeBtn.innerText = "❌"; // Garante que o X esteja lá
  } else {
    console.warn(
      "Botão fechar modal (#closeModal) não encontrado durante DOMContentLoaded."
    );
  }

  // Lida com o idioma salvo no localStorage na carga da página
  const lang = localStorage.getItem("lang") || "pt";
  if (languageSelector) {
    // Define o valor do seletor para o idioma salvo
    languageSelector.value = lang;
    // Verifica se o valor salvo não é uma opção válida e corrige localStorage se necessário
    if (languageSelector.value !== lang) {
      console.warn(
        `Idioma "${lang}" do localStorage não encontrado nas opções do languageSelector. Usando o valor selecionado no seletor (${languageSelector.value}).`
      );
      localStorage.setItem("lang", languageSelector.value);
      // A variável `lang` já tem o valor correto para updateContent
    }
    console.log("Idioma inicial (DOMContentLoaded):", languageSelector.value); // Log
  } else {
    console.warn(
      "Seletor de Idioma (#languageSelector) não encontrado durante DOMContentLoaded."
    );
  }

  // Atualiza todo o conteúdo da página para o idioma inicial (do localStorage ou padrão)
  // Isso também chama updateTalkTouchStatus para definir o status inicial visual
  updateContent(lang);

  // Aplica os ouvintes de clique (.speak) com base no estado TalkTouch inicial (do localStorage)
  applyTalkTouch();
});

// Funções placeholder para fonte e contraste (precisam ser implementadas)
function increaseFont() {
  console.log("increaseFont function called"); /* Implementar lógica aqui */
}
function decreaseFont() {
  console.log("decreaseFont function called"); /* Implementar lógica aqui */
}
function toggleContrast() {
  console.log("toggleContrast function called"); /* Implementar lógica aqui */
}
