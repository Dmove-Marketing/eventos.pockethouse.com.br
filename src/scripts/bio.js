const telefoneInput = document.getElementById('telefone');
if (telefoneInput) {
  telefoneInput.addEventListener('input', function(e) {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 6) v = '(' + v.slice(0,2) + ') ' + v.slice(2,7) + '-' + v.slice(7);
    else if (v.length > 2) v = '(' + v.slice(0,2) + ') ' + v.slice(2);
    else if (v.length > 0) v = '(' + v;
    e.target.value = v;
  });
}

// Flatpickr — seletor de data
const script = document.createElement('script');
script.src = 'https://npmcdn.com/flatpickr/dist/flatpickr.min.js';
script.onload = () => {
  flatpickr('#data', {
    locale: 'pt',
    dateFormat: 'd/m/Y',
    minDate: 'today',
    disableMobile: true,
  });
};
document.head.appendChild(script);