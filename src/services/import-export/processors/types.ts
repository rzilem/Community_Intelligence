
import { ImportResult } from '@/types/import-types';

export interface ProcessorResult extends ImportResult {
  successfulImports: number;
}

export interface PropertyData {
  address: string;
  unit_number?: string;
  property_type: string;
  city?: string;
  state?: string;
  zip?: string;
  square_feet?: number;
  bedrooms?: number;
  bathrooms?: number;
  association_id: string;
}

export interface OwnerData {
  name: string;
  email?: string;
  phone?: string;
  move_in_date?: string;
  is_primary?: boolean;
  emergency_contact?: string;
  property_id?: string;
  resident_type: 'owner';
}

export interface PropertyProcessorResult {
  properties: Array<{ id: string; address: string; unit_number?: string }>;
  successCount: number;
  details: Array<{ status: 'success' | 'error' | 'warning'; message: string }>;
}
