/* ================= CONTROLE DE ÁUDIO (MP3) ================= */
const bgMusic = document.getElementById('bg-music');
const soundBtn = document.getElementById('sound');
const introScreen = document.getElementById('intro-screen');

let isPlaying = false;

function iniciarMusica() {
  if (!isPlaying) {
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
  if(isPlaying){ stopMusic(); } else { iniciarMusica(); }
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

/* ================= RSVP COM ENVIO VIA E-MAIL (FormSubmit) ================= */
const form = document.getElementById('rsvpForm');
const successBox = document.getElementById('rsvpSuccess');

form.addEventListener('submit', async (e) => {
  e.preventDefault(); 
  
  const submitBtn = form.querySelector('.submit');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = document.documentElement.lang !== 'en' ? 'Enviando...' : 'Sending...';
  
  const formData = new FormData(form);
  const name = formData.get('nome') || '';
  const pt = document.documentElement.lang !== 'en';
  
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.ok) {
      successBox.textContent = pt
        ? `Obrigado, ${name}! Sua confirmação foi enviada para os noivos. 💛`
        : `Thank you, ${name}! Your confirmation has been sent to the couple. 💛`;
      successBox.classList.add('show');
      form.style.display = 'none';
      burstPetals();
      successBox.scrollIntoView({behavior:'smooth', block:'center'});
    } else {
      throw new Error('Erro no envio');
    }
  } catch (error) {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    alert(pt
      ? 'Ocorreu um erro ao enviar. Verifique sua internet e tente novamente.'
      : 'An error occurred while sending. Check your internet and try again.');
  }
});

/* ================= IDIOMA ================= */
const langBtns = document.querySelectorAll('.lang button');
langBtns.forEach(btn=>btn.addEventListener('click',()=>{
  langBtns.forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const l = btn.dataset.lang;
  document.documentElement.lang = l==='pt'?'pt-BR':'en';
  document.querySelectorAll('[data-pt][data-en]').forEach(el=>el.textContent = el.dataset[l]);
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