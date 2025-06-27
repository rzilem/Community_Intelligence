
/**
 * Browser detection utilities for PDF preview optimization
 */

export interface BrowserInfo {
  name: string;
  version: string;
  isChrome: boolean;
  isFirefox: boolean;
  isSafari: boolean;
  isEdge: boolean;
  supportsNativePdf: boolean;
}

export const detectBrowser = (): BrowserInfo => {
  const userAgent = navigator.userAgent;
  const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
  const isFirefox = /Firefox/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor);
  const isEdge = /Edg/.test(userAgent);

  // Extract version
  let version = 'unknown';
  if (isChrome) {
    const match = userAgent.match(/Chrome\/(\d+)/);
    version = match ? match[1] : 'unknown';
  } else if (isFirefox) {
    const match = userAgent.match(/Firefox\/(\d+)/);
    version = match ? match[1] : 'unknown';
  } else if (isEdge) {
    const match = userAgent.match(/Edg\/(\d+)/);
    version = match ? match[1] : 'unknown';
  }

  return {
    name: isChrome ? 'Chrome' : isFirefox ? 'Firefox' : isSafari ? 'Safari' : isEdge ? 'Edge' : 'Unknown',
    version,
    isChrome,
    isFirefox,
    isSafari,
    isEdge,
    supportsNativePdf: isChrome || isEdge || isFirefox
  };
};

export const getChromeSpecificConfig = () => {
  const browser = detectBrowser();
  
  if (!browser.isChrome) {
    return null;
  }

  return {
    // Chrome-specific PDF loading timeouts
    loadTimeout: 15000, // 15 seconds
    retryAttempts: 3,
    // Chrome's stricter CORS handling
    corsMode: 'no-cors' as RequestMode,
    // Chrome-specific iframe sandbox attributes
    sandboxAttributes: 'allow-same-origin allow-scripts allow-forms',
    // Chrome PDF plugin detection
    hasPdfPlugin: 'application/pdf' in navigator.mimeTypes,
    // Chrome version-specific behaviors
    requiresSignedUrls: parseInt(browser.version) >= 100
  };
};

export const logBrowserDiagnostics = () => {
  const browser = detectBrowser();
  const chromeConfig = getChromeSpecificConfig();
  
  console.group('🔍 Browser PDF Diagnostics');
  console.log('Browser:', browser);
  console.log('Chrome Config:', chromeConfig);
  console.log('PDF Plugin Available:', 'application/pdf' in navigator.mimeTypes);
  console.log('User Agent:', navigator.userAgent);
  console.groupEnd();
  
  return { browser, chromeConfig };
};
