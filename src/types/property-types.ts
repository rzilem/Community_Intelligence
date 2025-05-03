
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
  created_at: string; // Making this required to match app-types.ts
  updated_at: string; // Making this required to match app-types.ts
  image_url?: string; // Add image_url field
}
