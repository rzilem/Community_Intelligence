
import { Property, PropertyRecord } from '@/types/property-types';

/**
 * Convert a raw PropertyRecord from Supabase into the application's Property type.
 */
export const mapPropertyRecord = (record: PropertyRecord): Property => ({
  id: record.id,
  association_id: record.association_id ?? '',
  address: record.address,
  unit_number: record.unit_number ?? undefined,
  city: record.city ?? undefined,
  state: record.state ?? undefined,
  zip: record.zip ?? record.zip_code ?? undefined,
  property_type: record.property_type ?? '',
  bedrooms: record.bedrooms ?? undefined,
  bathrooms: record.bathrooms ?? undefined,
  square_feet: record.square_feet ?? record.square_footage ?? undefined,
  created_at: record.created_at ?? new Date().toISOString(),
  updated_at: record.updated_at ?? new Date().toISOString(),
  image_url: record.image_url ?? undefined
});
