
import { Profile } from './profile-types';

export interface UserWithProfile {
  id: string;
  email: string;
  created_at: string;
  profile?: Profile;  
}

// Add UserRole type to match our new enum
export type UserRole = 'admin' | 'manager' | 'resident' | 'maintenance' | 'accountant' | 'user';
