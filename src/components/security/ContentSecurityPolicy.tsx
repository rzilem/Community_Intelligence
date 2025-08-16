import React from 'react';

interface ContentSecurityPolicyProps {
  isDevelopment?: boolean;
}

export const ContentSecurityPolicy: React.FC<ContentSecurityPolicyProps> = ({ 
  isDevelopment = false 
}) => {
  // Development CSP is more relaxed for hot reloading
  const devCSP = `
    default-src 'self' 'unsafe-inline' 'unsafe-eval' ws: wss: data: blob:;
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.qrserver.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: blob: https: http:;
    connect-src 'self' ws: wss: https: http:;
    media-src 'self' blob: data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
  `.replace(/\s+/g, ' ').trim();

  // Production CSP is strict and secure
  const prodCSP = `
    default-src 'self';
    script-src 'self' https://api.qrserver.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: blob: https://cahergndkwfqltxyikyr.supabase.co https://api.qrserver.com;
    connect-src 'self' https://cahergndkwfqltxyikyr.supabase.co wss://cahergndkwfqltxyikyr.supabase.co;
    media-src 'self' blob: data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s+/g, ' ').trim();

  const cspValue = isDevelopment ? devCSP : prodCSP;

  return (
    <meta 
      httpEquiv="Content-Security-Policy" 
      content={cspValue}
    />
  );
};

// Security headers for production
export const getSecurityHeaders = (isDevelopment = false) => {
  if (isDevelopment) {
    return {}; // No security headers in development
  }

  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  };
};