
export const getFileInfo = (url: string) => {
  if (!url) return { name: 'Unknown', type: 'unknown', size: 0 };
  
  const filename = url.split('/').pop() || 'unknown';
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  return {
    name: filename,
    type: extension,
    size: 0 // Size would need to be fetched separately
  };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
