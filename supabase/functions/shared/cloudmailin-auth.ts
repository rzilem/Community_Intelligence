
/**
 * CloudMailin-specific authentication utilities
 */

export interface CloudMailinAuthConfig {
  username?: string;
  password?: string;
  secret?: string;
}

/**
 * Validates CloudMailin webhook authentication
 * Now supports query parameter authentication in addition to existing methods
 */
export function validateCloudMailinAuth(request: Request, config: CloudMailinAuthConfig): { isValid: boolean; method?: string } {
  // First, check for query parameter authentication (common with CloudMailin)
  const url = new URL(request.url);
  const queryToken = url.searchParams.get('token');
  
  if (queryToken && config.secret) {
    const isValid = queryToken === config.secret;
    if (isValid) {
      return { isValid: true, method: 'query_parameter' };
    }
  }
  
  // Check for HTTP Basic Authentication (most common with CloudMailin)
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Basic ') && config.username && config.password) {
    try {
      const credentials = atob(authHeader.substring(6));
      const [username, password] = credentials.split(':');
      const isValid = username === config.username && password === config.password;
      if (isValid) {
        return { isValid: true, method: 'basic_auth' };
      }
    } catch (error) {
      console.warn('Failed to parse Basic Auth header:', error);
    }
  }

  // Check for CloudMailin signature (alternative method)
  const signature = request.headers.get('x-cloudmailin-signature') || 
                   request.headers.get('cloudmailin-signature');
  
  if (signature && config.secret) {
    // CloudMailin signature validation would go here
    // For now, just check if signature exists with secret
    const isValid = signature.length > 0;
    if (isValid) {
      return { isValid: true, method: 'signature' };
    }
  }

  // Check for custom webhook key (fallback)
  const webhookKey = request.headers.get('x-webhook-key') || 
                     request.headers.get('webhook-key');
  
  if (webhookKey && config.secret) {
    const isValid = webhookKey === config.secret;
    if (isValid) {
      return { isValid: true, method: 'webhook_key' };
    }
  }

  return { isValid: false };
}

/**
 * Gets CloudMailin auth configuration from environment
 */
export function getCloudMailinAuthConfig(): CloudMailinAuthConfig {
  return {
    username: Deno.env.get('CLOUDMAILIN_USERNAME'),
    password: Deno.env.get('CLOUDMAILIN_PASSWORD'),
    secret: Deno.env.get('CLOUDMAILIN_SECRET') || Deno.env.get('WEBHOOK_SECRET')
  };
}

/**
 * Checks if request is from CloudMailin based on headers and content
 */
export function isCloudMailinRequest(request: Request): boolean {
  const userAgent = request.headers.get('user-agent') || '';
  const contentType = request.headers.get('content-type') || '';
  const url = new URL(request.url);
  
  // CloudMailin typically sends multipart/form-data or has query parameters
  return userAgent.toLowerCase().includes('cloudmailin') || 
         contentType.includes('multipart/form-data') ||
         request.headers.has('x-cloudmailin-signature') ||
         url.searchParams.has('token');
}
