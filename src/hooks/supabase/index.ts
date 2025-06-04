
// Re-export all Supabase hooks for easy importing
export * from './use-supabase-query';
export * from './use-supabase-create';
export * from './use-supabase-update';
export * from './use-supabase-delete';
export * from './supabase-utils';

// For backward compatibility
export { useSupabaseQuery } from './use-supabase-query';
export { useSupabaseCreate } from './use-supabase-create';
export { useSupabaseUpdate } from './use-supabase-update';
export { useSupabaseDelete } from './use-supabase-delete';
