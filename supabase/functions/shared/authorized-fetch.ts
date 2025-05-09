
/**
 * Utility for making authorized requests to Supabase Edge Functions
 */

// Standard CORS headers for Edge Functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Creates a fetch function that automatically includes authorization headers
 * @param serviceRoleKey - The Supabase service role key to use for authorization
 * @returns An authorized fetch function
 */
export function createAuthorizedFetch(serviceRoleKey: string) {
  if (!serviceRoleKey) {
    console.error("ERROR: Missing service role key for authorized fetch");
    throw new Error("Missing service role key for authorization");
  }

  /**
   * Make an authorized fetch request to another edge function
   * @param url The URL to fetch
   * @param options Fetch options (method, body, etc)
   * @returns Fetch response
   */
  return async function authorizedFetch(
    url: string | URL, 
    options: RequestInit = {}
  ): Promise<Response> {
    // Ensure we have an initialized headers object
    const headers = new Headers(options.headers || {});
    
    // Add authorization header if not present
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${serviceRoleKey}`);
      console.log(`Added Authorization header with Bearer token (length: ${serviceRoleKey.length})`);
    }
    
    // Set content type if not present and we have a JSON body
    if (!headers.has('Content-Type') && options.body && 
        (typeof options.body === 'object' || options.body.toString().startsWith('{'))) {
      headers.set('Content-Type', 'application/json');
    }

    // Create the final options with our headers
    const finalOptions: RequestInit = {
      ...options,
      headers
    };

    try {
      // Log the request we're about to make (without exposing full auth token)
      console.log(`Making authorized request to: ${url.toString()}`);
      console.log(`Request method: ${finalOptions.method || 'GET'}`);
      console.log(`Authorization header present: ${headers.has('Authorization')}`);
      
      // Make the actual fetch request
      const response = await fetch(url, finalOptions);
      
      // Log the response status
      console.log(`Response status from ${url.toString()}: ${response.status}`);
      
      // Log detailed info for error responses
      if (!response.ok) {
        console.error(`Error response from ${url.toString()}: ${response.status} ${response.statusText}`);
        
        // Special handling for 401 errors
        if (response.status === 401) {
          console.error(`AUTHENTICATION ERROR: Authorization header validation failed`);
          console.error(`Auth header format used: Bearer ${serviceRoleKey ? "[key exists]" : "[key missing]"}`);
          console.error(`Service Role Key length: ${serviceRoleKey?.length || 0}`);
          
          try {
            const errorText = await response.clone().text();
            console.error(`Error response body: ${errorText}`);
          } catch (e) {
            console.error(`Could not read error response body: ${e}`);
          }
        }
      }
      
      return response;
    } catch (error) {
      // Log detailed information about the error
      console.error(`Fetch error for ${url.toString()}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  };
}

/**
 * Test if the SUPABASE_SERVICE_ROLE_KEY is valid by making a simple authorized request
 * @param serviceRoleKey The service role key to test
 * @param supabaseUrl The Supabase project URL
 * @returns Test result with status and details
 */
export async function testAuthorization(serviceRoleKey: string, supabaseUrl: string): Promise<{
  valid: boolean;
  status?: number;
  message: string;
  details?: string;
}> {
  if (!serviceRoleKey) {
    return { 
      valid: false, 
      message: "Missing service role key",
      details: "The SUPABASE_SERVICE_ROLE_KEY environment variable is not set"
    };
  }

  if (!supabaseUrl) {
    return { 
      valid: false, 
      message: "Missing Supabase URL",
      details: "The SUPABASE_URL environment variable is not set"
    };
  }

  try {
    // First check if the key format looks valid (should be a JWT)
    if (!serviceRoleKey.includes('.') || serviceRoleKey.length < 30) {
      return {
        valid: false,
        message: "Service role key format is invalid",
        details: `The key does not appear to be in JWT format (length: ${serviceRoleKey.length})`
      };
    }

    // Try to make a simple authorized request to the auth API
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return {
        valid: true,
        status: response.status,
        message: "Authorization successful",
        details: "The service role key is valid and working correctly"
      };
    } else {
      let errorText;
      try {
        errorText = await response.text();
      } catch {
        errorText = "Could not read error response";
      }
      
      return {
        valid: false,
        status: response.status,
        message: `Authorization failed with status ${response.status}`,
        details: errorText
      };
    }
  } catch (error) {
    return {
      valid: false,
      message: "Authorization test failed with an exception",
      details: error instanceof Error ? error.message : String(error)
    };
  }
}
