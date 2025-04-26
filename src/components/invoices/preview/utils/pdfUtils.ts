
export const createProxyUrl = (fullStorageUrl: string, attempt: number): string => {
  if (!fullStorageUrl) return '';

  let relativePath = '';
  const storagePathPrefix = '/public/invoices/';

  try {
    const parsedUrl = new URL(fullStorageUrl);
    const pathname = parsedUrl.pathname;
    const prefixIndex = pathname.indexOf(storagePathPrefix);

    if (prefixIndex !== -1) {
      relativePath = pathname.substring(prefixIndex + storagePathPrefix.length);
    } else {
      console.warn(`Storage path prefix "${storagePathPrefix}" not found in URL pathname: ${pathname}`);
      relativePath = pathname.split('/').pop() || '';
    }
  } catch (e) {
    console.error('Failed to parse URL:', fullStorageUrl, e);
    relativePath = fullStorageUrl.split('/').pop() || '';
  }

  if (!relativePath) {
    console.error('Could not determine relative path for:', fullStorageUrl);
    return '';
  }

  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 10);
  const uniqueKey = `${timestamp}-${randomId}-${attempt}`;

  return `https://cahergndkwfqltxyikyr.supabase.co/functions/v1/pdf-proxy?pdf=${encodeURIComponent(relativePath)}&t=${uniqueKey}`;
};

export const createPdfViewerUrls = (proxyUrl: string) => ({
  pdfJs: `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(proxyUrl)}`,
  googleDocs: `https://docs.google.com/viewer?url=${encodeURIComponent(proxyUrl)}&embedded=true`
});

