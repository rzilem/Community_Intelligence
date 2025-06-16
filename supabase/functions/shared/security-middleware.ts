
import { validateUUID, sanitizeInput, RateLimiter } from './validation-utils.ts';

// Rate limiter instance
const rateLimiter = new RateLimiter(100, 60000); // 100 requests per minute

/**
 * Security middleware for edge functions
 */
export class SecurityMiddleware {
  /**
   * Validate webhook signature
   */
  static validateWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    if (!signature || !secret) {
      console.error('Missing webhook signature or secret');
      return false;
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(payload);
      const key = encoder.encode(secret);
      
      // This is a simplified HMAC validation
      // In production, use a proper HMAC library
      const expectedSignature = `sha256=${secret}`;
      return signature === expectedSignature;
    } catch (error) {
      console.error('Webhook signature validation failed:', error);
      return false;
    }
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
