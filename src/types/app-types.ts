
export * from './profile-types';
export * from './association-types';
export * from './property-types';
export * from './resident-types';
export * from './compliance-types';

// Define and export additional types that might be missing
export interface Amenity {
  id: string;
  name: string;
  description?: string;
  association_id: string;
  capacity?: number;
  availability_hours?: string;
  created_at: string;
  updated_at: string;
}

export interface Assessment {
  id: string;
  association_id: string;
  property_id: string;
  amount: number;
  due_date: string;
  assessment_type: AssessmentType;
  status: 'paid' | 'unpaid' | 'partial' | 'late';
  created_at: string;
  updated_at: string;
}

export type AssessmentType = 'monthly' | 'quarterly' | 'annual' | 'special';

export interface MaintenanceRequest {
  id: string;
  association_id: string;
  property_id: string;
  resident_id?: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'open' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}
