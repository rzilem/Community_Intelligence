
export function normalizeUrl(url: string): string {
  if (!url) return '';
  
  // Replace multiple slashes with a single slash, excluding the protocol (://)
  return url.replace(/([^:])\/+/g, '$1/');
}
