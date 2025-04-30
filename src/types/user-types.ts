
import { Profile } from './profile-types';

export interface UserWithProfile {
  id: string;
  email: string;
  created_at: string;
  profile: Profile;  // Changed from optional to required to match profile-types.ts
}
