const modal = document.getElementById("accessibilityModal");
const openBtn = document.getElementById("openAccessibility");
const closeBtn = document.getElementById("closeModal");
const talkTouchStatus = document.getElementById("talkTouchStatus");

// Abre e fecha o modal
openBtn.onclick = () => modal.classList.remove("hidden");
closeBtn.onclick = () => modal.classList.add("hidden");
window.onclick = (e) => {
  if (e.target === modal) modal.classList.add("hidden");
};

// TalkTouch
let talkTouchEnabled = localStorage.getItem("talkTouch") === "true";

function toggleTalkTouch() {
  talkTouchEnabled = !talkTouchEnabled;
  localStorage.setItem("talkTouch", talkTouchEnabled);
  applyTalkTouch();
  updateTalkTouchStatus();  // Atualiza o status após a alteração
}

function applyTalkTouch() {
  document.querySelectorAll(".speak").forEach(el => {
    el.removeEventListener("click", speakText);
    if (talkTouchEnabled) el.addEventListener("click", speakText);
  });
}

function speakText(event) {
  const text = event.target.textContent;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = localStorage.getItem("lang") === "en" ? "en-US" : "pt-BR";
  window.speechSynthesis.speak(utterance);
}

// Atualiza o status do TalkTouch
function updateTalkTouchStatus() {
  if (talkTouchEnabled) {
    talkTouchStatus.textContent = "TalkTouch: Ativado";
  } else {
    talkTouchStatus.textContent = "TalkTouch: Desativado";
  }
}

// Idioma
document.getElementById("languageSelector").value = localStorage.getItem("lang") || "pt";

function changeLanguage() {
  const lang = document.getElementById("languageSelector").value;
  localStorage.setItem("lang", lang);

  const translations = {
    "pt": {
      title: "Área dos Avaliadores",
      desc: "Bem-vindo ao painel do AceleraTec! Aqui, professores e avaliadores podem acessar os projetos enviados pelos alunos e conferir todos os detalhes cadastrados.",
      login: "Já tenho uma conta",
      register: "Criar conta"
    },
    "en": {
      title: "Evaluator Area",
      desc: "Welcome to the AceleraTec panel! Here, teachers and evaluators can access the projects submitted by students and check all registered details.",
      login: "I already have an account",
      register: "Create account"
    },
  };

  const t = translations[lang];

  document.querySelector("h1.speak").innerText = t.title;
  document.querySelector("p.speak").innerText = t.desc;
  document.querySelector(".btn-primary.speak").innerText = t.login;
  document.querySelector(".btn-secondary.speak").innerText = t.register;
}

// Fonte
function increaseFont() {
  const body = document.body;
  const size = parseFloat(getComputedStyle(body).fontSize);
  body.style.fontSize = (size + 2) + "px";  // Aumenta o tamanho da fonte
  localStorage.setItem("fontSize", body.style.fontSize);  // Salva o novo tamanho no localStorage
}

function decreaseFont() {
  const body = document.body;
  const size = parseFloat(getComputedStyle(body).fontSize);
  body.style.fontSize = (size - 2) + "px";  // Diminui o tamanho da fonte
  localStorage.setItem("fontSize", body.style.fontSize);  // Salva o novo tamanho no localStorage
}

// Contraste
function toggleContrast() {
  document.body.classList.toggle("high-contrast");
  localStorage.setItem("contrast", document.body.classList.contains("high-contrast"));
}

// Carrega preferências salvas
window.onload = () => {
  if (localStorage.getItem("contrast") === "true") {
    document.body.classList.add("high-contrast");
  }
  const savedSize = localStorage.getItem("fontSize");
  if (savedSize) document.body.style.fontSize = savedSize;
  applyTalkTouch();
  updateTalkTouchStatus();  // Atualiza o status do TalkTouch ao carregar a página
};
