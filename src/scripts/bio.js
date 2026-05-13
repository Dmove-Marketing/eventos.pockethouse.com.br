/* Scripts extraídos de bio.html */

// WhatsApp mask
    document.getElementById('whatsapp').addEventListener('input', function (e) {
      let v = e.target.value.replace(/\D/g, '').slice(0, 11);
      if (v.length > 6) v = '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7);
      else if (v.length > 2) v = '(' + v.slice(0, 2) + ') ' + v.slice(2);
      else if (v.length > 0) v = '(' + v;
      e.target.value = v;
    });

    function handleSubmit(e) {
      e.preventDefault();
      const btn = document.getElementById('submitBtn');
      btn.disabled = true;
      btn.textContent = 'Enviando…';

      // Simulate send
      setTimeout(() => {
        document.getElementById('formWrap').style.display = 'none';
        const sm = document.getElementById('successMsg');
        sm.style.display = 'flex';
      }, 1200);
    }