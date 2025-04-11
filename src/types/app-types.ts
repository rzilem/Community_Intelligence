
import type { Database } from '@/integrations/supabase/types';
import { Association } from './association-types';

// Get strongly typed references to tables
export type Tables = Database['public']['Tables'];

// Define HOA type alias for backward compatibility
export type HOA = Association;

// Re-export all types from domain-specific files
export * from './profile-types';
export * from './association-types';
export * from './property-types';
export * from './resident-types'; // Add this new export
export * from './assessment-types';
export * from './maintenance-types';
export * from './compliance-types';
export * from './amenity-types';
export * from './calendar-types';
export * from './communication-types';
export * from './document-types';
export * from './vendor-types';
export * from './import-types';
export * from './lead-types';
export * from './onboarding-types';
export * from './proposal-types';
export * from './email-types';
export * from './analytics-types';
export * from './invoice-types';
export * from './resale-types';
export * from './resale-event-types';

