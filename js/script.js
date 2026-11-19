/* ================= CONTROLE DE ÁUDIO (MP3) ================= */
const bgMusic = document.getElementById('bg-music');
const soundBtn = document.getElementById('sound');
const introScreen = document.getElementById('intro-screen');

let isPlaying = false;
let userPausedMusic = false;

function iniciarMusica() {
  if (!isPlaying && !userPausedMusic) {
    bgMusic.volume = 0.6;
    bgMusic.play().then(() => {
      isPlaying = true;
      soundBtn.classList.add('on');
      soundBtn.textContent = '♫';
    }).catch(err => console.log("Autoplay bloqueado."));
  }
}

function stopMusic() {
  bgMusic.pause();
  isPlaying = false;
  soundBtn.classList.remove('on');
  soundBtn.textContent = '♪';
}

soundBtn.addEventListener('click', (event) => {
  event.stopPropagation();
  if(isPlaying){
    userPausedMusic = true;
    stopMusic();
  } else {
    userPausedMusic = false;
    iniciarMusica();
  }
});

document.addEventListener('pointerdown', function startMusic() {
  iniciarMusica();
  document.removeEventListener('pointerdown', startMusic);
}, { passive: true });

/* ================= ANIMAÇÃO DE ABERTURA ================= */
setTimeout(() => {
  introScreen.classList.add('open');
  iniciarMusica();
  setTimeout(burstPetals, 2600);
}, 850);

/* ================= PÉTALAS & BRILHOS ================= */
const petalsEl = document.getElementById('petals');
const sparklesEl = document.getElementById('sparkles-container');

function createPetal(extra){
  const p = document.createElement('div');
  p.className = 'petal';
  const size = 10 + Math.random()*10;
  p.style.width = size + 'px';
  p.style.height = (size*1.4) + 'px';
  p.style.left = Math.random()*100 + 'vw';
  p.style.setProperty('--scale', (0.6 + Math.random()*0.6).toFixed(2));
  p.style.setProperty('--drift', ((Math.random()-0.5)*200).toFixed(0) + 'px');
  p.style.setProperty('--rot', (360 + Math.random()*720).toFixed(0) + 'deg');
  p.style.animationDuration = (15 + Math.random()*15) + 's';
  p.style.animationDelay = (-Math.random()*15) + 's';
  
  const colors = ['#A2B08E', '#D8D2C4', '#5A6349'];
  p.style.background = colors[Math.floor(Math.random() * colors.length)];

  if(extra){
    p.style.animationDuration = (2.5 + Math.random()*2) + 's';
    p.style.animationDelay = '0s';
    p.style.top = '50vh';
  }
  petalsEl.appendChild(p);
  if(extra) setTimeout(()=>p.remove(), 5000);
}
for(let i=0;i<20;i++) createPetal(false);

function createSparkle(){
  const s = document.createElement('div');
  s.className = 'sparkle';
  s.style.left = Math.random()*100 + 'vw';
  s.style.top = Math.random()*100 + 'vh';
  s.style.animationDuration = (3 + Math.random()*4) + 's';
  s.style.animationDelay = (Math.random()*2) + 's';
  sparklesEl.appendChild(s);
  setTimeout(()=>s.remove(), 8000);
}
setInterval(() => { if(!document.hidden) createSparkle(); }, 500);

function burstPetals(){
  for(let i=0;i<40;i++) createPetal(true);
}

/* ================= REVEAL ================= */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
},{threshold:.14});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* ================= CONTAGEM (16h) ================= */
const target = new Date('2026-12-18T16:00:00-03:00').getTime();
let lastSec = -1;
function tick(){
  const d = Math.max(0, target - Date.now());
  const days = Math.floor(d/86400000);
  const hours = Math.floor(d/3600000)%24;
  const minutes = Math.floor(d/60000)%60;
  const seconds = Math.floor(d/1000)%60;
  document.getElementById('bigDays').textContent = days;
  document.getElementById('days').textContent = String(days).padStart(2,'0');
  document.getElementById('hours').textContent = String(hours).padStart(2,'0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2,'0');
  const secEl = document.getElementById('seconds');
  secEl.textContent = String(seconds).padStart(2,'0');
  if(seconds !== lastSec){
    secEl.classList.add('flip');
    setTimeout(()=>secEl.classList.remove('flip'), 200);
    lastSec = seconds;
  }
}
tick(); setInterval(tick, 1000);

/* ================= COPIAR PIX ================= */
function copiarPix() {
  const key = document.getElementById('pixKey').innerText;
  const btn = document.getElementById('copyBtn');
  
  navigator.clipboard.writeText(key).then(() => {
    btn.innerText = 'Copiado com sucesso! 💛';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerText = 'Copiar Chave Pix';
      btn.classList.remove('copied');
    }, 3000);
    burstPetals();
  }).catch(err => {
    alert('Não foi possível copiar. Sua chave é: ' + key);
  });
}

