
// Environment variables helper to handle both Vite and Node.js environments
export const env = {
  // Supabase configuration
  SUPABASE_URL: import.meta.env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '',
  
  // OpenAI configuration
  OPENAI_API_KEY: import.meta.env?.VITE_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || '',
  
  // App configuration
  NODE_ENV: import.meta.env?.MODE || process.env.NODE_ENV || 'development',
  PROD: import.meta.env?.PROD || process.env.NODE_ENV === 'production',
  DEV: import.meta.env?.DEV || process.env.NODE_ENV === 'development',
  
  // API endpoints
  API_URL: import.meta.env?.VITE_API_URL || process.env.VITE_API_URL || '/api',
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
