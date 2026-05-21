function getCookie(name: string): string {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
  return m ? m[1] : '';
}

function safeDecode(v: string): string {
  const s = String(v).replace(/\+/g, ' ');
  try { return decodeURIComponent(s); } catch { return s; }
}

function buildFonteWithUtms(base: string, sessionTracking: Record<string, string>): string {
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  const clickKeys: [string, ...string[]][] = [
    ['gclid',  'gclid',  '__gclid'],
    ['gbraid', 'gbraid', '__gbraid'],
    ['wbraid', 'wbraid', '__wbraid'],
    ['fbclid', 'fbclid'],
    ['fbc',    '_fbc'],
    ['fbp',    '_fbp'],
    ['ttclid', 'ttclid'],
    ['msclkid','msclkid'],
  ];

  const merged: Record<string, string> = {};

  for (const key of utmKeys) {
    const val = sessionTracking[key] || safeDecode(getCookie(key));
    if (val) merged[key] = val;
  }

  for (const [outKey, ...cookieNames] of clickKeys) {
    const fromSession = sessionTracking[outKey] || sessionTracking[cookieNames[0]] || '';
    let fromCookie = '';
    for (const cn of cookieNames) {
      const raw = getCookie(cn);
      if (raw) { fromCookie = safeDecode(raw); break; }
    }
    const val = fromSession || fromCookie;
    if (val) merged[outKey] = val;
  }

  const qs = Object.entries(merged)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  if (!qs) return base;
  const qpos = base.indexOf('?');
  const prefix = qpos === -1 ? base : base.slice(0, qpos);
  return `${prefix}?${qs}`;
}

// Maps internal field names to Elementor-style labels
const fieldNameMap: Record<string, string> = {
  nome:        'Nome',
  telefone:    'WhatsApp',
  email:       'E-mail',
  tipo:        'Tipo de evento',
  data:        'Data do evento',
  data_evento: 'Data do evento',
  horario:     'Horário do evento',
  hora:        'Horário do evento',
  empresa:     'Empresa',
  convidados:  'Convidados',
  mensagem:    'Mensagem',
  unidade:     'Unidade',
  fonte:       'Fonte',
};

export function initForms() {
  const forms = document.querySelectorAll<HTMLFormElement>('form[data-form-id]:not([data-forms-init])');
  forms.forEach((form) => {
    form.setAttribute('data-forms-init', '1');
    let started = false;
    const formId   = form.dataset.formId!;
    const formName = form.dataset.formName || form.getAttribute('name') || formId;
    const project  = form.dataset.project || window.location.hostname;

    const apiUrl    = form.dataset.apiUrl ?? '';
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

      const hp = form.querySelector<HTMLInputElement>('[name="website"]');
      if (hp && hp.value) return;

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
        const originalText = submitBtn.innerHTML;
        submitBtn.dataset.originalText = originalText;
        submitBtn.innerHTML = 'Enviando...';
      }

      if (msgEl) msgEl.style.display = 'none';

      const formData = new FormData(form);
      const rawData: Record<string, string> = {};
      formData.forEach((v, k) => { if (k !== 'website') rawData[k] = v.toString(); });

      // Capitalize first letter of each word in text/textarea fields
      const skipCap = new Set(['data', 'data_evento', 'horario', 'hora', 'fonte', 'email']);
      Object.keys(rawData).forEach(key => {
        if (skipCap.has(key) || !rawData[key]) return;
        const el = form.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${key}"]`);
        if (!el) return;
        const type = el.tagName.toLowerCase() === 'textarea' ? 'textarea' : (el as HTMLInputElement).type;
        if (type === 'text' || type === 'textarea') {
          rawData[key] = rawData[key].replace(/(?:^|\s)\S/g, c => c.toUpperCase());
        }
      });

      const trackingRaw = sessionStorage.getItem('dmove_tracking');
      const tracking    = trackingRaw ? JSON.parse(trackingRaw) : {};
      const firstVisit  = sessionStorage.getItem('dmove_first_visit') || '';

      // Build Fonte with UTMs from sessionStorage + cookie fallback
      const fonteBase    = rawData['fonte'] || '';
      const fonteWithUtms = buildFonteWithUtms(fonteBase, tracking);

      // Submission timestamp
      const now  = new Date();
      const pad  = (n: number) => String(n).padStart(2, '0');
      const submissionDate = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
      const submissionTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

      // Build flat payload matching Elementor field names
      const payload: Record<string, string> = {};

      Object.entries(rawData).forEach(([k, v]) => {
        if (k === 'fonte') {
          payload['Fonte'] = fonteWithUtms;
        } else {
          payload[fieldNameMap[k] ?? (k.charAt(0).toUpperCase() + k.slice(1))] = v;
        }
      });

      // Metadata fields (added after form fields, matching Elementor order)
      payload['Data']              = submissionDate;
      payload['Horário']           = submissionTime;
      payload['URL da página']     = window.location.href;
      payload['Agente de usuário'] = navigator.userAgent;
      payload['Desenvolvido por']  = 'Astro';
      payload['form_id']           = formId;
      payload['form_name']         = formName;
      payload['project']           = project;

      try {
        const res = await fetch(submitUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('http_' + res.status);

        let json: any = {};
        try { json = await res.json(); } catch {}

        (window as any).dataLayer?.push({ event: 'form_submit', form_id: formId, project, ...rawData });

        const redir = redirectUrl || json.redirect;
        if (redir) {
          window.location.href = redir;
          return;
        }

        const gridEl    = gridId    ? document.getElementById(gridId)    : null;
        const successEl = successId ? document.getElementById(successId) : null;

        if (gridEl && successEl) {
          gridEl.style.display = 'none';
          successEl.classList.add('active');
        } else {
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

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initForms);
  } else {
    initForms();
  }
}
