
/**
 * Creates an authorized fetch function that includes Supabase service role authentication
 */
export function createAuthorizedFetch(serviceRoleKey: string) {
  return async function authorizedFetch(url: string | URL, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers || {});
    
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${serviceRoleKey}`);
    }
    
    if (!headers.has('Content-Type') && options.body && 
        (typeof options.body === 'string' && options.body.startsWith('{'))) {
      headers.set('Content-Type', 'application/json');
    }

    const finalOptions: RequestInit = {
      ...options,
      headers
    };

    return fetch(url, finalOptions);
  };
}
