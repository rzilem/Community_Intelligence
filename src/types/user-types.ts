
import { Profile } from './profile-types';

export interface UserWithProfile {
  id: string;
  email: string;
  created_at: string;
  profile?: Profile;  
}

// Update UserRole to include 'accountant'
export type UserRole = 'admin' | 'manager' | 'resident' | 'maintenance' | 'accountant' | 'user';
