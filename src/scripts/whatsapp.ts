import { getWhatsAppMessage, buildWhatsAppUrl } from '../lib/whatsapp-message';

function updateWhatsAppLinks(): void {
  const utmSource = new URLSearchParams(window.location.search).get('utm_source');
  const message = getWhatsAppMessage(window.location.pathname, utmSource);
  const url = buildWhatsAppUrl(message);

  document.querySelectorAll<HTMLAnchorElement>('[data-whatsapp-cta]').forEach((link) => {
    link.href = url;
  });
}

function trackWhatsAppClick(event: Event): void {
  const target = event.target as HTMLElement;
  if (!target.closest('[data-whatsapp-cta]')) return;

  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({ event: 'whatsapp_click' });
}

function init(): void {
  updateWhatsAppLinks();
  document.addEventListener('click', trackWhatsAppClick);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
