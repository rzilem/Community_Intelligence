
import { validateUUID, sanitizeInput, RateLimiter } from './validation-utils.ts';

// Rate limiter instance
const rateLimiter = new RateLimiter(100, 60000); // 100 requests per minute

/**
 * Security middleware for edge functions
 */
export class SecurityMiddleware {
  /**
   * Validate webhook signature using proper HMAC-SHA256
   */
  static async validateWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    if (!signature || !secret) {
      console.error('Missing webhook signature or secret');
      return false;
    }

    try {
      // Import WebCrypto API for secure HMAC validation
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);
      const payloadData = encoder.encode(payload);

      // Import the secret as a cryptographic key
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      // Generate HMAC signature
      const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, payloadData);
      
      // Convert to hex string
      const hashArray = Array.from(new Uint8Array(signatureBuffer));
      const expectedSignature = 'sha256=' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Constant-time comparison to prevent timing attacks
      return this.secureCompare(signature, expectedSignature);
    } catch (error) {
      console.error('Webhook signature validation failed:', error);
      return false;
    }
  }

  /**
   * Secure constant-time string comparison
   */
  static secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }

  /**
   * Rate limiting check
   */
  static checkRateLimit(identifier: string): boolean {
    return rateLimiter.isAllowed(identifier);
  }

  /**
   * Validate request headers for security
   */
  static validateHeaders(request: Request): { valid: boolean; error?: string } {
    const contentType = request.headers.get('content-type');
    
    // Check for required content type for POST requests
    if (request.method === 'POST' && !contentType?.includes('application/json')) {
      return { valid: false, error: 'Invalid content type' };
    }

    // Check for suspicious headers
    const userAgent = request.headers.get('user-agent');
    if (!userAgent || userAgent.length < 5) {
      return { valid: false, error: 'Invalid user agent' };
    }

    return { valid: true };
  }

  /**
   * Sanitize request body
   */
  static sanitizeRequestBody(body: any): any {
    if (typeof body === 'string') {
      return sanitizeInput(body);
    }

    if (Array.isArray(body)) {
      return body.map(item => this.sanitizeRequestBody(item));
    }

    if (typeof body === 'object' && body !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(body)) {
        const sanitizedKey = sanitizeInput(key);
        sanitized[sanitizedKey] = this.sanitizeRequestBody(value);
      }
      return sanitized;
    }

    return body;
  }

  /**
   * Log security events
   */
  static logSecurityEvent(
    event: 'rate_limit_exceeded' | 'invalid_signature' | 'invalid_headers' | 'suspicious_activity',
    details: Record<string, any> = {}
  ): void {
    console.warn(`Security Event: ${event}`, {
      timestamp: new Date().toISOString(),
      ...details
    });
  }

  /**
   * Create security response headers
   */
  static getSecurityHeaders(): Headers {
    const headers = new Headers();
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-XSS-Protection', '1; mode=block');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Content-Security-Policy', "default-src 'self'");
    return headers;
  }
}
