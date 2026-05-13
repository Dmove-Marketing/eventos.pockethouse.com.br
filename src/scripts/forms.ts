export function initForms() {
  const forms = document.querySelectorAll<HTMLFormElement>('form[data-form-id]');
  forms.forEach((form) => {
    let started = false;
    const formId  = form.dataset.formId!;
    const project = form.dataset.project || window.location.hostname;
    
    const apiUrl  = form.dataset.apiUrl ?? '';
    const submitUrl = form.dataset.submitUrl || (apiUrl ? `${apiUrl}/submit` : null);
    const redirectUrl = form.dataset.redirect;
    const gridId    = form.dataset.gridId;
    const successId = form.dataset.successId;

    if (!submitUrl) {
      console.warn(`[Forms] Formulário ${formId} sem URL de webhook (data-submit-url).`);
      return;
    }

    form.addEventListener('focusin', () => {
      if (!started) {
        started = true;
        (window as any).dataLayer?.push({ event: 'form_start', form_id: formId, project });
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Honeypot check
      const hp = form.querySelector<HTMLInputElement>('[name="website"]');
      if (hp && hp.value) return;

      // Required field validation
      let isValid = true;
      form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[required]').forEach(field => {
        if (field.value.trim() === '') {
          isValid = false;
          field.classList.add('field-invalid');
          const clear = () => { field.classList.remove('field-invalid'); field.removeEventListener('input', clear); field.removeEventListener('change', clear); };
          field.addEventListener('input', clear);
          field.addEventListener('change', clear);
        }
      });
      if (!isValid) {
        const first = form.querySelector<HTMLElement>('.field-invalid');
        first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        first?.focus();
        return;
      }

      const submitBtn  = form.querySelector<HTMLButtonElement>('.form-submit, [type="submit"]');
      const btnText    = submitBtn?.querySelector<HTMLElement>('.btn-text');
      const btnLoading = submitBtn?.querySelector<HTMLElement>('.btn-loading');
      
      const msgEl = gridId 
        ? document.getElementById(gridId)?.querySelector('[id$="FormMsg"]') as HTMLElement | null 
        : form.querySelector('.form-error') as HTMLElement | null;

      if (submitBtn) submitBtn.disabled = true;
      
      if (btnText && btnLoading) {
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-flex';
      } else if (submitBtn && !submitBtn.querySelector('.btn-loading')) {
        // Fallback for raw HTML forms without the loading span
        const originalText = submitBtn.innerHTML;
        submitBtn.dataset.originalText = originalText;
        submitBtn.innerHTML = 'Enviando...';
      }

      if (msgEl) msgEl.style.display = 'none';

      const formData = new FormData(form);
      const data: Record<string, string> = {};
      formData.forEach((v, k) => { if (k !== 'website') data[k] = v.toString(); });

      // Capitalize first letter of each word in text/textarea fields
      const skipCap = new Set(['data', 'data_evento', 'horario', 'hora', 'fonte', 'email']);
      Object.keys(data).forEach(key => {
        if (skipCap.has(key) || !data[key]) return;
        const el = form.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${key}"]`);
        if (!el) return;
        const type = el.tagName.toLowerCase() === 'textarea' ? 'textarea' : (el as HTMLInputElement).type;
        if (type === 'text' || type === 'textarea') {
          data[key] = data[key].replace(/(?:^|\s)\S/g, c => c.toUpperCase());
        }
      });

      const trackingRaw = sessionStorage.getItem('dmove_tracking');
      const tracking    = trackingRaw ? JSON.parse(trackingRaw) : {};
      const firstVisit  = sessionStorage.getItem('dmove_first_visit') || '';

      // Capitalize first letter of each key in data
      const dataCapKeys: Record<string, string> = {};
      Object.entries(data).forEach(([k, v]) => {
        dataCapKeys[k.charAt(0).toUpperCase() + k.slice(1)] = v;
      });

      const payload = {
        project,
        form_id: formId,
        data: dataCapKeys,
        tracking: { ...tracking, first_visit: firstVisit, submitted_at: new Date().toISOString(), page_url: window.location.href },
      };

      try {
        const res = await fetch(submitUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('http_' + res.status);

        let json: any = {};
        try { json = await res.json(); } catch {}

        (window as any).dataLayer?.push({ event: 'form_submit', form_id: formId, project, ...data });

        const redir = redirectUrl || json.redirect;
        if (redir) {
          window.location.href = redir;
          return;
        }

        // Show success state
        const gridEl    = gridId    ? document.getElementById(gridId)    : null;
        const successEl = successId ? document.getElementById(successId) : null;

        if (gridEl && successEl) {
          gridEl.style.display = 'none';
          successEl.classList.add('active');
        } else {
          // Replace form content with success message if no specific grid/success elements
          form.innerHTML = `
            <div class="form-success" style="text-align: center; padding: 2rem;">
              <div class="form-success-icon" style="width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; background: #2563eb; border-radius: 50%; font-size: 1.5rem; color: white;">✓</div>
              <h3 class="form-success-title" style="font-size: 1.15rem; font-weight: 600; margin-bottom: 4px;">Enviado com sucesso!</h3>
              <p class="form-success-text" style="color: #666; font-size: 0.9rem;">Em breve entraremos em contato.</p>
            </div>`;
        }
      } catch (err: any) {
        (window as any).dataLayer?.push({ event: 'form_error', form_id: formId, error: err.message });

        if (msgEl) {
          msgEl.innerHTML = 'Erro ao enviar. Tente novamente mais tarde.';
          msgEl.style.display = 'block';
        } else {
          alert('Erro ao enviar o formulário. Tente novamente mais tarde.');
        }

        if (submitBtn) {
          submitBtn.disabled = false;
          if (btnText && btnLoading) {
             btnText.style.display = 'inline';
             btnLoading.style.display = 'none';
          } else if (submitBtn.dataset.originalText) {
             submitBtn.innerHTML = submitBtn.dataset.originalText;
          }
        }
      }
    });
  });
}

// Auto-initialize if imported directly in client scripts
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initForms);
  } else {
    initForms();
  }
}
