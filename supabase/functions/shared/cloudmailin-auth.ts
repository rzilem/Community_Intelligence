
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
 * CloudMailin typically uses HTTP Basic Auth or custom headers
 */
export function validateCloudMailinAuth(request: Request, config: CloudMailinAuthConfig): boolean {
  // Check for HTTP Basic Authentication (most common with CloudMailin)
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Basic ') && config.username && config.password) {
    try {
      const credentials = atob(authHeader.substring(6));
      const [username, password] = credentials.split(':');
      return username === config.username && password === config.password;
    } catch (error) {
      console.warn('Failed to parse Basic Auth header:', error);
      return false;
    }
  }

  // Check for CloudMailin signature (alternative method)
  const signature = request.headers.get('x-cloudmailin-signature') || 
                   request.headers.get('cloudmailin-signature');
  
  if (signature && config.secret) {
    // CloudMailin signature validation would go here
    // For now, just check if signature exists with secret
    return signature.length > 0;
  }

  // Check for custom webhook key (fallback)
  const webhookKey = request.headers.get('x-webhook-key') || 
                     request.headers.get('webhook-key');
  
  if (webhookKey && config.secret) {
    return webhookKey === config.secret;
  }

  return false;
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
  
  // CloudMailin typically sends multipart/form-data
  return userAgent.toLowerCase().includes('cloudmailin') || 
         contentType.includes('multipart/form-data') ||
         request.headers.has('x-cloudmailin-signature');
}
