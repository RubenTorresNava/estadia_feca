const API_ORIGIN = 'https://api.fecastore-ujed.com';
const FRONT_ORIGIN = 'https://fecastore-ujed.com';

export const resolveMediaUrl = (mediaUrl?: string | null) => {
  if (!mediaUrl) return null;

  const value = mediaUrl.trim();
  if (!value) return null;

  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);

      // En producción, algunos registros pueden quedar con el host del frontend.
      if (parsed.origin === FRONT_ORIGIN && parsed.pathname.startsWith('/uploads')) {
        return `${API_ORIGIN}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }

      return value;
    } catch {
      return value;
    }
  }

  // Si llega ruta relativa, resolver siempre contra el host del API.
  return `${API_ORIGIN}${value.startsWith('/') ? '' : '/'}${value}`;
};
