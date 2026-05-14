/* corporativo.js */

// ── MÁSCARAS DE INPUT ──

// Telefone: (XX) XXXXX-XXXX
const telInput = document.getElementById('telefone');
if (telInput) {
  telInput.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 6) v = '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7);
    else if (v.length > 2) v = '(' + v.slice(0, 2) + ') ' + v.slice(2);
    else if (v.length > 0) v = '(' + v;
    this.value = v;
  });
}

// Horário: HH:MM (00:00 – 23:59)
const horarioInput = document.getElementById('horario');
if (horarioInput) {
  horarioInput.addEventListener('input', function () {
    let digits = this.value.replace(/\D/g, '').slice(0, 4);

    // Valida primeiro dígito da hora (máx 2)
    if (digits.length >= 1 && parseInt(digits[0]) > 2) digits = '0' + digits.slice(0, 3);
    // Valida hora (máx 23)
    if (digits.length >= 2 && parseInt(digits.slice(0, 2)) > 23) digits = '23' + digits.slice(2);
    // Valida primeiro dígito dos minutos (máx 5)
    if (digits.length >= 3 && parseInt(digits[2]) > 5) digits = digits.slice(0, 2) + '5' + digits[3];
    // Valida minutos (máx 59)
    if (digits.length === 4 && parseInt(digits.slice(2)) > 59) digits = digits.slice(0, 2) + '59';

    this.value = digits.length > 2 ? digits.slice(0, 2) + ':' + digits.slice(2) : digits;
  });

  horarioInput.addEventListener('blur', function () {
    const parts = this.value.split(':');
    if (parts.length !== 2 || parts[1] === '') return;
    const h = Math.min(23, parseInt(parts[0], 10) || 0);
    const m = Math.min(59, parseInt(parts[1], 10) || 0);
    this.value = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  });
}

// Data do evento: DD/MM/AAAA
const dataInput = document.getElementById('data_evento');
if (dataInput) {
  dataInput.addEventListener('input', function () {
    let digits = this.value.replace(/\D/g, '').slice(0, 8);

    // Valida dia (máx 31)
    if (digits.length >= 2 && parseInt(digits.slice(0, 2)) > 31) digits = '31' + digits.slice(2);
    if (digits.length >= 1 && parseInt(digits[0]) > 3) digits = '0' + digits.slice(0, 7);
    // Valida mês (máx 12)
    if (digits.length >= 4 && parseInt(digits.slice(2, 4)) > 12) digits = digits.slice(0, 2) + '12' + digits.slice(4);
    if (digits.length >= 3 && parseInt(digits[2]) > 1) digits = digits.slice(0, 2) + '0' + digits.slice(2, 7);

    let v = digits;
    if (v.length > 4) v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4);
    else if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);

    this.value = v;
  });
}

// Fade-up on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// Smooth scroll para links internos (compensa nav fixed)
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Carrosseis
function initCarrossel(id) {
  const track = document.querySelector(`#${id} .carrossel-track`);
  if (!track) return;

  // Clona o primeiro slide e adiciona no final para loop seamless
  track.appendChild(track.children[0].cloneNode(true));

  const total = track.children.length;
  const originalCount = total - 1;
  let current = 0;
  let intervalId;

  function goTo(n) {
    current = n;
    track.style.transition = 'transform 0.7s ease';
    track.style.transform = `translateX(-${current * 100}%)`;
  }

  // Quando chega no clone do primeiro, salta invisível para o real
  track.addEventListener('transitionend', () => {
    if (current === originalCount) {
      track.style.transition = 'none';
      current = 0;
      track.style.transform = 'translateX(0%)';
    }
  });

  function restart() {
    clearInterval(intervalId);
    intervalId = setInterval(() => goTo(current + 1), 6000);
  }

  // Swipe (mobile)
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      goTo(diff > 0 ? current + 1 : Math.max(0, current - 1));
      restart();
    }
  }, { passive: true });

  restart();
}

initCarrossel('carrossel-vl');
initCarrossel('carrossel-ap');
initCarrossel('carrossel-pan');

// Galeria mobile carousel
function initGaleriaMobile() {
  const track = document.querySelector('.galeria-grid');
  if (!track || getComputedStyle(track).display !== 'flex') return;

  track.appendChild(track.children[0].cloneNode(true));

  const originalCount = track.children.length - 1;
  let current = 0;
  let timer;

  function goTo(n) {
    current = n;
    track.style.transition = 'transform 0.7s ease';
    track.style.transform = `translateX(-${current * 100}%)`;
  }

  track.addEventListener('transitionend', () => {
    if (current === originalCount) {
      track.style.transition = 'none';
      current = 0;
      track.style.transform = 'translateX(0%)';
    }
  });

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 6000);
  }

  // Swipe (mobile)
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      goTo(diff > 0 ? current + 1 : Math.max(0, current - 1));
      startTimer();
    }
  }, { passive: true });

  track.addEventListener('click', () => {
    goTo(current + 1);
    startTimer();
  });

  startTimer();
}

initGaleriaMobile();

// Preload da galeria ao chegar na seção parceiros
function initGaleriaPreload() {
  const parceiros = document.querySelector('.parceiros');
  const galeriaImgs = document.querySelectorAll('.galeria-item img');
  if (!parceiros || !galeriaImgs.length) return;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      galeriaImgs.forEach(img => {
        const src = img.getAttribute('src');
        if (src) {
          const preloader = new Image();
          preloader.src = src;
        }
      });
      observer.disconnect();
    }
  }, { threshold: 0.1 });

  observer.observe(parceiros);
}

initGaleriaPreload();
