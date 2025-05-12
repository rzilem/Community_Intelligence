
/**
 * Shared webhook authentication utilities for external webhook services
 */

// Simple constant-time string comparison to prevent timing attacks
export function secureCompare(a: string, b: string): boolean {
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
 * Validates an incoming webhook request using a configured secret
 * 
 * @param request The incoming request object
 * @param expectedSecret The expected webhook secret
 * @returns Boolean indicating if the webhook is valid
 */
export function validateWebhookSecret(request: Request, expectedSecret?: string): boolean {
  // If no secret is configured, we can't validate
  if (!expectedSecret) {
    console.warn("No webhook secret configured - running in insecure mode");
    return true;
  }
  
  // Check headers for webhook signature/key
  const webhookKey = request.headers.get('x-webhook-key') || 
                     request.headers.get('webhook-signature') || 
                     request.headers.get('x-webhook-signature');
  
  // Allow regular authorization header as fallback
  const authHeader = request.headers.get('authorization');
  
  if (webhookKey) {
    return secureCompare(webhookKey, expectedSecret);
  } else if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return secureCompare(token, expectedSecret);
  }
  
  return false;
}

/**
 * Creates enhanced logging headers from a request
 */
export function getRequestLogInfo(request: Request): Record<string, any> {
  const headers: Record<string, string> = {};
  const relevantHeaders = [
    'content-type', 
    'user-agent', 
    'x-webhook-key',
    'webhook-signature', 
    'x-webhook-signature',
    'x-forwarded-for'
  ];
  
  // Extract relevant headers for logging
  relevantHeaders.forEach(header => {
    const value = request.headers.get(header);
    if (value) {
      headers[header] = value;
    }
  });
  
  // Add authorization presence flag without exposing actual token
  headers['has-authorization'] = request.headers.has('authorization') ? 'yes' : 'no';
  
  return {
    method: request.method,
    url: request.url,
    headers
  };
}
