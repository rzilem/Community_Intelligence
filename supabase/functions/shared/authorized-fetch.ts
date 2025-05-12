
/**
 * Creates a fetch function with authorization header
 * 
 * @param serviceRoleKey Supabase service role key for authorization
 * @returns Fetch function with authorization header
 */
export function createAuthorizedFetch(serviceRoleKey: string) {
  return async function authorizedFetch(url: string | URL, options: RequestInit = {}): Promise<Response> {
    // Ensure headers exists
    const headers = new Headers(options.headers || {});
    
    // Add authorization header if not present
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${serviceRoleKey}`);
    }
    
    // Set content type if not present and we have a JSON body
    if (!headers.has('Content-Type') && options.body && 
        (typeof options.body === 'object' || 
         (typeof options.body === 'string' && options.body.startsWith('{')))) {
      headers.set('Content-Type', 'application/json');
    }

    // Create the final options with our headers
    const finalOptions: RequestInit = {
      ...options,
      headers
    };

    console.log(`Making authorized request to: ${url.toString()}`);
    
    return fetch(url, finalOptions);
  };
}
