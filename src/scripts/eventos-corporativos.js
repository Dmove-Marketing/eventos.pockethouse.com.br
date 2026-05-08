/* Scripts extraídos de eventos-corporativos.html */

function scrollToForm() {
  document.getElementById('formulario').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => document.getElementById('nome').focus(), 600);
}

document.querySelectorAll('[onclick="scrollToForm()"]').forEach(el => {
  el.removeAttribute('onclick');
  el.addEventListener('click', scrollToForm);
});

        // Intersection Observer para animações ao scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

// Flatpickr — seletor de data
const fpScript = document.createElement('script');
fpScript.src = 'https://npmcdn.com/flatpickr/dist/flatpickr.min.js';
fpScript.onload = () => {
  flatpickr('#data', {
    locale: 'pt',
    dateFormat: 'd/m/Y',
    minDate: 'today',
    disableMobile: true,
  });
};
document.head.appendChild(fpScript);

        document.querySelectorAll('.unit-card, .gallery-item, .testimonial-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(el);
        });