// Regra de mensagem dinâmica do WhatsApp por rota + utm_source.
// Sem dependências de DOM/window — importável tanto no frontmatter Astro (SSR)
// quanto nos scripts client-side.

export const WA_NUMBER = '5511950759912';
export const WA_FALLBACK_MESSAGE = 'Olá! Gostaria de solicitar um orçamento na Pocket House.';

const META_SOURCES = new Set(['meta', 'ig', 'instagram', 'fb']);

export function getWhatsAppMessage(pathname: string, utmSource?: string | null): string {
  const source = (utmSource || '').toLowerCase().trim();
  const path = (pathname || '/').replace(/\/+$/, '') || '/';

  if (path === '/bio') {
    return 'Olá! Vim pelo Instagram e gostaria de solicitar um orçamento na Pocket House.';
  }

  if (path === '/corporativo' || path === '/eventos-corporativos') {
    if (source === 'google') return WA_FALLBACK_MESSAGE;
    if (META_SOURCES.has(source)) return 'Olá! Vim pelo site e gostaria de solicitar um orçamento na Pocket House.';
    return WA_FALLBACK_MESSAGE;
  }

  if (path === '/mentorias') {
    if (source === 'google') return 'Olá! Eu gostaria de solicitar um orçamento sobre workshops e mentorias na Pocket House.';
    if (META_SOURCES.has(source)) return 'Olá! Vim pelo site! Eu gostaria de solicitar um orçamento sobre workshops e mentorias na Pocket House.';
    return WA_FALLBACK_MESSAGE;
  }

  return WA_FALLBACK_MESSAGE;
}

export function buildWhatsAppUrl(message: string, phone: string = WA_NUMBER): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
