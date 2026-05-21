/* bio.js */

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
