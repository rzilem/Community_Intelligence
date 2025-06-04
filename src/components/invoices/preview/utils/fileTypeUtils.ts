
export const getFileTypeFromUrl = (url: string): string => {
  if (!url) return 'unknown';
  
  const extension = url.split('.').pop()?.toLowerCase() || '';
  
  const typeMap: Record<string, string> = {
    'pdf': 'pdf',
    'doc': 'word',
    'docx': 'word',
    'xls': 'excel',
    'xlsx': 'excel',
    'jpg': 'image',
    'jpeg': 'image',
    'png': 'image',
    'gif': 'image',
    'txt': 'text',
    'html': 'html',
    'htm': 'html'
  };
  
  return typeMap[extension] || 'unknown';
};

export const isKnownFileType = (type: string): boolean => {
  const knownTypes = ['pdf', 'word', 'excel', 'image', 'text', 'html'];
  return knownTypes.includes(type);
};
