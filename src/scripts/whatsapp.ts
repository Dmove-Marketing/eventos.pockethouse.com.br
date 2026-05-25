const WA_NUMBER = '5511950759912';

function getWAMessage(): string {
  try {
    const raw = sessionStorage.getItem('dmove_tracking');
    const tracking = raw ? JSON.parse(raw) : {};
    const source = (tracking.utm_source || '').toLowerCase();
    const medium = (tracking.utm_medium || '').toLowerCase();

    if (source.includes('google') || medium.includes('cpc') || medium.includes('ppc')) {
      return 'Olá! Pesquisei sobre a Pocket House e gostaria de solicitar um orçamento.';
    }
    const hasFbclid = !!tracking.fbclid;
    if (
      source.includes('meta') ||
      source.includes('facebook') ||
      source.includes('instagram') ||
      source.includes('fb') ||
      source === 'ig' ||
      medium.includes('paid_social') ||
      medium.includes('social') ||
      hasFbclid
    ) {
      return 'Olá! Me interessei pela Pocket House e gostaria de solicitar um orçamento.';
    }
  } catch {}
  return 'Olá! Gostaria de solicitar um orçamento na Pocket House.';
}

export function openWhatsApp(): void {
  const msg = getWAMessage();
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({ event: 'whatsapp_click' });
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
}

(window as any).openWhatsApp = openWhatsApp;
