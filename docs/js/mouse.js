const imagemPrincipal = document.getElementById("aceleria");
const body = document.body;

let podeCriarRastro = true;
const intervaloRastro = 30;

// Distância de 3cm em pixels (~113.4px)
const distanciaX = 113.4; // para a esquerda
const distanciaY = 60;    // um pouco acima

window.addEventListener("mousemove", (event) => {
  const x = event.clientX;
  const y = event.clientY;

  const offsetX = imagemPrincipal.offsetWidth / 2;
  const offsetY = imagemPrincipal.offsetHeight / 2;

  imagemPrincipal.style.transition = "transform 0.1s ease-out";

  // Subtrai para mover mais à esquerda e para cima
  imagemPrincipal.style.transform = `translate(${x - offsetX - distanciaX}px, ${
    y - offsetY - distanciaY
  }px)`;

  if (podeCriarRastro) {
    criarElementoRastro(x, y);
    podeCriarRastro = false;
    setTimeout(() => {
      podeCriarRastro = true;
    }, intervaloRastro);
  }
});

function criarElementoRastro(x, y) {
  const rastro = document.createElement("div");
  rastro.className = "rastro";
  const tamanhoRastro = 15;
  rastro.style.position = "absolute";
  rastro.style.width = `${tamanhoRastro}px`;
  rastro.style.height = `${tamanhoRastro}px`;
  rastro.style.left = `${x - tamanhoRastro / 2}px`;
  rastro.style.top = `${y - tamanhoRastro / 2}px`;
  rastro.style.pointerEvents = "none";

  body.appendChild(rastro);

  setTimeout(() => {
    if (rastro.parentNode === body) {
      body.removeChild(rastro);
    }
  }, 800);
}
