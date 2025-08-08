// Ambient module declaration to prevent TS compile errors when Supabase types are unavailable
// This provides a minimal fallback so the app can start. Replace with generated types when available.
declare module '@/integrations/supabase/types' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type Database = any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type Json = any;
}
