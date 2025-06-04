
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
};

export const extractTextFromHtml = (html: string): string => {
  if (!html) return '';
  
  // Create a temporary div to extract text content
  const div = document.createElement('div');
  div.innerHTML = sanitizeHtml(html);
  return div.textContent || div.innerText || '';
};
