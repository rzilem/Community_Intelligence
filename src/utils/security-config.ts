/**
 * Application security configuration
 */

// Content Security Policy configuration
export const CSP_CONFIG = {
  directives: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'", 
      "'unsafe-inline'", // Required for React development
      "'unsafe-eval'", // Required for development build
      "https://api.openai.com",
      "https://cahergndkwfqltxyikyr.supabase.co"
    ],
    'style-src': [
      "'self'", 
      "'unsafe-inline'", // Required for CSS-in-JS libraries
      "https://fonts.googleapis.com"
    ],
    'img-src': [
      "'self'", 
      "data:", 
      "blob:",
      "https://cahergndkwfqltxyikyr.supabase.co",
      "https://*.supabase.co"
    ],
    'font-src': [
      "'self'", 
      "https://fonts.gstatic.com"
    ],
    'connect-src': [
      "'self'",
      "https://api.openai.com",
      "https://cahergndkwfqltxyikyr.supabase.co",
      "wss://cahergndkwfqltxyikyr.supabase.co"
    ],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': []
  }
};

// Generate CSP header string
export const generateCSPHeader = (): string => {
  return Object.entries(CSP_CONFIG.directives)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
};

// Security headers configuration
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': generateCSPHeader()
};

// Input validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]{10,}$/,
  alphanumeric: /^[a-zA-Z0-9\s]*$/,
  noSpecialChars: /^[a-zA-Z0-9\s\-._]*$/,
  safeFilename: /^[a-zA-Z0-9\s\-._()]{1,255}$/
};

// Rate limiting configuration
export const RATE_LIMITS = {
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // requests per window
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // login attempts per window
  },
  upload: {
    windowMs: 60 * 1000, // 1 minute
    max: 10 // uploads per minute
  }
};

// Dangerous file extensions
export const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.vbe', '.js', '.jse',
  '.ws', '.wsf', '.wsc', '.wsh', '.ps1', '.ps1xml', '.ps2', '.ps2xml', '.psc1',
  '.psc2', '.msh', '.msh1', '.msh2', '.mshxml', '.msh1xml', '.msh2xml', '.scf',
  '.lnk', '.inf', '.reg', '.doc', '.xls', '.ppt', '.docm', '.dotm', '.xlsm',
  '.xltm', '.xlam', '.pptm', '.potm', '.ppam', '.ppsm', '.sldm'
];

// Session security configuration
export const SESSION_CONFIG = {
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  secure: true, // HTTPS only
  httpOnly: true, // No client-side access
  sameSite: 'strict' as const
};

// Password policy
export const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventPersonalInfo: true
};

// API security configuration
export const API_SECURITY = {
  corsOrigins: [
    'http://localhost:3000',
    'https://cahergndkwfqltxyikyr.supabase.co'
  ],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  maxRequestSize: 10 * 1024 * 1024 // 10MB
};