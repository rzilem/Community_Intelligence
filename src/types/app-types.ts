
export * from './profile-types';
export * from './association-types';
export * from './property-types';
export * from './resident-types';
export * from './compliance-types';
export * from './amenity-types';
export * from './maintenance-types';
export * from './assessment-types';

// Any other types that might be missing
export interface Amenity {
  id: string;
  name: string;
  description?: string;
  association_id: string;
  capacity?: number;
  booking_fee?: number;
  requires_approval?: boolean;
  availability_hours?: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRequest {
  id: string;
  association_id: string;
  property_id: string;
  resident_id?: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'open' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  resolved_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ResidentWithProfile {
  id: string;
  property_id: string;
  user_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  resident_type: string;
  emergency_contact?: string;
  is_primary?: boolean;
  move_in_date?: string;
  move_out_date?: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Property {
  id: string;
  association_id: string;
  address: string;
  unit_number?: string;
  city?: string;
  state?: string;
  zip?: string;
  property_type: string;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  created_at: string;
  updated_at: string;
}

export interface Compliance {
  id: string;
  association_id: string;
  property_id: string;
  resident_id?: string;
  violation_type: string;
  description?: string;
  status: 'open' | 'in-progress' | 'resolved' | 'escalated';
  fine_amount?: number;
  due_date?: string;
  resolved_date?: string;
  created_at?: string;
  updated_at?: string;
}

export type ResidentType = 'owner' | 'tenant' | 'other';

export interface Resident {
  id: string;
  property_id?: string;
  user_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  resident_type: string;
  emergency_contact?: string;
  is_primary?: boolean;
  move_in_date?: string;
  move_out_date?: string;
  created_at: string;
  updated_at: string;
}
