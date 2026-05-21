/* eventos-corporativos.js */

// Scroll para o formulário
function scrollToForm() {
  document.getElementById('formulario').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => document.getElementById('nome').focus(), 600);
}

// Máscara de telefone
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

// Calendário flatpickr no campo Data do evento
const dataInput = document.getElementById('data');
if (dataInput && typeof flatpickr !== 'undefined') {
  flatpickr(dataInput, {
    locale: 'pt',
    dateFormat: 'd/m/Y',
    minDate: 'today',
    disableMobile: true,
  });
}

// Animações ao scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.unit-card, .gallery-item, .testimonial-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
