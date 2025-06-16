
// Define property-related types

export type PropertyType = 'single-family' | 'townhouse' | 'condo' | 'apartment' | 'single_family';
export type PropertyStatus = 'occupied' | 'vacant' | 'pending' | 'delinquent';

export interface PropertyUI {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  sqFt: number;
  association: string;
  associationId: string;
  status: PropertyStatus;
  ownerName?: string;
}

export interface Property {
  id: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  property_type: string;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  association_id: string;
  unit_number?: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
}

// Raw property record as returned from Supabase
import type { Database } from '@/integrations/supabase/types';

export type PropertyRecord =
  Database['public']['Tables']['properties']['Row'] & {
    zip?: string | null;
    square_feet?: number | null;
    image_url?: string | null;
  };
