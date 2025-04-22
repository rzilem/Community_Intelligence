
/// <reference types="@supabase/supabase-js" />

declare module "@supabase/supabase-js" {
  interface FunctionsClient {
    invoke<T = any>(
      functionName: string,
      options?: {
        method?: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';
        body?: any;
        headers?: Record<string, string>;
        fetchOptions?: Record<string, any>;
        responseType?: 'json' | 'text' | 'arrayBuffer' | 'blob';
      }
    ): Promise<{ data: T | null; error: Error | null }>;
  }
}
