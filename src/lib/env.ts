

// Environment variables helper for Vite frontend environment
export const env = {
  // Supabase configuration with fallback values
  SUPABASE_URL: import.meta.env?.VITE_SUPABASE_URL || 'https://cahergndkwfqltxyikyr.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhaGVyZ25ka3dmcWx0eHlpa3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwOTUzMTYsImV4cCI6MjA1OTY3MTMxNn0.n_tRSJy3M9IaiyrhG02kpvko-pWd6XyYs4khDauxRGQ',
  
  // OpenAI configuration
  OPENAI_API_KEY: import.meta.env?.VITE_OPENAI_API_KEY || '',
  
  // App configuration
  NODE_ENV: import.meta.env?.MODE || 'development',
  PROD: import.meta.env?.PROD || false,
  DEV: import.meta.env?.DEV || true,
  
  // API endpoints
  API_URL: import.meta.env?.VITE_API_URL || '/api',
};

// Validation helper
export const validateEnv = () => {
  const requiredVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  const missing = requiredVars.filter(key => !env[key as keyof typeof env]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  return true;
};

// Development helper
export const logEnvStatus = () => {
  if (env.DEV) {
    console.log('Environment Status:', {
      NODE_ENV: env.NODE_ENV,
      SUPABASE_URL: env.SUPABASE_URL ? '✅ Set' : '❌ Missing',
      SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
      OPENAI_API_KEY: env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing',
    });
  }
};