/* ================= CARROSSEL COVERFLOW ================= */
(function initCoverflow() {
  const wrapper = document.querySelector('.coverflow');
  const items = Array.from(document.querySelectorAll('.coverflow-item'));
  const prevBtn = document.getElementById('cfPrev');
  const nextBtn = document.getElementById('cfNext');
  const dotsWrap = document.getElementById('cfDots');
  
  if (!items.length) return;

  let currentIndex = 0;
  const total = items.length;
  let autoplayId = null;

  // Cria as bolinhas
  items.forEach((_, i) => {
    const dot = document.createElement('span');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  // Posiciona os itens baseados na distância do centro
  function render() {
    items.forEach((item, index) => {
      let offset = index - currentIndex;
      
      // Se estiver no final, faz o loop para a esquerda (opcional)
      if (offset < -Math.floor(total / 2)) offset += total;
      if (offset > Math.floor(total / 2)) offset -= total;

      const absOffset = Math.abs(offset);
      
      // Configurações visuais: posição X, escala, opacidade e Z-index
      const translateX = offset * 90; // Distância horizontal
      const scale = 1 - (absOffset * 0.15); // Fica menor conforme se afasta
      const opacity = 1 - (absOffset * 0.3); // Fica transparente conforme se afasta
      const zIndex = 10 - absOffset;
      const rotateY = offset * -15; // Efeito 3D

      item.style.transform = `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`;
      item.style.opacity = opacity < 0 ? 0 : opacity;
      item.style.zIndex = zIndex;
      
      item.classList.toggle('active', offset === 0);
    });

    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
  }

  function goTo(index) {
    currentIndex = (index + total) % total;
    render();
    restartAutoplay();
  }

  function next() { goTo(currentIndex + 1); }
  function prev() { goTo(currentIndex - 1); }

  function startAutoplay() {
    stopAutoplay();
    autoplayId = setInterval(() => {
      if (!document.hidden) {
        currentIndex = (currentIndex + 1) % total;
        render();
      }
    }, 3500);
  }

  function stopAutoplay() {
    if (autoplayId) clearInterval(autoplayId);
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Eventos de clique
  nextBtn.addEventListener('click', (e) => { e.preventDefault(); next(); });
  prevBtn.addEventListener('click', (e) => { e.preventDefault(); prev(); });

  // Permite clicar na imagem lateral para centralizá-la
  items.forEach((item, index) => {
    item.addEventListener('click', () => {
      if (index !== currentIndex) goTo(index);
    });
  });

  // Swipe (touch)
  let startX = null;
  let isDragging = false;

  wrapper.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    isDragging = true;
    stopAutoplay();
  }, { passive: true });

  wrapper.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - startX;
    if (Math.abs(dx) > 10) e.preventDefault(); // Evita scroll lateral
  }, { passive: false });

  wrapper.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    const endX = e.changedTouches[0].clientX;
    const dx = endX - startX;
    if (Math.abs(dx) > 40) {
      if (dx < 0) next();
      else prev();
    } else {
      restartAutoplay();
    }
    isDragging = false;
  });

  // Pausa autoplay quando o carrossel não está visível
  const visIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) startAutoplay();
      else stopAutoplay();
    });
  }, { threshold: 0.15 });
  visIO.observe(wrapper);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  // Inicializa
  render();
})();

/* ================= FORMULÁRIO RSVP WHATSAPP ================= */
const rsvpForm = document.getElementById('rsvpForm');
if (rsvpForm) {
  rsvpForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const nome = document.getElementById('rsvpNome').value.trim();
    const presenca = document.getElementById('rsvpPresenca').value;
    const pessoas = document.getElementById('rsvpPessoas').value;
    const mensagem = document.getElementById('rsvpMensagem').value.trim();

    // Número do WhatsApp com DDI (55) + DDD (61) + número
    const numeroWhatsApp = "5561991115742";

    // Monta o texto bonitinho
    let texto = `*Confirmação de Presença - Casamento Ially & Mikael*\n\n`;
    texto += `*Nome:* ${nome}\n`;
    texto += `*Presença:* ${presenca}\n`;
    
    if (presenca.includes("Sim")) {
      texto += `*Acompanhantes:* ${pessoas} pessoa(s)\n`;
    }
    
    if (mensagem) {
      texto += `*Recado:* ${mensagem}\n`;
    }

    const textoCodificado = encodeURIComponent(texto);
    const url = `https://wa.me/${numeroWhatsApp}?text=${textoCodificado}`;

    // Abre o WhatsApp em uma nova aba
    window.open(url, '_blank');

    // Limpa o formulário e dispara as pétalas
    rsvpForm.reset();
    burstPetals();

    // Feedback visual opcional (pode ser um alert ou trocar o botão temporariamente)
    const btn = rsvpForm.querySelector('button[type="submit"]');
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = '<span>Enviado! Abrindo WhatsApp... 💛</span>';
    btn.style.background = '#1ebe5b';
    
    setTimeout(() => {
      btn.innerHTML = textoOriginal;
      btn.style.background = '';
    }, 3000);
  });
}

/* ================= IDIOMA ================= */
const langBtns = document.querySelectorAll('.lang button');
langBtns.forEach(btn=>btn.addEventListener('click',()=>{
  langBtns.forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const l = btn.dataset.lang;
  document.documentElement.lang = l==='pt'?'pt-BR':'en';
  
  document.querySelectorAll('[data-pt][data-en]').forEach(el=>{
    if(el.tagName === 'OPTION') {
      el.textContent = el.dataset[l];
    } else {
      el.textContent = el.dataset[l];
    }
  });
}));

/* ================= PROGRESSO ================= */
const progressBar = document.getElementById('progressBar');
function updateProgress(){
  const h = document.documentElement;
  const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
  progressBar.style.width = (scrolled*100) + '%';
}
window.addEventListener('scroll', updateProgress, {passive:true});
updateProgress();
