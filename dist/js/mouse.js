const imagemPrincipal = document.getElementById('aceleria');
const body = document.body;

let podeCriarRastro = true;
const intervaloRastro = 30;

window.addEventListener('mousemove', (event) => {
  const x = event.clientX;
  const y = event.clientY;

  const offsetX = imagemPrincipal.offsetWidth / 2;
  const offsetY = imagemPrincipal.offsetHeight / 2;

  // Ajuste para o fantasma ficar mais perto do mouse
  imagemPrincipal.style.transform = `translate(${x - offsetX + 10}px, ${y - offsetY}px)`;

  if (podeCriarRastro) {
    criarElementoRastro(x, y);
    podeCriarRastro = false;
    setTimeout(() => {
      podeCriarRastro = true;
    }, intervaloRastro);
  }
});

function criarElementoRastro(x, y) {
  const rastro = document.createElement('div');
  rastro.className = 'rastro';
  const tamanhoRastro = 15;
  rastro.style.left = `${x - tamanhoRastro / 2}px`;
  rastro.style.top = `${y - tamanhoRastro / 2}px`;

  body.appendChild(rastro);

  setTimeout(() => {
    if (rastro.parentNode === body) {
      body.removeChild(rastro);
    }
  }, 800);
}
