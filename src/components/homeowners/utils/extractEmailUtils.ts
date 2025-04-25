
export const extractPrimarySenderEmail = (htmlContent?: string, trackingNumber?: string): string | null => {
  if (htmlContent) {
    const pspropMatch = htmlContent.match(/([a-zA-Z0-9._-]+@psprop\.net)/i);
    if (pspropMatch) {
      console.log('Found psprop.net email:', pspropMatch[0]);
      return pspropMatch[0];
    }
  }
  
  if (trackingNumber && trackingNumber.includes('rickyz@psprop.net')) {
    console.log('Found rickyz@psprop.net in tracking number');
    return 'rickyz@psprop.net';
  }
  
  if (htmlContent) {
    const patterns = [
      /From:\s*(?:[^<\r\n]*?)<([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)>/i,
      /Reply-To:\s*(?:[^<\r\n]*?)<([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)>/i,
      /Reply-To:\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i,
      /Return-Path:\s*<([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)>/i,
      /envelope-from\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i,
      /email=([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i,
      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = htmlContent.match(pattern);
      if (match && match[1]) {
        console.log('Found email using pattern:', pattern, match[1]);
        return match[1];
      }
    }
  }
  
  return null;
};
