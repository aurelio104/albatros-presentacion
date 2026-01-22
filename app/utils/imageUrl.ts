/**
 * Convierte URLs HTTP a HTTPS automáticamente
 * Esto corrige las imágenes existentes que fueron guardadas con HTTP
 */
export function ensureHttps(url: string | undefined | null): string {
  if (!url) return ''
  
  // Si ya es HTTPS, retornar tal cual
  if (url.startsWith('https://')) {
    return url
  }
  
  // Si es HTTP, convertir a HTTPS
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://')
  }
  
  // Si es una URL relativa, retornar tal cual (se manejará por el servidor)
  if (url.startsWith('/')) {
    return url
  }
  
  // Si no tiene protocolo, retornar tal cual
  return url
}

/**
 * Normaliza un array de URLs de imágenes
 */
export function normalizeImageUrls(urls: (string | undefined | null)[]): string[] {
  return urls
    .filter((url): url is string => !!url)
    .map(ensureHttps)
    .filter(url => url.length > 0)
}
