
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
 * Now supports both header-based and query parameter authentication
 * 
 * @param request The incoming request object
 * @param expectedSecret The expected webhook secret
 * @returns Object with validation result and method used
 */
export function validateWebhookSecret(request: Request, expectedSecret?: string): { isValid: boolean; method?: string } {
  // If no secret is configured, we can't validate
  if (!expectedSecret) {
    console.warn("No webhook secret configured - running in insecure mode");
    return { isValid: false };
  }
  
  // First, check for token in query parameters (CloudMailin compatibility)
  const url = new URL(request.url);
  const queryToken = url.searchParams.get('token');
  
  if (queryToken) {
    const isValid = secureCompare(queryToken, expectedSecret);
    if (isValid) {
      return { isValid: true, method: 'query_parameter' };
    }
  }
  
  // Check headers for webhook signature/key
  const webhookKey = request.headers.get('x-webhook-key') || 
                     request.headers.get('webhook-signature') || 
                     request.headers.get('x-webhook-signature');
  
  if (webhookKey) {
    const isValid = secureCompare(webhookKey, expectedSecret);
    if (isValid) {
      return { isValid: true, method: 'webhook_header' };
    }
  }
  
  // Allow regular authorization header as fallback
  const authHeader = request.headers.get('authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const isValid = secureCompare(token, expectedSecret);
    if (isValid) {
      return { isValid: true, method: 'bearer_token' };
    }
  }
  
  return { isValid: false };
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
    'x-cloudmailin-signature',
    'cloudmailin-signature',
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
  
  // Add query parameter info
  const url = new URL(request.url);
  headers['has-query-token'] = url.searchParams.has('token') ? 'yes' : 'no';
  
  return {
    method: request.method,
    url: request.url,
    headers
  };
}
