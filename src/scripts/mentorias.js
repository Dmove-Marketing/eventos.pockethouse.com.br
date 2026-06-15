/* mentorias.js */

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

// Calendário flatpickr no campo Data do evento
const dataEvento = document.getElementById('data_evento');
if (dataEvento && typeof flatpickr !== 'undefined') {
  flatpickr(dataEvento, {
    locale: 'pt',
    dateFormat: 'd/m/Y',
    minDate: 'today',
    disableMobile: true,
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
  const wrap = document.getElementById(id);
  if (!wrap) return;
  const track = wrap.querySelector('.carrossel-track');
  if (!track || !track.children.length) return;

  track.appendChild(track.children[0].cloneNode(true));

  const realCount = track.children.length - 1;
  let current = 0;
  let timer;

  function slideTo(n) {
    current = n;
    track.style.transition = 'transform 0.6s ease';
    track.style.transform = `translateX(-${current * 100}%)`;
  }

  track.addEventListener('transitionend', () => {
    if (current >= realCount) {
      track.style.transition = 'none';
      current = 0;
      track.style.transform = 'translateX(0%)';
    }
  });

  function start() {
    clearInterval(timer);
    timer = setInterval(() => slideTo(current + 1), 5000);
  }

  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = tx - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) {
      slideTo(dx > 0 ? current + 1 : Math.max(0, current - 1));
      start();
    }
  }, { passive: true });

  start();
}

initCarrossel('carrossel-vl');
initCarrossel('carrossel-ap');
initCarrossel('carrossel-pan');

// Carrossel duo: 2 visíveis, avança 1 por vez (passo de 50%)
function initCarrosselDuo(id) {
  const wrap = document.getElementById(id);
  if (!wrap) return;
  const track = wrap.querySelector('.carrossel-track');
  if (!track || !track.children.length) return;

  track.appendChild(track.children[0].cloneNode(true));

  const realCount = track.children.length - 1;
  let current = 0;
  let timer;

  function getStep() {
    return (track.children[0].offsetWidth / wrap.offsetWidth) * 100;
  }

  function slideTo(n) {
    current = n;
    track.style.transition = 'transform 0.6s ease';
    track.style.transform = `translateX(-${current * getStep()}%)`;
  }

  track.addEventListener('transitionend', () => {
    if (current >= realCount) {
      track.style.transition = 'none';
      current = 0;
      track.style.transform = 'translateX(0%)';
    }
  });

  function start() {
    clearInterval(timer);
    timer = setInterval(() => slideTo(current + 1), 5000);
  }

  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = tx - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) {
      slideTo(dx > 0 ? current + 1 : Math.max(0, current - 1));
      start();
    }
  }, { passive: true });

  start();
}

initCarrosselDuo('carrossel-condicoes');

// Galeria mobile carousel
function initGaleriaMobile() {
  const grid = document.querySelector('.galeria-grid');
  if (!grid || getComputedStyle(grid).display !== 'flex') return;

  grid.appendChild(grid.children[0].cloneNode(true));

  const realCount = grid.children.length - 1;
  let current = 0;
  let timer;

  function slideTo(n) {
    current = n;
    grid.style.transition = 'transform 0.6s ease';
    grid.style.transform = `translateX(-${current * 100}%)`;
  }

  grid.addEventListener('transitionend', () => {
    if (current >= realCount) {
      grid.style.transition = 'none';
      current = 0;
      grid.style.transform = 'translateX(0%)';
    }
  });

  function start() {
    clearInterval(timer);
    timer = setInterval(() => slideTo(current + 1), 5000);
  }

  let tx = 0;
  grid.addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; }, { passive: true });
  grid.addEventListener('touchend', e => {
    const dx = tx - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) {
      slideTo(dx > 0 ? current + 1 : Math.max(0, current - 1));
      start();
    }
  }, { passive: true });

  start();
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
